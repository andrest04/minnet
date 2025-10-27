import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Obtener todos los proyectos activos
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, status')
      .eq('status', 'active')
      .order('name');

    if (projectsError) {
      console.error('Error al obtener proyectos:', projectsError);
      return NextResponse.json(
        { success: false, error: 'Error al obtener proyectos' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Error en GET /api/projects:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
