import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Obtener todas las regiones ordenadas alfabéticamente
    const { data: regions, error: regionsError } = await supabase
      .from("regions")
      .select("id, name")
      .order("name");

    if (regionsError) {
      console.error("Error al obtener regiones:", regionsError);
      return NextResponse.json(
        { success: false, error: "Error al obtener regiones" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: regions,
    });
  } catch (error) {
    console.error("Error en GET /api/regions:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
