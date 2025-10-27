// Tipos generados automáticamente por Supabase
// Estos tipos serán actualizados cuando se cree el esquema de la base de datos

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          status: 'active' | 'inactive'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          status?: 'active' | 'inactive'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: 'active' | 'inactive'
          created_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          project_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_type: 'poblador' | 'empresa' | 'admin'
          email: string | null
          phone: string | null
          // Campos de poblador
          project_id: string | null
          community_id: string | null
          age_range: string | null
          education_level: string | null
          profession: string | null
          junta_link: boolean | null
          topics_interest: string[] | null
          knowledge_level: string | null
          participation_willingness: string[] | null
          // Campos de empresa
          full_name: string | null
          company_name: string | null
          position: string | null
          assigned_projects: string[] | null
          validation_status: 'pending' | 'approved' | 'rejected' | null
          use_objective: string | null
          consultation_frequency: string | null
          export_format: string | null
          // Metadata
          consent_version: string | null
          consent_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_type: 'poblador' | 'empresa' | 'admin'
          email?: string | null
          phone?: string | null
          project_id?: string | null
          community_id?: string | null
          age_range?: string | null
          education_level?: string | null
          profession?: string | null
          junta_link?: boolean | null
          topics_interest?: string[] | null
          knowledge_level?: string | null
          participation_willingness?: string[] | null
          full_name?: string | null
          company_name?: string | null
          position?: string | null
          assigned_projects?: string[] | null
          validation_status?: 'pending' | 'approved' | 'rejected' | null
          use_objective?: string | null
          consultation_frequency?: string | null
          export_format?: string | null
          consent_version?: string | null
          consent_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_type?: 'poblador' | 'empresa' | 'admin'
          email?: string | null
          phone?: string | null
          project_id?: string | null
          community_id?: string | null
          age_range?: string | null
          education_level?: string | null
          profession?: string | null
          junta_link?: boolean | null
          topics_interest?: string[] | null
          knowledge_level?: string | null
          participation_willingness?: string[] | null
          full_name?: string | null
          company_name?: string | null
          position?: string | null
          assigned_projects?: string[] | null
          validation_status?: 'pending' | 'approved' | 'rejected' | null
          use_objective?: string | null
          consultation_frequency?: string | null
          export_format?: string | null
          consent_version?: string | null
          consent_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      otp_codes: {
        Row: {
          id: string
          identifier: string
          code: string
          expires_at: string
          attempts: number
          verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          identifier: string
          code: string
          expires_at: string
          attempts?: number
          verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          identifier?: string
          code?: string
          expires_at?: string
          attempts?: number
          verified?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
