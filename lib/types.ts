// Tipos TypeScript para la aplicación MinneT

export type UserType = 'poblador' | 'empresa' | 'admin';

export type ValidationStatus = 'pending' | 'approved' | 'rejected';

export interface Project {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Community {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
}

export interface PobladorProfile {
  id: string;
  user_type: 'poblador';
  email?: string;
  phone?: string;
  project_id: string;
  community_id: string;
  age_range: string;
  education_level: string;
  profession: string;
  junta_link: boolean;
  topics_interest: string[];
  knowledge_level: string;
  participation_willingness: string[];
  consent_version: string;
  consent_date: string;
  created_at: string;
  updated_at: string;
}

export interface EmpresaProfile {
  id: string;
  user_type: 'empresa';
  email: string;
  full_name: string;
  company_name: string;
  position: string;
  assigned_projects: string[];
  validation_status: ValidationStatus;
  use_objective?: string;
  consultation_frequency?: string;
  export_format?: string;
  consent_version: string;
  consent_date: string;
  created_at: string;
  updated_at: string;
}

export interface AdminProfile {
  id: string;
  user_type: 'admin';
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export type Profile = PobladorProfile | EmpresaProfile | AdminProfile;

export interface OTPCode {
  id: string;
  identifier: string;
  code: string;
  expires_at: string;
  attempts: number;
  verified: boolean;
  created_at: string;
}

// Tipos para formularios de registro

export interface PobladorRegistrationStep1 {
  project_id: string;
  community_id: string;
  age_range: string;
  education_level: string;
}

export interface PobladorRegistrationStep2 {
  profession: string;
  junta_link: boolean;
  consent: boolean;
}

export interface PobladorRegistrationStep3 {
  topics_interest: string[];
  knowledge_level: string;
  participation_willingness: string[];
}

export interface PobladorRegistrationData
  extends PobladorRegistrationStep1,
    PobladorRegistrationStep2,
    PobladorRegistrationStep3 {
  identifier: string;
  identifier_type: 'email' | 'phone';
}

export interface EmpresaRegistrationData {
  identifier: string;
  full_name: string;
  company_name: string;
  position: string;
  assigned_projects: string[];
  consent: boolean;
  use_objective?: string;
  consultation_frequency?: string;
  export_format?: string;
}

// Tipos para respuestas de API

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SendOTPResponse {
  success: boolean;
  identifier: string;
  identifier_type: 'email' | 'phone';
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

// Tipos para el contexto de autenticación

export interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: PobladorRegistrationData | EmpresaRegistrationData) => Promise<void>;
}
