import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { APIResponse } from '@/lib/types';

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

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user - CRITICAL SECURITY CHECK
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' } as APIResponse,
        { status: 401 }
      );
    }

    const userId = user.id;
    const updateData = await request.json();

    // Get user's profile to determine user_type
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Perfil no encontrado' } as APIResponse,
        { status: 404 }
      );
    }

    // Define readonly fields that should never be updated by users
    const globalReadonlyFields = ['id', 'created_at', 'updated_at', 'user_type', 'consent_date', 'consent_version', 'email', 'phone'];

    // Check for attempts to update readonly fields
    for (const field of globalReadonlyFields) {
      if (field in updateData) {
        return NextResponse.json(
          { success: false, error: `El campo '${field}' no se puede modificar` } as APIResponse,
          { status: 400 }
        );
      }
    }

    // Update based on user type
    if (profile.user_type === 'resident') {
      // Additional readonly fields for residents
      const residentReadonlyFields = ['region_id', 'project_id'];
      for (const field of residentReadonlyFields) {
        if (field in updateData) {
          return NextResponse.json(
            { success: false, error: `El campo '${field}' no se puede modificar` } as APIResponse,
            { status: 400 }
          );
        }
      }

      // Allowed fields for residents
      const allowedFields = [
        'age_range',
        'education_level',
        'gender',
        'profession',
        'employment_status',
        'trust_level',
        'junta_link',
        'junta_relationship',
        'topics_interest',
        'knowledge_level',
        'participation_willingness',
      ];

      const fieldsToUpdate = Object.keys(updateData).filter(key => allowedFields.includes(key));

      if (fieldsToUpdate.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No hay campos válidos para actualizar' } as APIResponse,
          { status: 400 }
        );
      }

      const updatePayload: Record<string, unknown> = {};
      fieldsToUpdate.forEach(field => {
        updatePayload[field] = updateData[field];
      });

      const { data, error } = await supabase
        .from('residents')
        .update(updatePayload)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error al actualizar perfil de residente:', error);
        return NextResponse.json(
          { success: false, error: 'Error al actualizar perfil' } as APIResponse,
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        profile: data,
        message: 'Perfil actualizado correctamente',
      } as APIResponse);

    } else if (profile.user_type === 'company') {
      // Additional readonly fields for companies
      const companyReadonlyFields = ['validation_status', 'assigned_projects'];
      for (const field of companyReadonlyFields) {
        if (field in updateData) {
          return NextResponse.json(
            { success: false, error: `El campo '${field}' no se puede modificar` } as APIResponse,
            { status: 400 }
          );
        }
      }

      // Allowed fields for companies
      const allowedFields = [
        'company_name',
        'position',
        'responsible_area',
        'use_objective',
        'consultation_frequency',
      ];

      const fieldsToUpdate = Object.keys(updateData).filter(key => allowedFields.includes(key));

      if (fieldsToUpdate.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No hay campos válidos para actualizar' } as APIResponse,
          { status: 400 }
        );
      }

      const updatePayload: Record<string, unknown> = {};
      fieldsToUpdate.forEach(field => {
        updatePayload[field] = updateData[field];
      });

      const { data, error } = await supabase
        .from('companies')
        .update(updatePayload)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error al actualizar perfil de empresa:', error);
        return NextResponse.json(
          { success: false, error: 'Error al actualizar perfil' } as APIResponse,
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        profile: data,
        message: 'Perfil actualizado correctamente',
      } as APIResponse);

    } else if (profile.user_type === 'administrator') {
      // Allowed fields for administrators
      const allowedFields = ['full_name'];

      const fieldsToUpdate = Object.keys(updateData).filter(key => allowedFields.includes(key));

      if (fieldsToUpdate.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No hay campos válidos para actualizar' } as APIResponse,
          { status: 400 }
        );
      }

      const updatePayload: Record<string, unknown> = {};
      fieldsToUpdate.forEach(field => {
        updatePayload[field] = updateData[field];
      });

      const { data, error } = await supabase
        .from('administrators')
        .update(updatePayload)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error al actualizar perfil de administrador:', error);
        return NextResponse.json(
          { success: false, error: 'Error al actualizar perfil' } as APIResponse,
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        profile: data,
        message: 'Perfil actualizado correctamente',
      } as APIResponse);
    }

    return NextResponse.json(
      { success: false, error: 'Tipo de usuario no válido' } as APIResponse,
      { status: 400 }
    );

  } catch (error) {
    console.error('Error en PATCH /api/profile:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' } as APIResponse,
      { status: 500 }
    );
  }
}
