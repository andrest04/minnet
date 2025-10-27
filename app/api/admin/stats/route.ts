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
      .single();

    if (profile?.user_type !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_type, validation_status, project_id') as {
      data: Array<{
        user_type: string;
        validation_status: string | null;
        project_id: string | null;
      }> | null;
    };

    const stats = {
      total_pobladores: profiles?.filter((p) => p.user_type === 'poblador').length || 0,
      total_empresas: profiles?.filter((p) => p.user_type === 'empresa').length || 0,
      empresas_pendientes:
        profiles?.filter((p) => p.user_type === 'empresa' && p.validation_status === 'pending')
          .length || 0,
      empresas_aprobadas:
        profiles?.filter((p) => p.user_type === 'empresa' && p.validation_status === 'approved')
          .length || 0,
    };

    const { data: projects } = (await supabase
      .from('projects')
      .select('id, name')
      .eq('status', 'active')) as {
      data: Array<{ id: string; name: string }> | null;
    };

    const projectStats = projects?.map((project) => ({
      project_id: project.id,
      project_name: project.name,
      pobladores_count: profiles?.filter((p) => p.project_id === project.id).length || 0,
    }));

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
