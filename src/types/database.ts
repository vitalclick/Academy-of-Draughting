/**
 * Hand-authored types matching supabase/migrations/0001_init.sql.
 * Regenerate with `supabase gen types typescript` once the project is live.
 */

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export type DocumentKind = 'id' | 'matric' | 'cv' | 'other';

export type ApplicantRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  city: string | null;
  id_number: string | null;
  matric_year: string | null;
  created_at: string;
  updated_at: string;
};

export type ApplicationRow = {
  id: string;
  applicant_id: string;
  status: ApplicationStatus;
  programme: string;
  mode: string;
  campus: string;
  funding_plan: string;
  intake: string | null;
  submitted_at: string | null;
  decided_at: string | null;
  draft_payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type DocumentRow = {
  id: string;
  application_id: string;
  kind: DocumentKind;
  filename: string;
  storage_path: string;
  bytes: number;
  mime_type: string | null;
  ocr_payload: Record<string, unknown> | null;
  uploaded_at: string;
};

export type EnrollmentState = 'pending' | 'active' | 'completed' | 'withdrawn';
export type AssignmentKind = 'drawing' | 'theory' | 'project' | 'exam';
export type SubmissionState = 'draft' | 'submitted' | 'graded' | 'returned';

export type EnrollmentRow = {
  id: string;
  user_id: string;
  applicant_id: string;
  application_id: string | null;
  programme: string;
  cohort: string;
  state: EnrollmentState;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AssignmentRow = {
  id: string;
  programme: string;
  cohort: string | null;
  kind: AssignmentKind;
  module: string;
  title: string;
  brief: string | null;
  due_at: string | null;
  weight: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type SubmissionRow = {
  id: string;
  enrollment_id: string;
  assignment_id: string;
  state: SubmissionState;
  storage_path: string | null;
  filename: string | null;
  bytes: number | null;
  mime_type: string | null;
  comment: string | null;
  grade: number | null;
  grader_id: string | null;
  feedback: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentKind = 'blog_post' | 'faq' | 'testimonial' | 'page_section';
export type ContentState = 'draft' | 'review' | 'published' | 'archived';

export type ContentBlockRow = {
  id: string;
  kind: ContentKind;
  state: ContentState;
  slug: string | null;
  title: string;
  summary: string | null;
  body: string | null;
  metadata: Record<string, unknown>;
  author_id: string | null;
  ai_prompt: string | null;
  ai_model: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminRow = {
  user_id: string;
  email: string;
  role: 'staff' | 'super';
  created_at: string;
};

export type EventRow = {
  id: number;
  occurred_at: string;
  name: string;
  applicant_id: string | null;
  application_id: string | null;
  anonymous_id: string | null;
  session_id: string | null;
  payload: Record<string, unknown>;
};

export type Database = {
  public: {
    Tables: {
      applicants: {
        Row: ApplicantRow;
        Insert: Omit<ApplicantRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ApplicantRow, 'id'>>;
        Relationships: [];
      };
      applications: {
        Row: ApplicationRow;
        Insert: Omit<ApplicationRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ApplicationRow, 'id'>>;
        Relationships: [];
      };
      documents: {
        Row: DocumentRow;
        Insert: Omit<DocumentRow, 'id' | 'uploaded_at'> & { id?: string };
        Update: Partial<Omit<DocumentRow, 'id'>>;
        Relationships: [];
      };
      events: {
        Row: EventRow;
        Insert: Omit<EventRow, 'id' | 'occurred_at'> & { occurred_at?: string };
        Update: Partial<Omit<EventRow, 'id'>>;
        Relationships: [];
      };
      content_blocks: {
        Row: ContentBlockRow;
        Insert: Omit<ContentBlockRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ContentBlockRow, 'id'>>;
        Relationships: [];
      };
      admins: {
        Row: AdminRow;
        Insert: Omit<AdminRow, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<AdminRow, 'user_id'>>;
        Relationships: [];
      };
      enrollments: {
        Row: EnrollmentRow;
        Insert: Omit<EnrollmentRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<EnrollmentRow, 'id'>>;
        Relationships: [];
      };
      assignments: {
        Row: AssignmentRow;
        Insert: Omit<AssignmentRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<AssignmentRow, 'id'>>;
        Relationships: [];
      };
      submissions: {
        Row: SubmissionRow;
        Insert: Omit<SubmissionRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<SubmissionRow, 'id'>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
