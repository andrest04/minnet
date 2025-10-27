import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { validateOTP, isOTPExpired, cleanPhone } from '@/lib/validations';
import type { Database } from '@/lib/supabase/database.types';
import type { PostgrestError } from '@supabase/supabase-js';

const MAX_OTP_ATTEMPTS = 3;

export async function POST(request: NextRequest) {
  try {
    const { identifier, code } = await request.json();

    if (!identifier || !code) {
      return NextResponse.json(
        { success: false, error: 'Se requiere identificador y código' },
        { status: 400 }
      );
    }

    if (!validateOTP(code)) {
      return NextResponse.json(
        { success: false, error: 'Código OTP debe tener 6 dígitos' },
        { status: 400 }
      );
    }

    // Normalizar el identificador (igual que en send-otp)
    const normalizedIdentifier = identifier.includes('@')
      ? identifier.toLowerCase().trim()
      : cleanPhone(identifier);

    const supabase = await createClient();

    // Buscar el OTP más reciente para este identificador que no esté verificado
    const { data: otpRecords, error: selectError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('identifier', normalizedIdentifier)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (selectError) {
      console.error('Error al buscar OTP:', selectError);
      return NextResponse.json(
        { success: false, error: 'Error al verificar código' },
        { status: 500 }
      );
    }

    if (!otpRecords || otpRecords.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No se encontró un código de verificación. Por favor, solicita uno nuevo.',
        },
        { status: 404 }
      );
    }

    const otpRecord: Database['public']['Tables']['otp_codes']['Row'] = otpRecords[0];

    // Verificar si el OTP ha expirado
    if (isOTPExpired(otpRecord.expires_at)) {
      return NextResponse.json(
        {
          success: false,
          error: 'El código ha expirado. Por favor, solicita uno nuevo.',
        },
        { status: 400 }
      );
    }

    // Verificar número de intentos
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      return NextResponse.json(
        {
          success: false,
          error: 'Has excedido el número de intentos. Por favor, solicita un nuevo código.',
        },
        { status: 400 }
      );
    }

    // Verificar si el código es correcto
    if (otpRecord.code !== code) {
      // Incrementar intentos
      await supabase
        .from('otp_codes')
        .update({ attempts: otpRecord.attempts + 1 } as never)
        .eq('id', otpRecord.id);

      const remainingAttempts = MAX_OTP_ATTEMPTS - (otpRecord.attempts + 1);

      return NextResponse.json(
        {
          success: false,
          error: `Código incorrecto. Te quedan ${remainingAttempts} intentos.`,
        },
        { status: 400 }
      );
    }

    // Código correcto - marcar como verificado
    await supabase
      .from('otp_codes')
      .update({ verified: true } as never)
      .eq('id', otpRecord.id);

    // Verificar si el usuario ya existe en la base de datos
    const identifierColumn = identifier.includes('@') ? 'email' : 'phone';
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_type')
      .eq(identifierColumn, normalizedIdentifier)
      .single() as {
        data: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'user_type'> | null;
        error: PostgrestError | null;
      };

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error al buscar perfil:', profileError);
      return NextResponse.json(
        { success: false, error: 'Error al verificar usuario' },
        { status: 500 }
      );
    }

    // Si el usuario existe, iniciar sesión
    if (existingProfile) {
      // Aquí crearías una sesión real con Supabase Auth
      // Por ahora solo retornamos la información
      return NextResponse.json({
        success: true,
        user_exists: true,
        user_id: existingProfile.id,
        user_type: existingProfile.user_type,
        requires_registration: false,
        message: 'Código verificado correctamente',
      });
    }

    // Si no existe, indicar que debe registrarse
    return NextResponse.json({
      success: true,
      user_exists: false,
      requires_registration: true,
      identifier: normalizedIdentifier,
      identifier_type: identifier.includes('@') ? 'email' : 'phone',
      message: 'Código verificado. Por favor, completa tu registro.',
    });
  } catch (error) {
    console.error('Error en verify-otp:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
