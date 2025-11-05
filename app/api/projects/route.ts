import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get("region_id");

    const supabase = await createClient();

    let query = supabase
      .from("projects")
      .select("id, region_id, name, status")
      .eq("status", "active")
      .order("name");

    // Si se proporciona region_id, filtrar por región
    if (regionId) {
      query = query.eq("region_id", regionId);
    }

    const { data: projects, error: projectsError } = await query;

    if (projectsError) {
      console.error("Error al obtener proyectos:", projectsError);
      return NextResponse.json(
        { success: false, error: "Error al obtener proyectos" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Error en GET /api/projects:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
