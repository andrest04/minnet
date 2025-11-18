import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { validatePassword } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: "La contraseña es requerida" },
        { status: 400 }
      );
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Contraseña inválida",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verificar que hay una sesión activa (puede ser normal o de recuperación)
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    // Actualizar la contraseña usando updateUser
    const { data: updateData, error: updateError } =
      await supabase.auth.updateUser({
        password,
      });

    if (updateError) {
      console.error("Error al actualizar contraseña:", updateError);
      return NextResponse.json(
        {
          success: false,
          error:
            updateError.message || "Error al actualizar contraseña",
        },
        { status: 500 }
      );
    }

    if (!updateData.user) {
      return NextResponse.json(
        { success: false, error: "No se pudo actualizar la contraseña" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contraseña establecida correctamente",
    });
  } catch (error) {
    console.error("Error en set-password:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
