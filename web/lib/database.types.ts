export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ApplicationStatus =
  | "received"
  | "reviewing"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type StudyMode = "full-time" | "evening" | "online";

export type ProfileRole = "student" | "admin" | "faculty";

export type OcrStatus = "pending" | "processing" | "done" | "failed" | "skipped";

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string;
          created_at: string;
          full_name: string;
          email: string;
          phone: string;
          course_slug: string;
          study_mode: StudyMode;
          prev_qualification: string | null;
          notes: string | null;
          status: ApplicationStatus;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          full_name: string;
          email: string;
          phone: string;
          course_slug: string;
          study_mode: StudyMode;
          prev_qualification?: string | null;
          notes?: string | null;
          status?: ApplicationStatus;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          course_slug?: string;
          study_mode?: StudyMode;
          prev_qualification?: string | null;
          notes?: string | null;
          status?: ApplicationStatus;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "applications_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: ProfileRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: ProfileRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: ProfileRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      application_documents: {
        Row: {
          id: string;
          application_id: string;
          user_id: string | null;
          storage_path: string;
          filename: string;
          mime_type: string | null;
          size_bytes: number | null;
          ocr_status: OcrStatus;
          ocr_result: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          user_id?: string | null;
          storage_path: string;
          filename: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          ocr_status?: OcrStatus;
          ocr_result?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          user_id?: string | null;
          storage_path?: string;
          filename?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          ocr_status?: OcrStatus;
          ocr_result?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey";
            columns: ["application_id"];
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_documents_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      current_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
      handle_new_user: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

// Convenience aliases for app code.
export type Application = Database["public"]["Tables"]["applications"]["Row"];
export type ApplicationInsert = Database["public"]["Tables"]["applications"]["Insert"];
export type ApplicationUpdate = Database["public"]["Tables"]["applications"]["Update"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ApplicationDocument = Database["public"]["Tables"]["application_documents"]["Row"];
