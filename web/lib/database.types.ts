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

export type EnrollmentStatus = "active" | "completed" | "withdrawn";

export type SubmissionStatus = "draft" | "submitted" | "graded" | "returned";

export type DeletionRequestStatus = "pending" | "processing" | "completed" | "rejected";

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
          upload_token: string | null;
          upload_token_expires_at: string | null;
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
          upload_token?: string | null;
          upload_token_expires_at?: string | null;
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
          upload_token?: string | null;
          upload_token_expires_at?: string | null;
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
      modules: {
        Row: {
          id: string;
          course_slug: string;
          title: string;
          description: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_slug: string;
          title: string;
          description?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_slug?: string;
          title?: string;
          description?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_slug: string;
          cohort_label: string | null;
          status: EnrollmentStatus;
          enrolled_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_slug: string;
          cohort_label?: string | null;
          status?: EnrollmentStatus;
          enrolled_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_slug?: string;
          cohort_label?: string | null;
          status?: EnrollmentStatus;
          enrolled_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      assignments: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          description: string | null;
          due_at: string | null;
          max_score: number;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          description?: string | null;
          due_at?: string | null;
          max_score?: number;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          description?: string | null;
          due_at?: string | null;
          max_score?: number;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assignments_module_id_fkey";
            columns: ["module_id"];
            referencedRelation: "modules";
            referencedColumns: ["id"];
          }
        ];
      };
      submissions: {
        Row: {
          id: string;
          assignment_id: string;
          user_id: string;
          status: SubmissionStatus;
          storage_path: string | null;
          notes: string | null;
          score: number | null;
          feedback: string | null;
          submitted_at: string | null;
          graded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          user_id: string;
          status?: SubmissionStatus;
          storage_path?: string | null;
          notes?: string | null;
          score?: number | null;
          feedback?: string | null;
          submitted_at?: string | null;
          graded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          user_id?: string;
          status?: SubmissionStatus;
          storage_path?: string | null;
          notes?: string | null;
          score?: number | null;
          feedback?: string | null;
          submitted_at?: string | null;
          graded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey";
            columns: ["assignment_id"];
            referencedRelation: "assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      data_deletion_requests: {
        Row: {
          id: string;
          user_id: string;
          user_email: string;
          reason: string | null;
          status: DeletionRequestStatus;
          requested_at: string;
          processed_at: string | null;
          processed_by: string | null;
          processed_notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_email: string;
          reason?: string | null;
          status?: DeletionRequestStatus;
          requested_at?: string;
          processed_at?: string | null;
          processed_by?: string | null;
          processed_notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_email?: string;
          reason?: string | null;
          status?: DeletionRequestStatus;
          requested_at?: string;
          processed_at?: string | null;
          processed_by?: string | null;
          processed_notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "data_deletion_requests_user_id_fkey";
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
      is_enrolled: {
        Args: { course: string };
        Returns: boolean;
      };
      is_admin_or_faculty: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      cohort_progress: {
        Args: { course: string };
        Returns: Json;
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

export type Module = Database["public"]["Tables"]["modules"]["Row"];
export type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];
export type Assignment = Database["public"]["Tables"]["assignments"]["Row"];
export type Submission = Database["public"]["Tables"]["submissions"]["Row"];

export type CohortProgress = {
  cohort_size: number;
  my_score_total: number;
  my_graded_count: number;
  my_rank: number | null;
  cohort_avg_score: number;
  cohort_top_score: number;
  max_possible: number;
  assignment_count: number;
};
