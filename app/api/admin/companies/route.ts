import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // CRITICAL: Verify user is authenticated and is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Verify user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single<{ user_type: string }>();

    if (profile?.user_type !== "administrator") {
      return NextResponse.json(
        { success: false, error: "No autorizado. Solo administradores." },
        { status: 403 }
      );
    }

    // Join profiles with companies table to get complete company data
    const { data: companies, error } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        phone,
        created_at,
        companies (
          company_name,
          responsible_area,
          position,
          validation_status
        )
      `)
      .eq("user_type", "company")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener empresas:", error);
      return NextResponse.json(
        { success: false, error: "Error al obtener empresas" },
        { status: 500 }
      );
    }

    // Transform the data to flatten the companies relationship
    const transformedCompanies = companies?.map((profile: any) => ({
      id: profile.id,
      email: profile.email,
      phone: profile.phone,
      created_at: profile.created_at,
      company_name: profile.companies?.company_name || "",
      responsible_area: profile.companies?.responsible_area || "",
      position: profile.companies?.position || "",
      validation_status: profile.companies?.validation_status || "pending",
      full_name: profile.companies?.company_name || profile.email || "Sin nombre",
    }));

    return NextResponse.json({
      success: true,
      data: transformedCompanies || [],
    });
  } catch (error) {
    console.error("Error en GET /api/admin/companies:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // CRITICAL: Verify user is authenticated and is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Verify user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single<{ user_type: string }>();

    if (profile?.user_type !== "administrator") {
      return NextResponse.json(
        { success: false, error: "No autorizado. Solo administradores." },
        { status: 403 }
      );
    }

    const { company_id, validation_status } = await request.json();

    if (!company_id || !validation_status) {
      return NextResponse.json(
        { success: false, error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    if (!["approved", "rejected"].includes(validation_status)) {
      return NextResponse.json(
        { success: false, error: "Estado de validación inválido" },
        { status: 400 }
      );
    }

    // Update validation_status in the companies table (not profiles)
    const { error } = await supabase
      .from("companies")
      .update({
        validation_status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", company_id);

    if (error) {
      console.error("Error al actualizar empresa:", error);
      return NextResponse.json(
        { success: false, error: "Error al actualizar estado" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Empresa ${
        validation_status === "approved" ? "aprobada" : "rechazada"
      } exitosamente`,
    });
  } catch (error) {
    console.error("Error en PATCH /api/admin/companies:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
