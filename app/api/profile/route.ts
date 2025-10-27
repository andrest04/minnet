import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import type { PostgrestError } from '@supabase/supabase-js';

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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single() as {
        data: Database['public']['Tables']['profiles']['Row'] | null;
        error: PostgrestError | null;
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
