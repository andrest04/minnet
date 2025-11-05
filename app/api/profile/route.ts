import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Map new user types to old ones for backward compatibility in responses
const USER_TYPE_LEGACY_MAP: Record<string, string> = {
  resident: 'poblador',
  company: 'empresa',
  administrator: 'admin',
};

export async function GET() {
  try {
    const supabase = await createClient();

    // Authenticate user - CRITICAL SECURITY CHECK
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Use authenticated user's ID - don't trust client input!
    const userId = user.id;

    // Get base profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error al obtener perfil:', profileError);
      return NextResponse.json(
        { success: false, error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    let profileData: Record<string, unknown> = {
      ...profile,
      // Return legacy user_type for backward compatibility
      user_type: USER_TYPE_LEGACY_MAP[profile.user_type] || profile.user_type,
    };

    let project = null;
    let region = null;

    // Fetch specialized data based on user type
    if (profile.user_type === 'resident') {
      const { data: residentData, error: residentError } = await supabase
        .from('residents')
        .select('*')
        .eq('id', userId)
        .single();

      if (residentData && !residentError) {
        // Merge resident data into profile
        profileData = {
          ...profileData,
          ...residentData,
        };

        // Fetch project and region
        if (residentData.project_id) {
          const { data: projectData } = await supabase
            .from('projects')
            .select('id, name, region_id')
            .eq('id', residentData.project_id)
            .single();

          project = projectData;
        }

        if (residentData.region_id) {
          const { data: regionData } = await supabase
            .from('regions')
            .select('id, name')
            .eq('id', residentData.region_id)
            .single();

          region = regionData;
        }
      }
    } else if (profile.user_type === 'company') {
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', userId)
        .single();

      if (companyData && !companyError) {
        // Merge company data into profile
        profileData = {
          ...profileData,
          ...companyData,
        };

        // Fetch assigned projects
        const { data: companyProjects } = await supabase
          .from('company_projects')
          .select('project_id, projects(id, name)')
          .eq('company_id', userId);

        if (companyProjects) {
          profileData.assigned_projects = companyProjects.map(
            (cp: { project_id: string; projects: unknown }) => cp.project_id
          );
          profileData.assigned_projects_details = companyProjects.map(
            (cp: { project_id: string; projects: unknown }) => cp.projects
          );
        }
      }
    } else if (profile.user_type === 'administrator') {
      const { data: adminData, error: adminError } = await supabase
        .from('administrators')
        .select('*')
        .eq('id', userId)
        .single();

      if (adminData && !adminError) {
        // Merge admin data into profile
        profileData = {
          ...profileData,
          ...adminData,
        };
      }
    }

    return NextResponse.json({
      success: true,
      profile: profileData,
      project,
      region,
    });
  } catch (error) {
    console.error('Error en GET /api/profile:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
