import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // CRITICAL: Verify user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single<{ user_type: string }>();

    if (profile?.user_type !== 'administrator') {
      return NextResponse.json(
        { success: false, error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    // Count residents
    const { count: residentCount } = await supabase
      .from('residents')
      .select('*', { count: 'exact', head: true });

    // Count companies by status
    const { count: totalCompaniesCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });

    const { count: pendingCompaniesCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('validation_status', 'pending');

    const { count: approvedCompaniesCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('validation_status', 'approved');

    const stats = {
      total_pobladores: residentCount || 0,
      total_empresas: totalCompaniesCount || 0,
      empresas_pendientes: pendingCompaniesCount || 0,
      empresas_aprobadas: approvedCompaniesCount || 0,
    };

    // Get projects with resident counts
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name')
      .eq('status', 'active');

    // Count residents per project
    const projectStats = await Promise.all(
      projects?.map(async (project) => {
        const { count } = await supabase
          .from('residents')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id);

        return {
          project_id: project.id,
          project_name: project.name,
          pobladores_count: count || 0,
        };
      }) || []
    );

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        by_project: projectStats,
      },
    });
  } catch (error) {
    console.error('Error en GET /api/admin/stats:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
