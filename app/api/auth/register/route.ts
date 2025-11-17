import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  validateCorporateEmail,
  cleanPhone,
  validatePassword,
} from "@/lib/validations";
import type { Database } from "@/lib/supabase/database.types";

// Allowed user types
const ALLOWED_USER_TYPES = ["resident", "company", "administrator"] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { user_type, identifier, identifier_type, password, ...profileData } =
      body;

    // Validate user type
    if (!ALLOWED_USER_TYPES.includes(user_type)) {
      return NextResponse.json(
        { success: false, error: "Tipo de usuario inválido" },
        { status: 400 }
      );
    }

    const mappedUserType = user_type;

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Identificador requerido" },
        { status: 400 }
      );
    }

    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: "Contraseña inválida",
            errors: passwordValidation.errors,
          },
          { status: 400 }
        );
      }
    }

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // Validate based on user type
    if (mappedUserType === "resident") {
      const {
        project_id,
        region_id,
        age_range,
        education_level,
        gender,
        profession,
      } = profileData;

      if (
        !project_id ||
        !region_id ||
        !age_range ||
        !education_level ||
        !gender ||
        !profession ||
        !profileData.employment_status ||
        !profileData.trust_level
      ) {
        return NextResponse.json(
          { success: false, error: "Faltan campos obligatorios" },
          { status: 400 }
        );
      }

      const { data: existingProject } = await supabase
        .from("projects")
        .select("id, region_id")
        .eq("id", project_id)
        .single<{ id: string; region_id: string }>();

      if (!existingProject) {
        return NextResponse.json(
          { success: false, error: "Proyecto no válido" },
          { status: 400 }
        );
      }

      if (existingProject.region_id !== region_id) {
        return NextResponse.json(
          {
            success: false,
            error: "El proyecto no pertenece a la región seleccionada",
          },
          { status: 400 }
        );
      }
    }

    if (mappedUserType === "company") {
      const { responsible_area, company_name, position, assigned_projects } =
        profileData;

      if (
        !responsible_area ||
        !company_name ||
        !position ||
        !assigned_projects?.length
      ) {
        return NextResponse.json(
          { success: false, error: "Faltan campos obligatorios" },
          { status: 400 }
        );
      }

      if (identifier_type === "email" && !validateCorporateEmail(identifier)) {
        return NextResponse.json(
          { success: false, error: "Debes usar un email corporativo" },
          { status: 400 }
        );
      }
    }

    const normalizedIdentifier =
      identifier_type === "phone"
        ? cleanPhone(identifier)
        : identifier.toLowerCase().trim();

    const identifierColumn = identifier_type === "email" ? "email" : "phone";
    const authEmail =
      identifier_type === "email"
        ? normalizedIdentifier
        : `${normalizedIdentifier}@minnet.placeholder`;

    // Check for existing auth user
    const { data: existingAuthUsers } =
      await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = existingAuthUsers?.users.find(
      (u) => u.email === authEmail
    );

    // Check for existing profile
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq(identifierColumn, normalizedIdentifier)
      .maybeSingle<{ id: string }>();

    let userId: string;

    if (existingAuthUser) {
      // User exists in Auth, update password if provided
      userId = existingAuthUser.id;

      if (password) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          const { error: updateError } = await supabase.auth.updateUser({
            password,
          });

          if (updateError) {
            const { error: adminUpdateError } =
              await supabaseAdmin.auth.admin.updateUserById(
                existingAuthUser.id,
                { password }
              );

            if (adminUpdateError) {
              return NextResponse.json(
                { success: false, error: "Error al actualizar contraseña" },
                { status: 500 }
              );
            }
          }
        } else {
          const { error: updateError } =
            await supabaseAdmin.auth.admin.updateUserById(existingAuthUser.id, {
              password,
            });

          if (updateError) {
            return NextResponse.json(
              { success: false, error: "Error al actualizar contraseña" },
              { status: 500 }
            );
          }
        }
      }
    } else if (existingProfile) {
      // Profile exists but no Auth user (shouldn't happen)
      userId = existingProfile.id;

      if (password) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Error interno: perfil existe pero usuario Auth no. Contacta soporte.",
          },
          { status: 500 }
        );
      }
    } else {
      // Create new user
      const { data: orphanUser } = await supabaseAdmin.auth.admin.listUsers();
      const userToDelete = orphanUser?.users.find(
        (u) => u.email === authEmail
      );

      if (userToDelete) {
        await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);
      }

      const userPassword = password || Math.random().toString(36).slice(-12);

      const { data: authUser, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: authEmail,
          password: userPassword,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            user_type: mappedUserType,
            [identifierColumn]: normalizedIdentifier,
          },
        });

      if (authError || !authUser.user) {
        console.error("Error al crear usuario en Auth:", authError);
        return NextResponse.json(
          { success: false, error: "Error al crear cuenta de usuario" },
          { status: 500 }
        );
      }

      userId = authUser.user.id;
    }

    // Insert/Update base profile
    const basePayload: Database["public"]["Tables"]["profiles"]["Insert"] = {
      id: userId,
      user_type: mappedUserType,
      consent_version: profileData.consent_version,
      consent_date: profileData.consent_date,
    };

    const profilePayload =
      identifier_type === "email"
        ? { ...basePayload, email: normalizedIdentifier }
        : { ...basePayload, phone: normalizedIdentifier };

    const { error: profileError } = existingProfile
      ? await supabaseAdmin
          .from("profiles")
          .update(profilePayload)
          .eq("id", userId)
      : await supabaseAdmin.from("profiles").insert(profilePayload);

    if (profileError) {
      console.error("Error al crear/actualizar perfil base:", profileError);
      if (!existingProfile) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      }
      return NextResponse.json(
        { success: false, error: "Error al guardar perfil de usuario" },
        { status: 500 }
      );
    }

    // Insert/Update specialized profile based on user type
    if (mappedUserType === "resident") {
      const residentPayload = {
        id: userId,
        region_id: profileData.region_id,
        project_id: profileData.project_id,
        age_range: profileData.age_range,
        education_level: profileData.education_level,
        gender: profileData.gender,
        profession: profileData.profession,
        employment_status: profileData.employment_status,
        trust_level: profileData.trust_level,
        junta_link: profileData.junta_link,
        junta_relationship: profileData.junta_relationship,
        topics_interest: profileData.topics_interest || [],
        knowledge_level: profileData.knowledge_level,
        participation_willingness: profileData.participation_willingness || [],
      };

      const { data: existingResident } = await supabaseAdmin
        .from("residents")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      const { error: residentError } = existingResident
        ? await supabaseAdmin
            .from("residents")
            .update(residentPayload)
            .eq("id", userId)
        : await supabaseAdmin.from("residents").insert(residentPayload);

      if (residentError) {
        console.error("Error al guardar datos de residente:", residentError);
        return NextResponse.json(
          { success: false, error: "Error al guardar datos de poblador" },
          { status: 500 }
        );
      }
    } else if (mappedUserType === "company") {
      const companyPayload = {
        id: userId,
        company_name: profileData.company_name,
        responsible_area: profileData.responsible_area,
        position: profileData.position,
        validation_status: "pending" as const,
        use_objective: profileData.use_objective,
        consultation_frequency: profileData.consultation_frequency,
      };

      const { data: existingCompany } = await supabaseAdmin
        .from("companies")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      const { error: companyError } = existingCompany
        ? await supabaseAdmin
            .from("companies")
            .update(companyPayload)
            .eq("id", userId)
        : await supabaseAdmin.from("companies").insert(companyPayload);

      if (companyError) {
        console.error("Error al guardar datos de empresa:", companyError);
        return NextResponse.json(
          { success: false, error: "Error al guardar datos de empresa" },
          { status: 500 }
        );
      }

      // Insert company projects relationships
      if (profileData.assigned_projects?.length > 0) {
        // Delete existing relationships
        await supabaseAdmin
          .from("company_projects")
          .delete()
          .eq("company_id", userId);

        // Insert new relationships
        const companyProjects = profileData.assigned_projects.map(
          (projectId: string) => ({
            company_id: userId,
            project_id: projectId,
          })
        );

        const { error: projectsError } = await supabaseAdmin
          .from("company_projects")
          .insert(companyProjects);

        if (projectsError) {
          console.error(
            "Error al asignar proyectos a empresa:",
            projectsError
          );
        }
      }
    } else if (mappedUserType === "administrator") {
      const adminPayload = {
        id: userId,
        full_name: profileData.full_name || profileData.email || "Administrador",
      };

      const { data: existingAdmin } = await supabaseAdmin
        .from("administrators")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      const { error: adminError } = existingAdmin
        ? await supabaseAdmin
            .from("administrators")
            .update(adminPayload)
            .eq("id", userId)
        : await supabaseAdmin.from("administrators").insert(adminPayload);

      if (adminError) {
        console.error("Error al guardar datos de admin:", adminError);
        return NextResponse.json(
          { success: false, error: "Error al guardar datos de administrador" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      user_id: userId,
      user_type: mappedUserType,
      message:
        mappedUserType === "company"
          ? "Registro exitoso. Tu cuenta será revisada por un administrador."
          : "Registro exitoso. Bienvenido a MinneT.",
    });
  } catch (error) {
    console.error("Error en register:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
