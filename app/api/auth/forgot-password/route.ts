import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { identifierType, validateEmail, validatePhonePeru, cleanPhone } from "@/lib/validations";
import type { APIResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Identificador requerido" } as APIResponse,
        { status: 400 }
      );
    }

    const type = identifierType(identifier);

    if (type === "invalid") {
      return NextResponse.json(
        {
          success: false,
          error: "Por favor, ingresa un email válido o un teléfono de 9 dígitos que empiece con 9"
        } as APIResponse,
        { status: 400 }
      );
    }

    const supabase = await createClient();
    let email = "";

    if (type === "email") {
      email = identifier;
    } else if (type === "phone") {
      const cleanedPhone = cleanPhone(identifier);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("phone", cleanedPhone)
        .maybeSingle();

      if (profileError) {
        console.error("Error buscando perfil por teléfono:", profileError);
      }

      if (profile?.email) {
        email = profile.email;
      } else {
        return NextResponse.json(
          {
            success: true,
            message: "Si existe una cuenta con este identificador, se ha enviado un enlace de recuperación.",
          } as APIResponse,
          { status: 200 }
        );
      }
    }

    if (!email) {
      return NextResponse.json(
        {
          success: true,
          message: "Si existe una cuenta con este identificador, se ha enviado un enlace de recuperación.",
        } as APIResponse,
        { status: 200 }
      );
    }

    const redirectTo = new URL(
      "/update-password",
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    ).toString();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      console.error("Error en resetPasswordForEmail:", error);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Si existe una cuenta con este identificador, se ha enviado un enlace de recuperación.",
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en /api/auth/forgot-password:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" } as APIResponse,
      { status: 500 }
    );
  }
}
