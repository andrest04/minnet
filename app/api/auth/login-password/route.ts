import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { identifierType, cleanPhone } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Email/teléfono y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const type = identifierType(identifier);
    if (type === "invalid") {
      return NextResponse.json(
        { success: false, error: "Email o teléfono inválido" },
        { status: 400 }
      );
    }

    const normalizedIdentifier =
      type === "phone"
        ? `${cleanPhone(identifier)}@minnet.placeholder`
        : identifier.toLowerCase().trim();

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedIdentifier,
      password,
    });
    if (error) {
      console.error("Error al iniciar sesión:", error);

      // Detectar si el error es por falta de contraseña configurada
      if (error.message.includes("Invalid login credentials")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Credenciales incorrectas. Si creaste tu cuenta con OTP, primero debes configurar una contraseña desde tu perfil o usa el login con código OTP.",
            needsPasswordSetup: true,
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Error al iniciar sesión" },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, error: "No se pudo obtener datos del usuario" },
        { status: 500 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", data.user.id)
      .maybeSingle<{ user_type: string }>();

    if (profileError) {
      console.error("Error al obtener perfil:", profileError);
      return NextResponse.json(
        { success: false, error: "Error al obtener datos del perfil" },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: "Tu cuenta no tiene un perfil completo. Por favor, completa el proceso de registro.",
          needsRegistration: true,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user_id: data.user.id,
      user_type: profile.user_type,
      message: "Inicio de sesión exitoso",
    });
  } catch (error) {
    console.error("Error en login-password:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
