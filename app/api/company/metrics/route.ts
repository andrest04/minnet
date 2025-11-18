import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type ResidentData = Database["public"]["Tables"]["residents"]["Row"];

interface ProjectMetrics {
  project_id: string;
  project_name: string;
  icsm: number;
  ivc: number;
  nap: number;
  iic: number;
  rcp: "Alto" | "Medio" | "Bajo";
}

function calculateNAP(residents: ResidentData[]): number {
  if (residents.length === 0) return 0;

  const willingToParticipate = residents.filter(
    (r) => !r.participation_willingness.includes("no_participar")
  ).length;

  return (willingToParticipate / residents.length) * 100;
}

function calculateIIC(residents: ResidentData[]): number {
  if (residents.length === 0) return 0;

  const scoreMap: Record<string, number> = {
    alto: 100,
    medio: 50,
    bajo: 25,
  };

  const totalScore = residents.reduce((sum, r) => {
    return sum + (scoreMap[r.knowledge_level] || 0);
  }, 0);

  return totalScore / residents.length;
}

function calculateICSM(
  residents: ResidentData[],
  nap: number,
  iic: number
): number {
  if (residents.length === 0) return 0;

  const trustScoreMap: Record<string, number> = {
    alto: 100,
    medio: 50,
    bajo: 25,
    nulo: 0,
  };

  const totalTrustScore = residents.reduce((sum, r) => {
    return sum + (trustScoreMap[r.trust_level || "nulo"] || 0);
  }, 0);

  const avgTrust = totalTrustScore / residents.length;

  const icsm = 0.5 * avgTrust + 0.3 * iic + 0.2 * nap;
  return icsm;
}

function calculateIVC(residents: ResidentData[]): number {
  if (residents.length === 0) return 0;

  const educationScoreMap: Record<string, number> = {
    primaria: 0.25,
    secundaria: 0.5,
    tecnico: 0.75,
    superior: 1.0,
  };

  const ageScoreMap: Record<string, number> = {
    "18-25": 21.5,
    "26-35": 30.5,
    "36-45": 40.5,
    "46-60": 53,
    "60+": 65,
  };

  let totalEducationScore = 0;
  let totalAgeScore = 0;
  let formalEmploymentCount = 0;

  residents.forEach((r) => {
    totalEducationScore += educationScoreMap[r.education_level] || 0;
    totalAgeScore += ageScoreMap[r.age_range] || 30;
    if (r.employment_status === "formal") {
      formalEmploymentCount++;
    }
  });

  const avgEducation = totalEducationScore / residents.length;
  const avgAge = totalAgeScore / residents.length;
  const normalizedAge = Math.min(avgAge / 70, 1);
  const formalEmploymentRate = formalEmploymentCount / residents.length;

  const vulnerability =
    0.4 * (1 - avgEducation) +
    0.3 * normalizedAge +
    0.3 * (1 - formalEmploymentRate);

  return vulnerability * 100;
}

function calculateRCP(icsm: number): "Alto" | "Medio" | "Bajo" {
  if (icsm < 40) return "Alto";
  if (icsm >= 40 && icsm <= 70) return "Medio";
  return "Bajo";
}

export async function GET() {
  try {
    const supabase = await createClient();

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

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, validation_status")
      .eq("id", user.id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { success: false, error: "Perfil de empresa no encontrado" },
        { status: 403 }
      );
    }

    if (company.validation_status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Empresa no aprobada" },
        { status: 403 }
      );
    }

    const { data: assignedProjects, error: projectsError } = await supabase
      .from("company_projects")
      .select("project_id, projects(id, name)")
      .eq("company_id", user.id);

    if (projectsError || !assignedProjects || assignedProjects.length === 0) {
      return NextResponse.json(
        { success: false, error: "Empresa sin proyectos asignados" },
        { status: 404 }
      );
    }

    const projectIds = assignedProjects.map((p) => p.project_id);

    const { data: residents, error: residentsError } = await supabase
      .from("residents")
      .select("*")
      .in("project_id", projectIds);

    if (residentsError) {
      console.error("Error al obtener residentes:", residentsError);
      return NextResponse.json(
        { success: false, error: "Error al cargar datos de residentes" },
        { status: 500 }
      );
    }

    if (!residents || residents.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          kpis: {
            comunidades_monitoreadas: projectIds.length,
            promedio_confianza_icsm: 0,
            riesgo_social_rcp: "Bajo",
            alertas_activas: 0,
          },
          tableData: [],
          total_residents: 0,
        },
      });
    }

    // 5. Calcular los KPIs

    // --- Primero, los KPIs Globales (como ya los teníamos) ---
    const total_residents = residents.length;
    const nap_global = calculateNAP(residents);
    const iic_global = calculateIIC(residents);
    const icsm_global = calculateICSM(residents, nap_global, iic_global);
    const rcp_global = calculateRCP(icsm_global);

    const kpis = {
      comunidades_monitoreadas: projectIds.length,
      promedio_confianza_icsm: icsm_global,
      riesgo_social_rcp: rcp_global,
      alertas_activas: 0,
    };

    // --- Segundo, los KPIs por Proyecto (¡Lo nuevo!) ---
    const tableData: ProjectMetrics[] = assignedProjects.map((proj) => {
      const projectResidents = residents.filter(
        (r) => r.project_id === proj.project_id
      );

      // Si un proyecto no tiene residentes, le damos valores por defecto
      if (projectResidents.length === 0) {
        return {
          project_id: proj.project_id,
          project_name: (proj.projects as { name: string } | null)?.name || "Nombre no encontrado",
          icsm: 0,
          ivc: 0,
          nap: 0,
          iic: 0,
          rcp: "Bajo",
        };
      }

      const nap = calculateNAP(projectResidents);
      const iic = calculateIIC(projectResidents);
      const icsm = calculateICSM(projectResidents, nap, iic);
      const ivc = calculateIVC(projectResidents);
      const rcp = calculateRCP(icsm);

      return {
        project_id: proj.project_id,
        project_name: (proj.projects as { name: string } | null)?.name || "Nombre no encontrado",
        icsm: icsm,
        ivc: ivc,
        nap: nap,
        iic: iic,
        rcp: rcp,
      };
    });

    // 6. Preparar respuesta
    return NextResponse.json({
      success: true,
      data: {
        kpis,
        tableData,
        total_residents,
      },
    });
  } catch (error) {
    console.error("Error en GET /api/company/metrics:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
