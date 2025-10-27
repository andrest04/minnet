import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Se requiere user_id' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single() as {
        data: Database['public']['Tables']['profiles']['Row'] | null;
        error: any;
      };

    if (error || !profile) {
      console.error('Error al obtener perfil:', error);
      return NextResponse.json(
        { success: false, error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    let project = null;
    let community = null;

    if (profile.user_type === 'poblador' && profile.project_id) {
      const { data: projectData } = await supabase
        .from('projects')
        .select('id, name')
        .eq('id', profile.project_id)
        .single();

      project = projectData;

      if (profile.community_id) {
        const { data: communityData } = await supabase
          .from('communities')
          .select('id, name')
          .eq('id', profile.community_id)
          .single();

        community = communityData;
      }
    }

    return NextResponse.json({
      success: true,
      profile,
      project,
      community,
    });
  } catch (error) {
    console.error('Error en GET /api/profile:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
