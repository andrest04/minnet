// Tipos generados desde el schema de Supabase
// IMPORTANTE: Regenerar con: npx supabase gen types typescript --local > lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      regions: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          region_id: string;
          name: string;
          status: "active" | "inactive";
          created_at: string;
        };
        Insert: {
          id?: string;
          region_id: string;
          name: string;
          status?: "active" | "inactive";
          created_at?: string;
        };
        Update: {
          id?: string;
          region_id?: string;
          name?: string;
          status?: "active" | "inactive";
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_type: "resident" | "company" | "administrator";
          email: string | null;
          phone: string | null;
          consent_version: string | null;
          consent_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_type: "resident" | "company" | "administrator";
          email?: string | null;
          phone?: string | null;
          consent_version?: string | null;
          consent_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_type?: "resident" | "company" | "administrator";
          email?: string | null;
          phone?: string | null;
          consent_version?: string | null;
          consent_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      residents: {
        Row: {
          id: string;
          region_id: string;
          project_id: string;
          age_range: string;
          education_level: string;
          gender: string;
          profession: string;
          junta_link: "member" | "familiar" | "none" | null;
          junta_relationship: string | null;
          topics_interest: string[];
          knowledge_level: string;
          participation_willingness: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          region_id: string;
          project_id: string;
          age_range: string;
          education_level: string;
          gender: string;
          profession: string;
          junta_link?: "member" | "familiar" | "none" | null;
          junta_relationship?: string | null;
          topics_interest: string[];
          knowledge_level: string;
          participation_willingness: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          region_id?: string;
          project_id?: string;
          age_range?: string;
          education_level?: string;
          gender?: string;
          profession?: string;
          junta_link?: "member" | "familiar" | "none" | null;
          junta_relationship?: string | null;
          topics_interest?: string[];
          knowledge_level?: string;
          participation_willingness?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          company_name: string;
          responsible_area: string;
          position: string;
          validation_status: "pending" | "approved" | "rejected";
          use_objective: string | null;
          consultation_frequency: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_name: string;
          responsible_area: string;
          position: string;
          validation_status?: "pending" | "approved" | "rejected";
          use_objective?: string | null;
          consultation_frequency?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          responsible_area?: string;
          position?: string;
          validation_status?: "pending" | "approved" | "rejected";
          use_objective?: string | null;
          consultation_frequency?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      company_projects: {
        Row: {
          company_id: string;
          project_id: string;
          assigned_at: string;
        };
        Insert: {
          company_id: string;
          project_id: string;
          assigned_at?: string;
        };
        Update: {
          company_id?: string;
          project_id?: string;
          assigned_at?: string;
        };
      };
      administrators: {
        Row: {
          id: string;
          full_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
