export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      administrators: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "administrators_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          company_name: string
          consultation_frequency: string | null
          created_at: string | null
          id: string
          position: string
          responsible_area: string
          updated_at: string | null
          use_objective: string | null
          validation_status: string | null
        }
        Insert: {
          company_name: string
          consultation_frequency?: string | null
          created_at?: string | null
          id: string
          position: string
          responsible_area: string
          updated_at?: string | null
          use_objective?: string | null
          validation_status?: string | null
        }
        Update: {
          company_name?: string
          consultation_frequency?: string | null
          created_at?: string | null
          id?: string
          position?: string
          responsible_area?: string
          updated_at?: string | null
          use_objective?: string | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_projects: {
        Row: {
          assigned_at: string | null
          company_id: string
          project_id: string
        }
        Insert: {
          assigned_at?: string | null
          company_id: string
          project_id: string
        }
        Update: {
          assigned_at?: string | null
          company_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          consent_date: string | null
          consent_version: string | null
          created_at: string | null
          email: string | null
          id: string
          phone: string | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          consent_date?: string | null
          consent_version?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
          user_type: string
        }
        Update: {
          consent_date?: string | null
          consent_version?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          id: string
          name: string
          region_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          region_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          region_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_projects_region_id"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      residents: {
        Row: {
          age_range: string
          created_at: string | null
          education_level: string
          gender: string
          id: string
          junta_link: string | null
          junta_relationship: string | null
          knowledge_level: string
          participation_willingness: string[]
          profession: string
          project_id: string
          region_id: string
          topics_interest: string[]
          updated_at: string | null
        }
        Insert: {
          age_range: string
          created_at?: string | null
          education_level: string
          gender: string
          id: string
          junta_link?: string | null
          junta_relationship?: string | null
          knowledge_level: string
          participation_willingness?: string[]
          profession: string
          project_id: string
          region_id: string
          topics_interest?: string[]
          updated_at?: string | null
        }
        Update: {
          age_range?: string
          created_at?: string | null
          education_level?: string
          gender?: string
          id?: string
          junta_link?: string | null
          junta_relationship?: string | null
          knowledge_level?: string
          participation_willingness?: string[]
          profession?: string
          project_id?: string
          region_id?: string
          topics_interest?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "residents_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residents_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_otps: { Args: Record<string, never>; Returns: undefined }
      is_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
