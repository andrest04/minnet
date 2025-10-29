import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { identifierType, cleanPhone } from "@/lib/validations";
import { AuthOtpResponse } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Se requiere email o teléfono" },
        { status: 400 }
      );
    }

    const type = identifierType(identifier);
    if (type === "invalid") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Email o teléfono inválido. El teléfono debe tener 9 dígitos y empezar con 9.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    let response: AuthOtpResponse;
    let normalizedIdentifier: string;
    let successMessage: string;

    if (type === "email") {
      normalizedIdentifier = identifier.toLowerCase().trim();
      response = await supabase.auth.signInWithOtp({
        email: normalizedIdentifier,
      });
      successMessage = "Código enviado a tu email";
    } else {
      normalizedIdentifier = "+51" + cleanPhone(identifier);
      console.log("Intentando enviar OTP a teléfono:", normalizedIdentifier);
      response = await supabase.auth.signInWithOtp({
        phone: normalizedIdentifier,
      });
      successMessage = "Código enviado por SMS";
    }

    if (response.error) {
      console.error(
        `Error de Supabase al enviar OTP (${type}):`,
        response.error
      );
      let errorMessage =
        response.error.message || "Error al enviar código de verificación";
      let status = response.error.status || 500;

      if (errorMessage.includes("rate limit")) {
        errorMessage = "Has excedido el límite de intentos. Intenta más tarde.";
        status = 429;
      } else if (errorMessage.includes("valid phone number")) {
        errorMessage =
          "Número de teléfono inválido. Asegúrate que tenga 9 dígitos y empiece con 9.";
        status = 400;
      } else if (status === 500) {
        errorMessage = "Error interno al enviar el código. Intenta de nuevo.";
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status }
      );
    }

    console.log(`Supabase envió OTP a ${normalizedIdentifier} (${type})`);

    return NextResponse.json({
      success: true,
      identifier: normalizedIdentifier,
      identifier_type: type,
      message: successMessage,
    });
  } catch (error: unknown) {
    console.error("Error general en send-otp:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor al procesar la solicitud",
      },
      { status: 500 }
    );
  }
}
