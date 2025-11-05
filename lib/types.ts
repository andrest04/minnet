// Tipos TypeScript para la aplicación MinneT

export type UserType = "resident" | "company" | "administrator";

export type ValidationStatus = "pending" | "approved" | "rejected";

export interface Region {
  id: string;
  name: string;
  created_at: string;
}

export interface Project {
  id: string;
  region_id: string;
  name: string;
  status: "active" | "inactive";
  created_at: string;
}

// ============================================================================
// PERFILES BASE Y ESPECIALIZADOS (NORMALIZADOS)
// ============================================================================

// Perfil base (datos comunes a todos los tipos de usuario)
export interface BaseProfile {
  id: string;
  user_type: UserType;
  email?: string;
  phone?: string;
  consent_version: string;
  consent_date: string;
  created_at: string;
  updated_at: string;
}

// Perfil de poblador (resident)
export interface ResidentProfile extends BaseProfile {
  user_type: "resident";
  resident_data: {
    region_id: string;
    project_id: string;
    age_range: string;
    education_level: string;
    gender: string;
    profession: string;
    junta_link: "member" | "familiar" | "none";
    junta_relationship?: string;
    topics_interest: string[];
    knowledge_level: string;
    participation_willingness: string[];
  };
}

// Perfil de empresa (company)
export interface CompanyProfile extends BaseProfile {
  user_type: "company";
  company_data: {
    company_name: string;
    responsible_area: string;
    position: string;
    validation_status: ValidationStatus;
    use_objective?: string;
    consultation_frequency?: string;
  };
  assigned_projects: string[]; // IDs de proyectos asignados
}

// Perfil de administrador (administrator)
export interface AdministratorProfile extends BaseProfile {
  user_type: "administrator";
  administrator_data: {
    full_name: string;
  };
}

export type Profile = ResidentProfile | CompanyProfile | AdministratorProfile;

// ============================================================================
// TIPOS PARA FORMULARIOS DE REGISTRO
// ============================================================================

export interface ResidentRegistrationStep1 {
  region_id: string;
  project_id: string;
  age_range: string;
  education_level: string;
  gender: string;
}

export interface ResidentRegistrationStep2 {
  profession: string;
  junta_link: "member" | "familiar" | "none";
  junta_relationship?: string;
  consent: boolean;
}

export interface ResidentRegistrationStep3 {
  topics_interest: string[];
  knowledge_level: string;
  participation_willingness: string[];
}

export interface ResidentRegistrationData
  extends ResidentRegistrationStep1,
    ResidentRegistrationStep2,
    ResidentRegistrationStep3 {
  identifier: string;
  identifier_type: "email" | "phone";
  password: string;
}

export interface CompanyRegistrationData {
  identifier: string;
  responsible_area: string;
  company_name: string;
  position: string;
  assigned_projects: string[];
  consent: boolean;
  use_objective?: string;
  consultation_frequency?: string;
}

// Alias para compatibilidad con código existente
export type PobladorRegistrationStep1 = ResidentRegistrationStep1;
export type PobladorRegistrationStep2 = ResidentRegistrationStep2;
export type PobladorRegistrationStep3 = ResidentRegistrationStep3;
export type PobladorRegistrationData = ResidentRegistrationData;
export type EmpresaRegistrationData = CompanyRegistrationData;

// ============================================================================
// TIPOS PARA RESPUESTAS DE API
// ============================================================================

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SendOTPResponse {
  success: boolean;
  identifier: string;
  identifier_type: "email" | "phone";
  expires_at: string;
  message: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  user_exists: boolean;
  user_id?: string;
  user_type?: UserType;
  requires_registration: boolean;
  message: string;
}

export interface RegistrationResponse {
  success: boolean;
  user_id: string;
  user_type: UserType;
  message: string;
}

// ============================================================================
// TIPOS PARA AUTENTICACIÓN
// ============================================================================

export interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    data: ResidentRegistrationData | CompanyRegistrationData
  ) => Promise<void>;
}

// ============================================================================
// TIPOS PARA RELACIONES MANY-TO-MANY
// ============================================================================

export interface CompanyProject {
  company_id: string;
  project_id: string;
  assigned_at: string;
}
