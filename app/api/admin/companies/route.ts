import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

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

    // Query companies table directly and join with profiles for email
    // Note: Using companies_id_fkey as the foreign key relationship name
    const { data: companies, error } = await supabase
      .from("companies")
      .select(`
        id,
        company_name,
        responsible_area,
        position,
        validation_status,
        created_at,
        profiles:companies_id_fkey (
          email,
          phone
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener empresas:", error);
      return NextResponse.json(
        { success: false, error: "Error al obtener empresas" },
        { status: 500 }
      );
    }

    // Log the raw data for debugging
    console.log("Raw companies data from Supabase:", JSON.stringify(companies, null, 2));

    // Transform the data to flatten the profiles relationship
    const transformedCompanies = companies?.map((company: any) => {
      console.log("Processing company:", company);
      return {
        id: company.id,
        email: company.profiles?.email || "",
        phone: company.profiles?.phone || "",
        created_at: company.created_at,
        company_name: company.company_name || "",
        responsible_area: company.responsible_area || "",
        position: company.position || "",
        validation_status: company.validation_status || "pending",
        full_name: company.company_name || company.profiles?.email || "Sin nombre",
      };
    });

    console.log("Transformed companies:", JSON.stringify(transformedCompanies, null, 2));

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

    // If rejected, delete the account completely
    if (validation_status === "rejected") {
      const supabaseAdmin = createAdminClient();

      // Delete in correct order to respect foreign key constraints
      // 1. Delete company_projects (has FK to companies)
      const { error: projectsError } = await supabase
        .from("company_projects")
        .delete()
        .eq("company_id", company_id);

      if (projectsError) {
        console.error("Error al eliminar proyectos de empresa:", projectsError);
      }

      // 2. Delete from companies table
      const { error: companyError } = await supabase
        .from("companies")
        .delete()
        .eq("id", company_id);

      if (companyError) {
        console.error("Error al eliminar datos de empresa:", companyError);
        return NextResponse.json(
          { success: false, error: "Error al eliminar datos de empresa" },
          { status: 500 }
        );
      }

      // 3. Delete from profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", company_id);

      if (profileError) {
        console.error("Error al eliminar perfil:", profileError);
        return NextResponse.json(
          { success: false, error: "Error al eliminar perfil" },
          { status: 500 }
        );
      }

      // 4. Delete from auth.users (requires admin client)
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
        company_id
      );

      if (authError) {
        console.error("Error al eliminar usuario de auth:", authError);
        // Not critical - profile is already deleted
      }

      console.log(`Cuenta de empresa ${company_id} eliminada completamente por admin ${user.id}`);

      return NextResponse.json({
        success: true,
        message: "Cuenta de empresa eliminada completamente",
      });
    }

    // If approved, just update the validation_status
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
      message: "Empresa aprobada exitosamente",
    });
  } catch (error) {
    console.error("Error en PATCH /api/admin/companies:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
