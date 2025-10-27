import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  identifierType,
  validateEmail,
  validatePhonePeru,
  generateOTP,
  getOTPExpiration,
  cleanPhone,
} from '@/lib/validations';

const MAX_ATTEMPTS_PER_HOUR = 3;

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Se requiere email o teléfono' },
        { status: 400 }
      );
    }

    // Validar el tipo de identificador
    const type = identifierType(identifier);

    if (type === 'invalid') {
      return NextResponse.json(
        {
          success: false,
          error: 'Email o teléfono inválido. El teléfono debe tener 9 dígitos y empezar con 9.',
        },
        { status: 400 }
      );
    }

    // Normalizar el identificador
    const normalizedIdentifier =
      type === 'phone' ? cleanPhone(identifier) : identifier.toLowerCase().trim();

    const supabase = await createClient();

    // Verificar límite de intentos en la última hora
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { data: recentAttempts, error: attemptsError } = await supabase
      .from('otp_codes')
      .select('id')
      .eq('identifier', normalizedIdentifier)
      .gte('created_at', oneHourAgo.toISOString());

    if (attemptsError) {
      console.error('Error al verificar intentos:', attemptsError);
      return NextResponse.json(
        { success: false, error: 'Error al verificar intentos' },
        { status: 500 }
      );
    }

    if (recentAttempts && recentAttempts.length >= MAX_ATTEMPTS_PER_HOUR) {
      return NextResponse.json(
        {
          success: false,
          error: 'Has excedido el límite de intentos. Por favor, intenta más tarde.',
        },
        { status: 429 }
      );
    }

    // Generar código OTP
    const code = generateOTP();
    const expiresAt = getOTPExpiration(5); // 5 minutos

    // Guardar OTP en la base de datos
    const { error: insertError } = await supabase.from('otp_codes').insert({
      identifier: normalizedIdentifier,
      code,
      expires_at: expiresAt.toISOString(),
      attempts: 0,
      verified: false,
    } as never);

    if (insertError) {
      console.error('Error al guardar OTP:', insertError);
      return NextResponse.json(
        { success: false, error: 'Error al generar código de verificación' },
        { status: 500 }
      );
    }

    // En modo desarrollo, mostrar el código en la consola
    console.log('─────────────────────────────────────');
    console.log('🔐 CÓDIGO OTP GENERADO (Modo Dev)');
    console.log('─────────────────────────────────────');
    console.log(`Identificador: ${normalizedIdentifier}`);
    console.log(`Tipo: ${type === 'email' ? 'Email' : 'Teléfono'}`);
    console.log(`Código: ${code}`);
    console.log(`Expira: ${expiresAt.toLocaleString('es-PE')}`);
    console.log('─────────────────────────────────────');

    // En producción, aquí se enviaría el OTP por SMS o email
    // if (type === 'email') {
    //   await sendEmailOTP(normalizedIdentifier, code);
    // } else {
    //   await sendSMSOTP(normalizedIdentifier, code);
    // }

    return NextResponse.json({
      success: true,
      identifier: normalizedIdentifier,
      identifier_type: type,
      expires_at: expiresAt.toISOString(),
      message:
        type === 'email'
          ? 'Código enviado a tu email'
          : 'Código enviado por SMS',
    });
  } catch (error) {
    console.error('Error en send-otp:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
