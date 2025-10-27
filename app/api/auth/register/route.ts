import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  validateCorporateEmail,
  cleanPhone,
} from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_type, identifier, identifier_type, ...profileData } = body;

    if (!user_type || !['poblador', 'empresa', 'admin'].includes(user_type)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de usuario inválido' },
        { status: 400 }
      );
    }

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Identificador requerido' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    if (user_type === 'poblador') {
      const { project_id, community_id, age_range, education_level, profession } =
        profileData;

      if (!project_id || !community_id || !age_range || !education_level || !profession) {
        return NextResponse.json(
          { success: false, error: 'Faltan campos obligatorios' },
          { status: 400 }
        );
      }

      const { data: existingProject } = await supabase
        .from('projects')
        .select('id')
        .eq('id', project_id)
        .single();

      if (!existingProject) {
        return NextResponse.json(
          { success: false, error: 'Proyecto no válido' },
          { status: 400 }
        );
      }

      const { data: existingCommunity } = await supabase
        .from('communities')
        .select('id')
        .eq('id', community_id)
        .eq('project_id', project_id)
        .single();

      if (!existingCommunity) {
        return NextResponse.json(
          { success: false, error: 'Comunidad no válida para el proyecto seleccionado' },
          { status: 400 }
        );
      }
    }

    if (user_type === 'empresa') {
      const { full_name, company_name, position, assigned_projects } = profileData;

      if (!full_name || !company_name || !position || !assigned_projects?.length) {
        return NextResponse.json(
          { success: false, error: 'Faltan campos obligatorios' },
          { status: 400 }
        );
      }

      if (identifier_type === 'email' && !validateCorporateEmail(identifier)) {
        return NextResponse.json(
          { success: false, error: 'Debes usar un email corporativo' },
          { status: 400 }
        );
      }
    }

    const normalizedIdentifier =
      identifier_type === 'phone' ? cleanPhone(identifier) : identifier.toLowerCase().trim();

    const identifierColumn = identifier_type === 'email' ? 'email' : 'phone';

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq(identifierColumn, normalizedIdentifier)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un usuario con este email o teléfono' },
        { status: 400 }
      );
    }

    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email:
        identifier_type === 'email'
          ? normalizedIdentifier
          : `${normalizedIdentifier}@minnet.placeholder`,
      password: Math.random().toString(36).slice(-12),
      options: {
        data: {
          user_type,
          [identifierColumn]: normalizedIdentifier,
        },
      },
    });

    if (authError || !authUser.user) {
      console.error('Error al crear usuario en Auth:', authError);
      return NextResponse.json(
        { success: false, error: 'Error al crear cuenta de usuario' },
        { status: 500 }
      );
    }

    const profilePayload: Record<string, unknown> = {
      id: authUser.user.id,
      user_type,
      [identifierColumn]: normalizedIdentifier,
      consent_version: profileData.consent_version,
      consent_date: profileData.consent_date,
    };

    if (user_type === 'poblador') {
      Object.assign(profilePayload, {
        project_id: profileData.project_id,
        community_id: profileData.community_id,
        age_range: profileData.age_range,
        education_level: profileData.education_level,
        profession: profileData.profession,
        junta_link: profileData.junta_link,
        topics_interest: profileData.topics_interest,
        knowledge_level: profileData.knowledge_level,
        participation_willingness: profileData.participation_willingness,
      });
    } else if (user_type === 'empresa') {
      Object.assign(profilePayload, {
        full_name: profileData.full_name,
        company_name: profileData.company_name,
        position: profileData.position,
        assigned_projects: profileData.assigned_projects,
        validation_status: 'pending',
        use_objective: profileData.use_objective,
        consultation_frequency: profileData.consultation_frequency,
        export_format: profileData.export_format,
      });
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profilePayload as never);

    if (profileError) {
      console.error('Error al crear perfil:', profileError);
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json(
        { success: false, error: 'Error al guardar perfil de usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user_id: authUser.user.id,
      user_type,
      message:
        user_type === 'empresa'
          ? 'Registro exitoso. Tu cuenta será revisada por un administrador.'
          : 'Registro exitoso. Bienvenido a MinneT.',
    });
  } catch (error) {
    console.error('Error en register:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
