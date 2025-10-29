import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { validateOTP, identifierType, cleanPhone } from "@/lib/validations";
import type { Database } from "@/lib/supabase/database.types";
import type { PostgrestError } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { identifier, code } = await request.json();

    if (!identifier || !code) {
      return NextResponse.json(
        { success: false, error: "Se requiere identificador y código" },
        { status: 400 }
      );
    }
    if (!validateOTP(code)) {
      return NextResponse.json(
        { success: false, error: "Código OTP debe tener 6 dígitos" },
        { status: 400 }
      );
    }

    const type = identifierType(identifier);
    if (type === "invalid") {
      return NextResponse.json(
        { success: false, error: "Identificador inválido" },
        { status: 400 }
      );
    }

    const normalizedIdentifier =
      type === "phone"
        ? "+51" + cleanPhone(identifier)
        : identifier.toLowerCase().trim();

    const supabase = await createClient();

    let sessionResponse;
    if (type === "email") {
      sessionResponse = await supabase.auth.verifyOtp({
        email: normalizedIdentifier,
        token: code,
        type: "email",
      });
    } else {
      sessionResponse = await supabase.auth.verifyOtp({
        phone: normalizedIdentifier,
        token: code,
        type: "sms",
      });
    }

    const { data: sessionData, error: verifyError } = sessionResponse;

    if (verifyError) {
      console.error(
        `Error de Supabase al verificar OTP para ${normalizedIdentifier} (${type}):`,
        verifyError
      );
      const errorMessage = "Código incorrecto, expirado o ya utilizado.";
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    if (!sessionData?.user) {
      console.error(
        "VerifyOtp exitoso pero sessionData.user es null o undefined"
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "Error inesperado al obtener datos de usuario tras verificar OTP",
        },
        { status: 500 }
      );
    }
    const userId = sessionData.user.id;

    const { data: existingProfile, error: profileError } = (await supabase
      .from("profiles")
      .select("id, user_type")
      .eq("id", userId)
      .single()) as {
      data: Pick<
        Database["public"]["Tables"]["profiles"]["Row"],
        "id" | "user_type"
      > | null;
      error: PostgrestError | null;
    };

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error al buscar perfil post-verificación:", profileError);
      return NextResponse.json(
        { success: false, error: "Error al buscar datos del perfil" },
        { status: 500 }
      );
    }

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        user_exists: true,
        user_id: existingProfile.id,
        user_type: existingProfile.user_type,
        requires_registration: false,
        message: "Sesión iniciada correctamente",
      });
    } else {
      return NextResponse.json({
        success: true,
        user_exists: false,
        requires_registration: true,
        identifier: normalizedIdentifier,
        identifier_type: type,
        message: "Código verificado. Completa tu registro.",
        user_id_for_registration: userId,
      });
    }
  } catch (error) {
    console.error("Error general en verify-otp:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor al verificar código",
      },
      { status: 500 }
    );
  }
}
