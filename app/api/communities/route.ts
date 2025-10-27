import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Se requiere project_id' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Obtener comunidades del proyecto específico
    const { data: communities, error: communitiesError } = await supabase
      .from('communities')
      .select('id, name, project_id')
      .eq('project_id', projectId)
      .order('name');

    if (communitiesError) {
      console.error('Error al obtener comunidades:', communitiesError);
      return NextResponse.json(
        { success: false, error: 'Error al obtener comunidades' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: communities,
    });
  } catch (error) {
    console.error('Error en GET /api/communities:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
