export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_chat_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          profile_id: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          profile_id: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          profile_id?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_conversations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_profiles: {
        Row: {
          age_group: string | null
          ai_summary: string | null
          anonymous_id: string | null
          concerns: string[] | null
          created_at: string
          display_name: string | null
          id: string
          interests: string[] | null
          last_active_at: string | null
          location: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age_group?: string | null
          ai_summary?: string | null
          anonymous_id?: string | null
          concerns?: string[] | null
          created_at?: string
          display_name?: string | null
          id?: string
          interests?: string[] | null
          last_active_at?: string | null
          location?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age_group?: string | null
          ai_summary?: string | null
          anonymous_id?: string | null
          concerns?: string[] | null
          created_at?: string
          display_name?: string | null
          id?: string
          interests?: string[] | null
          last_active_at?: string | null
          location?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      campus_ambassador_details: {
        Row: {
          course: string | null
          id: string
          student_org_involvement: string | null
          submission_id: string
          university_name: string | null
          why_represent: string | null
          year_of_study: string | null
        }
        Insert: {
          course?: string | null
          id?: string
          student_org_involvement?: string | null
          submission_id: string
          university_name?: string | null
          why_represent?: string | null
          year_of_study?: string | null
        }
        Update: {
          course?: string | null
          id?: string
          student_org_involvement?: string | null
          submission_id?: string
          university_name?: string | null
          why_represent?: string | null
          year_of_study?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campus_ambassador_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_documents: {
        Row: {
          candidate_id: string
          document_type: string
          file_path: string
          file_size: number | null
          id: string
          notes: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          title: string
          uploaded_at: string
        }
        Insert: {
          candidate_id: string
          document_type?: string
          file_path: string
          file_size?: number | null
          id?: string
          notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          title: string
          uploaded_at?: string
        }
        Update: {
          candidate_id?: string
          document_type?: string
          file_path?: string
          file_size?: number | null
          id?: string
          notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          title?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_documents_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "hr_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_volunteer_details: {
        Row: {
          company_name: string | null
          department: string | null
          id: string
          interest_area: string | null
          job_role: string | null
          submission_id: string
        }
        Insert: {
          company_name?: string | null
          department?: string | null
          id?: string
          interest_area?: string | null
          job_role?: string | null
          submission_id: string
        }
        Update: {
          company_name?: string | null
          department?: string | null
          id?: string
          interest_area?: string | null
          job_role?: string | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "corporate_volunteer_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_attendance: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          facilitator_id: string | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          school_id: string | null
          visit_date: string
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          facilitator_id?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          school_id?: string | null
          visit_date?: string
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          facilitator_id?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          school_id?: string | null
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_attendance_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "crm_facilitators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_attendance_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "crm_schools"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_facilitators: {
        Row: {
          assigned_block: string | null
          assigned_schools: string[] | null
          created_at: string
          email: string | null
          id: string
          joining_date: string | null
          monthly_remuneration: number | null
          name: string
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_block?: string | null
          assigned_schools?: string[] | null
          created_at?: string
          email?: string | null
          id?: string
          joining_date?: string | null
          monthly_remuneration?: number | null
          name: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_block?: string | null
          assigned_schools?: string[] | null
          created_at?: string
          email?: string | null
          id?: string
          joining_date?: string | null
          monthly_remuneration?: number | null
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      crm_issues: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          priority: string | null
          reported_by: string | null
          school_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          reported_by?: string | null
          school_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          reported_by?: string | null
          school_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_issues_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "crm_schools"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_media_metadata: {
        Row: {
          activity_tag: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          file_path: string
          id: string
          school_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          activity_tag?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          file_path: string
          id?: string
          school_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          activity_tag?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          file_path?: string
          id?: string
          school_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_media_metadata_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "crm_schools"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          facilitator_id: string | null
          id: string
          month: string
          payment_date: string | null
          payment_mode: string | null
          reference_number: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          facilitator_id?: string | null
          id?: string
          month: string
          payment_date?: string | null
          payment_mode?: string | null
          reference_number?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          facilitator_id?: string | null
          id?: string
          month?: string
          payment_date?: string | null
          payment_mode?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_payments_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "crm_facilitators"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_schools: {
        Row: {
          block: string | null
          contact_number: string | null
          created_at: string
          created_by: string | null
          district: string | null
          drinking_water: boolean | null
          functional_toilets: boolean | null
          gps_lat: number | null
          gps_lng: number | null
          handwashing_station: boolean | null
          headmaster_name: string | null
          id: string
          num_teachers: number | null
          onboarded_at: string | null
          school_name: string
          school_type: string | null
          state: string | null
          total_students: number | null
          udise_code: string | null
          updated_at: string
          village: string | null
          waste_management: boolean | null
        }
        Insert: {
          block?: string | null
          contact_number?: string | null
          created_at?: string
          created_by?: string | null
          district?: string | null
          drinking_water?: boolean | null
          functional_toilets?: boolean | null
          gps_lat?: number | null
          gps_lng?: number | null
          handwashing_station?: boolean | null
          headmaster_name?: string | null
          id?: string
          num_teachers?: number | null
          onboarded_at?: string | null
          school_name: string
          school_type?: string | null
          state?: string | null
          total_students?: number | null
          udise_code?: string | null
          updated_at?: string
          village?: string | null
          waste_management?: boolean | null
        }
        Update: {
          block?: string | null
          contact_number?: string | null
          created_at?: string
          created_by?: string | null
          district?: string | null
          drinking_water?: boolean | null
          functional_toilets?: boolean | null
          gps_lat?: number | null
          gps_lng?: number | null
          handwashing_station?: boolean | null
          headmaster_name?: string | null
          id?: string
          num_teachers?: number | null
          onboarded_at?: string | null
          school_name?: string
          school_type?: string | null
          state?: string | null
          total_students?: number | null
          udise_code?: string | null
          updated_at?: string
          village?: string | null
          waste_management?: boolean | null
        }
        Relationships: []
      }
      crm_session_reports: {
        Row: {
          activities_conducted: string | null
          challenges_faced: string | null
          created_at: string
          facilitator_id: string | null
          id: string
          issue_reported: string | null
          photo_urls: string[] | null
          school_id: string | null
          session_date: string
          session_module: string | null
          students_present: number | null
          teachers_present: number | null
          updated_at: string
        }
        Insert: {
          activities_conducted?: string | null
          challenges_faced?: string | null
          created_at?: string
          facilitator_id?: string | null
          id?: string
          issue_reported?: string | null
          photo_urls?: string[] | null
          school_id?: string | null
          session_date?: string
          session_module?: string | null
          students_present?: number | null
          teachers_present?: number | null
          updated_at?: string
        }
        Update: {
          activities_conducted?: string | null
          challenges_faced?: string | null
          created_at?: string
          facilitator_id?: string | null
          id?: string
          issue_reported?: string | null
          photo_urls?: string[] | null
          school_id?: string | null
          session_date?: string
          session_module?: string | null
          students_present?: number | null
          teachers_present?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_session_reports_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "crm_facilitators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_session_reports_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "crm_schools"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_students: {
        Row: {
          age_band: string | null
          caste_category: string | null
          consent_caste_info: boolean | null
          consent_parent_info: boolean | null
          created_at: string
          gender: string | null
          grade: string | null
          id: string
          parent_contact: string | null
          parent_name: string | null
          school_id: string | null
          updated_at: string
        }
        Insert: {
          age_band?: string | null
          caste_category?: string | null
          consent_caste_info?: boolean | null
          consent_parent_info?: boolean | null
          created_at?: string
          gender?: string | null
          grade?: string | null
          id?: string
          parent_contact?: string | null
          parent_name?: string | null
          school_id?: string | null
          updated_at?: string
        }
        Update: {
          age_band?: string | null
          caste_category?: string | null
          consent_caste_info?: boolean | null
          consent_parent_info?: boolean | null
          created_at?: string
          gender?: string | null
          grade?: string | null
          id?: string
          parent_contact?: string | null
          parent_name?: string | null
          school_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "crm_schools"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_teachers: {
        Row: {
          contact: string | null
          created_at: string
          id: string
          name: string
          role: string | null
          school_id: string | null
          training_status: string | null
          updated_at: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          id?: string
          name: string
          role?: string | null
          school_id?: string | null
          training_status?: string | null
          updated_at?: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          id?: string
          name?: string
          role?: string | null
          school_id?: string | null
          training_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_teachers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "crm_schools"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["crm_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["crm_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["crm_role"]
          user_id?: string
        }
        Relationships: []
      }
      hr_activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      hr_assets: {
        Row: {
          asset_id: string
          asset_type: string
          assigned_date: string | null
          assigned_to: string | null
          brand: string | null
          condition: string | null
          created_at: string
          id: string
          model: string | null
          notes: string | null
          purchase_cost: number | null
          purchase_date: string | null
          return_date: string | null
          serial_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          asset_id: string
          asset_type: string
          assigned_date?: string | null
          assigned_to?: string | null
          brand?: string | null
          condition?: string | null
          created_at?: string
          id?: string
          model?: string | null
          notes?: string | null
          purchase_cost?: number | null
          purchase_date?: string | null
          return_date?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          asset_id?: string
          asset_type?: string
          assigned_date?: string | null
          assigned_to?: string | null
          brand?: string | null
          condition?: string | null
          created_at?: string
          id?: string
          model?: string | null
          notes?: string | null
          purchase_cost?: number | null
          purchase_date?: string | null
          return_date?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_assets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          date: string
          employee_id: string
          gps_lat: number | null
          gps_lng: number | null
          id: string
          notes: string | null
          status: string
          updated_at: string
          work_mode: string | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          employee_id: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          work_mode?: string | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          work_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_candidates: {
        Row: {
          applied_at: string
          cover_letter: string | null
          created_at: string
          current_organization: string | null
          email: string
          experience_years: number | null
          full_name: string
          id: string
          job_posting_id: string
          notes: string | null
          onboarding_status: string | null
          onboarding_token: string | null
          phone: string | null
          pipeline_stage: string
          rating: number | null
          resume_url: string | null
          skills: string[] | null
          updated_at: string
        }
        Insert: {
          applied_at?: string
          cover_letter?: string | null
          created_at?: string
          current_organization?: string | null
          email: string
          experience_years?: number | null
          full_name: string
          id?: string
          job_posting_id: string
          notes?: string | null
          onboarding_status?: string | null
          onboarding_token?: string | null
          phone?: string | null
          pipeline_stage?: string
          rating?: number | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
        }
        Update: {
          applied_at?: string
          cover_letter?: string | null
          created_at?: string
          current_organization?: string | null
          email?: string
          experience_years?: number | null
          full_name?: string
          id?: string
          job_posting_id?: string
          notes?: string | null
          onboarding_status?: string | null
          onboarding_token?: string | null
          phone?: string | null
          pipeline_stage?: string
          rating?: number | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_candidates_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "hr_job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_csr_allocations: {
        Row: {
          activity_log: string | null
          assigned_date: string | null
          created_at: string
          csr_project_id: string
          employee_id: string
          hours_spent: number | null
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          activity_log?: string | null
          assigned_date?: string | null
          created_at?: string
          csr_project_id: string
          employee_id: string
          hours_spent?: number | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          activity_log?: string | null
          assigned_date?: string | null
          created_at?: string
          csr_project_id?: string
          employee_id?: string
          hours_spent?: number | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_csr_allocations_csr_project_id_fkey"
            columns: ["csr_project_id"]
            isOneToOne: false
            referencedRelation: "hr_csr_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_csr_allocations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_csr_projects: {
        Row: {
          budget: number | null
          created_at: string
          created_by: string | null
          csr_partner: string | null
          description: string | null
          end_date: string | null
          id: string
          project_name: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          created_by?: string | null
          csr_partner?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          project_name: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          created_by?: string | null
          csr_partner?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          project_name?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      hr_departments: {
        Row: {
          created_at: string
          description: string | null
          head_employee_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          head_employee_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          head_employee_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_departments_head_fk"
            columns: ["head_employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_employee_bank_details: {
        Row: {
          account_holder_name: string | null
          account_number: string | null
          bank_name: string | null
          branch_name: string | null
          created_at: string
          employee_id: string
          id: string
          ifsc_code: string | null
          updated_at: string
        }
        Insert: {
          account_holder_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          branch_name?: string | null
          created_at?: string
          employee_id: string
          id?: string
          ifsc_code?: string | null
          updated_at?: string
        }
        Update: {
          account_holder_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          branch_name?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          ifsc_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_employee_bank_details_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_employee_documents: {
        Row: {
          document_type: string
          employee_id: string
          file_path: string
          file_size: number | null
          id: string
          notes: string | null
          title: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          document_type?: string
          employee_id: string
          file_path: string
          file_size?: number | null
          id?: string
          notes?: string | null
          title: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          document_type?: string
          employee_id?: string
          file_path?: string
          file_size?: number | null
          id?: string
          notes?: string | null
          title?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_employee_education: {
        Row: {
          certificate_path: string | null
          created_at: string
          degree: string
          employee_id: string
          field_of_study: string | null
          grade_or_percentage: string | null
          id: string
          institution: string
          year_of_passing: number | null
        }
        Insert: {
          certificate_path?: string | null
          created_at?: string
          degree: string
          employee_id: string
          field_of_study?: string | null
          grade_or_percentage?: string | null
          id?: string
          institution: string
          year_of_passing?: number | null
        }
        Update: {
          certificate_path?: string | null
          created_at?: string
          degree?: string
          employee_id?: string
          field_of_study?: string | null
          grade_or_percentage?: string | null
          id?: string
          institution?: string
          year_of_passing?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_employee_education_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_employee_emergency_contacts: {
        Row: {
          address: string | null
          contact_name: string
          created_at: string
          employee_id: string
          id: string
          phone: string
          relationship: string | null
        }
        Insert: {
          address?: string | null
          contact_name: string
          created_at?: string
          employee_id: string
          id?: string
          phone: string
          relationship?: string | null
        }
        Update: {
          address?: string | null
          contact_name?: string
          created_at?: string
          employee_id?: string
          id?: string
          phone?: string
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_employee_emergency_contacts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_employee_medical: {
        Row: {
          allergies: string | null
          blood_group: string | null
          created_at: string
          employee_id: string
          id: string
          medical_conditions: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          blood_group?: string | null
          created_at?: string
          employee_id: string
          id?: string
          medical_conditions?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          blood_group?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          medical_conditions?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_employee_medical_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_employee_previous_employment: {
        Row: {
          company_name: string
          created_at: string
          designation: string | null
          employee_id: string
          experience_letter_path: string | null
          from_date: string | null
          id: string
          reason_for_leaving: string | null
          to_date: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          designation?: string | null
          employee_id: string
          experience_letter_path?: string | null
          from_date?: string | null
          id?: string
          reason_for_leaving?: string | null
          to_date?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          designation?: string | null
          employee_id?: string
          experience_letter_path?: string | null
          from_date?: string | null
          id?: string
          reason_for_leaving?: string | null
          to_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_employee_previous_employment_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_employee_skills: {
        Row: {
          certification_date: string | null
          certification_name: string | null
          certified: boolean | null
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          proficiency_level: string | null
          skill_category: string
          skill_name: string
          updated_at: string
        }
        Insert: {
          certification_date?: string | null
          certification_name?: string | null
          certified?: boolean | null
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          proficiency_level?: string | null
          skill_category?: string
          skill_name: string
          updated_at?: string
        }
        Update: {
          certification_date?: string | null
          certification_name?: string | null
          certified?: boolean | null
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          proficiency_level?: string | null
          skill_category?: string
          skill_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_employee_skills_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_employees: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          department_id: string | null
          designation: string | null
          email: string
          employee_id: string
          employment_status: string | null
          employment_type: string | null
          full_name: string
          gender: string | null
          id: string
          joining_date: string | null
          lifecycle_stage: string | null
          onboarding_status: string
          phone: string | null
          photo_url: string | null
          reporting_manager_id: string | null
          salary_amount: number | null
          state: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          department_id?: string | null
          designation?: string | null
          email: string
          employee_id: string
          employment_status?: string | null
          employment_type?: string | null
          full_name: string
          gender?: string | null
          id?: string
          joining_date?: string | null
          lifecycle_stage?: string | null
          onboarding_status?: string
          phone?: string | null
          photo_url?: string | null
          reporting_manager_id?: string | null
          salary_amount?: number | null
          state?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          department_id?: string | null
          designation?: string | null
          email?: string
          employee_id?: string
          employment_status?: string | null
          employment_type?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          joining_date?: string | null
          lifecycle_stage?: string | null
          onboarding_status?: string
          phone?: string | null
          photo_url?: string | null
          reporting_manager_id?: string | null
          salary_amount?: number | null
          state?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hr_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_employees_reporting_manager_id_fkey"
            columns: ["reporting_manager_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_evaluations: {
        Row: {
          candidate_id: string
          comments: string | null
          communication_score: number | null
          created_at: string
          cultural_fit_score: number | null
          evaluator_id: string | null
          id: string
          interview_id: string | null
          leadership_score: number | null
          overall_score: number | null
          recommendation: string | null
          strengths: string | null
          technical_score: number | null
          weaknesses: string | null
        }
        Insert: {
          candidate_id: string
          comments?: string | null
          communication_score?: number | null
          created_at?: string
          cultural_fit_score?: number | null
          evaluator_id?: string | null
          id?: string
          interview_id?: string | null
          leadership_score?: number | null
          overall_score?: number | null
          recommendation?: string | null
          strengths?: string | null
          technical_score?: number | null
          weaknesses?: string | null
        }
        Update: {
          candidate_id?: string
          comments?: string | null
          communication_score?: number | null
          created_at?: string
          cultural_fit_score?: number | null
          evaluator_id?: string | null
          id?: string
          interview_id?: string | null
          leadership_score?: number | null
          overall_score?: number | null
          recommendation?: string | null
          strengths?: string | null
          technical_score?: number | null
          weaknesses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_evaluations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "hr_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_evaluations_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "hr_interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_grievances: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          is_anonymous: boolean | null
          priority: string | null
          resolution: string | null
          resolved_at: string | null
          status: string
          submitted_by: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_anonymous?: boolean | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          submitted_by?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_anonymous?: boolean | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          submitted_by?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_grievances_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_interviews: {
        Row: {
          candidate_id: string
          created_at: string
          duration_minutes: number | null
          feedback: string | null
          id: string
          interview_type: string | null
          interviewer_id: string | null
          location: string | null
          meeting_link: string | null
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_type?: string | null
          interviewer_id?: string | null
          location?: string | null
          meeting_link?: string | null
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_type?: string | null
          interviewer_id?: string | null
          location?: string | null
          meeting_link?: string | null
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "hr_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_interviews_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_job_postings: {
        Row: {
          closing_date: string | null
          created_at: string
          created_by: string | null
          department_id: string | null
          description: string | null
          employment_type: string | null
          experience_required: string | null
          id: string
          jd_file_url: string | null
          location: string | null
          positions: number | null
          published_at: string | null
          requirements: string | null
          salary_range: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          closing_date?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          employment_type?: string | null
          experience_required?: string | null
          id?: string
          jd_file_url?: string | null
          location?: string | null
          positions?: number | null
          published_at?: string | null
          requirements?: string | null
          salary_range?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          closing_date?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          employment_type?: string | null
          experience_required?: string | null
          id?: string
          jd_file_url?: string | null
          location?: string | null
          positions?: number | null
          published_at?: string | null
          requirements?: string | null
          salary_range?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_job_postings_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hr_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_leave_balances: {
        Row: {
          employee_id: string
          id: string
          leave_type_id: string
          remaining: number | null
          total_allocated: number
          used: number
          year: number
        }
        Insert: {
          employee_id: string
          id?: string
          leave_type_id: string
          remaining?: number | null
          total_allocated?: number
          used?: number
          year?: number
        }
        Update: {
          employee_id?: string
          id?: string
          leave_type_id?: string
          remaining?: number | null
          total_allocated?: number
          used?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "hr_leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_leave_balances_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "hr_leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          employee_id: string
          end_date: string
          id: string
          leave_type_id: string
          reason: string | null
          rejection_reason: string | null
          start_date: string
          status: string
          total_days: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id: string
          end_date: string
          id?: string
          leave_type_id: string
          reason?: string | null
          rejection_reason?: string | null
          start_date: string
          status?: string
          total_days?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id?: string
          end_date?: string
          id?: string
          leave_type_id?: string
          reason?: string | null
          rejection_reason?: string | null
          start_date?: string
          status?: string
          total_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "hr_leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_leave_types: {
        Row: {
          annual_quota: number
          carry_forward: boolean | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          annual_quota?: number
          carry_forward?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          annual_quota?: number
          carry_forward?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      hr_lifecycle_events: {
        Row: {
          created_at: string
          employee_id: string
          event_date: string
          from_stage: string | null
          id: string
          notes: string | null
          performed_by: string | null
          to_stage: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          event_date?: string
          from_stage?: string | null
          id?: string
          notes?: string | null
          performed_by?: string | null
          to_stage: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          event_date?: string
          from_stage?: string | null
          id?: string
          notes?: string | null
          performed_by?: string | null
          to_stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_lifecycle_events_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_notifications: {
        Row: {
          audience: string
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          audience?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          audience?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      hr_offboarding_clearances: {
        Row: {
          approved_by: string | null
          created_at: string
          department: string
          id: string
          offboarding_id: string
          remarks: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          department: string
          id?: string
          offboarding_id: string
          remarks?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          department?: string
          id?: string
          offboarding_id?: string
          remarks?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_offboarding_clearances_offboarding_id_fkey"
            columns: ["offboarding_id"]
            isOneToOne: false
            referencedRelation: "hr_offboarding_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_offboarding_requests: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          initiated_by: string | null
          last_working_date: string | null
          notes: string | null
          reason: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          initiated_by?: string | null
          last_working_date?: string | null
          notes?: string | null
          reason?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          initiated_by?: string | null
          last_working_date?: string | null
          notes?: string | null
          reason?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_offboarding_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_payslips: {
        Row: {
          basic_salary: number
          breakdown: Json | null
          created_at: string
          employee_id: string
          generated_at: string | null
          generated_by: string | null
          id: string
          month: string
          net_salary: number
          status: string
          total_deductions: number
          total_earnings: number
          year: number
        }
        Insert: {
          basic_salary?: number
          breakdown?: Json | null
          created_at?: string
          employee_id: string
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          month: string
          net_salary?: number
          status?: string
          total_deductions?: number
          total_earnings?: number
          year: number
        }
        Update: {
          basic_salary?: number
          breakdown?: Json | null
          created_at?: string
          employee_id?: string
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          month?: string
          net_salary?: number
          status?: string
          total_deductions?: number
          total_earnings?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "hr_payslips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_performance_reviews: {
        Row: {
          areas_of_improvement: string | null
          created_at: string
          employee_comments: string | null
          employee_id: string
          goals: string | null
          id: string
          manager_comments: string | null
          manager_rating: number | null
          overall_rating: number | null
          review_period: string
          reviewer_id: string | null
          self_rating: number | null
          status: string
          strengths: string | null
          updated_at: string
          year: number
        }
        Insert: {
          areas_of_improvement?: string | null
          created_at?: string
          employee_comments?: string | null
          employee_id: string
          goals?: string | null
          id?: string
          manager_comments?: string | null
          manager_rating?: number | null
          overall_rating?: number | null
          review_period: string
          reviewer_id?: string | null
          self_rating?: number | null
          status?: string
          strengths?: string | null
          updated_at?: string
          year?: number
        }
        Update: {
          areas_of_improvement?: string | null
          created_at?: string
          employee_comments?: string | null
          employee_id?: string
          goals?: string | null
          id?: string
          manager_comments?: string | null
          manager_rating?: number | null
          overall_rating?: number | null
          review_period?: string
          reviewer_id?: string | null
          self_rating?: number | null
          status?: string
          strengths?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "hr_performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_policies: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          created_by: string | null
          effective_date: string | null
          id: string
          is_active: boolean | null
          requires_acknowledgement: boolean | null
          title: string
          updated_at: string
          version: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean | null
          requires_acknowledgement?: boolean | null
          title: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean | null
          requires_acknowledgement?: boolean | null
          title?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      hr_policy_acknowledgements: {
        Row: {
          acknowledged_at: string
          employee_id: string
          id: string
          ip_address: string | null
          policy_id: string
        }
        Insert: {
          acknowledged_at?: string
          employee_id: string
          id?: string
          ip_address?: string | null
          policy_id: string
        }
        Update: {
          acknowledged_at?: string
          employee_id?: string
          id?: string
          ip_address?: string | null
          policy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_policy_acknowledgements_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_policy_acknowledgements_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "hr_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_project_members: {
        Row: {
          assigned_at: string
          employee_id: string
          id: string
          project_id: string
          role: string | null
        }
        Insert: {
          assigned_at?: string
          employee_id: string
          id?: string
          project_id: string
          role?: string | null
        }
        Update: {
          assigned_at?: string
          employee_id?: string
          id?: string
          project_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_project_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hr_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_projects: {
        Row: {
          budget: number | null
          created_at: string
          created_by: string | null
          department_id: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          priority: string | null
          progress: number | null
          project_lead_id: string | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          priority?: string | null
          progress?: number | null
          project_lead_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          priority?: string | null
          progress?: number | null
          project_lead_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_projects_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hr_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_projects_project_lead_id_fkey"
            columns: ["project_lead_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_salary_structures: {
        Row: {
          basic_salary: number
          created_at: string
          effective_from: string | null
          employee_id: string
          hra: number | null
          id: string
          medical_allowance: number | null
          other_deductions: number | null
          pf_deduction: number | null
          special_allowance: number | null
          tax_deduction: number | null
          transport_allowance: number | null
          updated_at: string
        }
        Insert: {
          basic_salary?: number
          created_at?: string
          effective_from?: string | null
          employee_id: string
          hra?: number | null
          id?: string
          medical_allowance?: number | null
          other_deductions?: number | null
          pf_deduction?: number | null
          special_allowance?: number | null
          tax_deduction?: number | null
          transport_allowance?: number | null
          updated_at?: string
        }
        Update: {
          basic_salary?: number
          created_at?: string
          effective_from?: string | null
          employee_id?: string
          hra?: number | null
          id?: string
          medical_allowance?: number | null
          other_deductions?: number | null
          pf_deduction?: number | null
          special_allowance?: number | null
          tax_deduction?: number | null
          transport_allowance?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_salary_structures_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_survey_responses: {
        Row: {
          answers: Json
          id: string
          respondent_id: string | null
          satisfaction_score: number | null
          submitted_at: string
          survey_id: string
        }
        Insert: {
          answers?: Json
          id?: string
          respondent_id?: string | null
          satisfaction_score?: number | null
          submitted_at?: string
          survey_id: string
        }
        Update: {
          answers?: Json
          id?: string
          respondent_id?: string | null
          satisfaction_score?: number | null
          submitted_at?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "hr_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_surveys: {
        Row: {
          closes_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_anonymous: boolean | null
          questions: Json
          survey_type: string
          title: string
        }
        Insert: {
          closes_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_anonymous?: boolean | null
          questions?: Json
          survey_type?: string
          title: string
        }
        Update: {
          closes_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_anonymous?: boolean | null
          questions?: Json
          survey_type?: string
          title?: string
        }
        Relationships: []
      }
      hr_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hr_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_training_courses: {
        Row: {
          category: string | null
          content_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_hours: number | null
          id: string
          is_active: boolean | null
          is_mandatory: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hr_training_enrollments: {
        Row: {
          certificate_url: string | null
          completed_at: string | null
          course_id: string
          employee_id: string | null
          enrolled_at: string
          id: string
          progress: number | null
          score: number | null
          status: string
          volunteer_id: string | null
        }
        Insert: {
          certificate_url?: string | null
          completed_at?: string | null
          course_id: string
          employee_id?: string | null
          enrolled_at?: string
          id?: string
          progress?: number | null
          score?: number | null
          status?: string
          volunteer_id?: string | null
        }
        Update: {
          certificate_url?: string | null
          completed_at?: string | null
          course_id?: string
          employee_id?: string | null
          enrolled_at?: string
          id?: string
          progress?: number | null
          score?: number | null
          status?: string
          volunteer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_training_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "hr_training_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_training_enrollments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_training_enrollments_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "hr_volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["hr_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["hr_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["hr_role"]
          user_id?: string
        }
        Relationships: []
      }
      hr_volunteer_activities: {
        Row: {
          activity_date: string | null
          activity_type: string
          beneficiaries_reached: number | null
          communities_served: number | null
          created_at: string
          description: string | null
          events_supported: number | null
          hours_contributed: number | null
          id: string
          project_name: string | null
          updated_at: string
          volunteer_email: string | null
          volunteer_name: string
        }
        Insert: {
          activity_date?: string | null
          activity_type?: string
          beneficiaries_reached?: number | null
          communities_served?: number | null
          created_at?: string
          description?: string | null
          events_supported?: number | null
          hours_contributed?: number | null
          id?: string
          project_name?: string | null
          updated_at?: string
          volunteer_email?: string | null
          volunteer_name: string
        }
        Update: {
          activity_date?: string | null
          activity_type?: string
          beneficiaries_reached?: number | null
          communities_served?: number | null
          created_at?: string
          description?: string | null
          events_supported?: number | null
          hours_contributed?: number | null
          id?: string
          project_name?: string | null
          updated_at?: string
          volunteer_email?: string | null
          volunteer_name?: string
        }
        Relationships: []
      }
      hr_volunteer_assignments: {
        Row: {
          assigned_at: string
          id: string
          project_id: string
          role: string | null
          status: string | null
          volunteer_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          project_id: string
          role?: string | null
          status?: string | null
          volunteer_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          project_id?: string
          role?: string | null
          status?: string | null
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_volunteer_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hr_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_volunteer_assignments_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "hr_volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_volunteer_certificates: {
        Row: {
          certificate_number: string
          certificate_type: string
          id: string
          issued_at: string
          issued_by: string | null
          notes: string | null
          project_names: string[] | null
          total_hours: number | null
          volunteer_id: string
        }
        Insert: {
          certificate_number: string
          certificate_type?: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          notes?: string | null
          project_names?: string[] | null
          total_hours?: number | null
          volunteer_id: string
        }
        Update: {
          certificate_number?: string
          certificate_type?: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          notes?: string | null
          project_names?: string[] | null
          total_hours?: number | null
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_volunteer_certificates_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_volunteer_certificates_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "hr_volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_volunteer_hours: {
        Row: {
          activity: string | null
          created_at: string
          date: string
          hours: number
          id: string
          notes: string | null
          project_id: string | null
          verified_at: string | null
          verified_by: string | null
          volunteer_id: string
        }
        Insert: {
          activity?: string | null
          created_at?: string
          date?: string
          hours?: number
          id?: string
          notes?: string | null
          project_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
          volunteer_id: string
        }
        Update: {
          activity?: string | null
          created_at?: string
          date?: string
          hours?: number
          id?: string
          notes?: string | null
          project_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_volunteer_hours_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hr_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_volunteer_hours_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_volunteer_hours_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "hr_volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_volunteers: {
        Row: {
          age: number | null
          areas_of_interest: string[] | null
          availability: string | null
          city: string | null
          created_at: string
          email: string
          employee_id: string | null
          full_name: string
          gender: string | null
          id: string
          joined_at: string | null
          notes: string | null
          phone: string | null
          skills: string[] | null
          state: string | null
          status: string
          total_hours: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age?: number | null
          areas_of_interest?: string[] | null
          availability?: string | null
          city?: string | null
          created_at?: string
          email: string
          employee_id?: string | null
          full_name: string
          gender?: string | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          phone?: string | null
          skills?: string[] | null
          state?: string | null
          status?: string
          total_hours?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age?: number | null
          areas_of_interest?: string[] | null
          availability?: string | null
          city?: string | null
          created_at?: string
          email?: string
          employee_id?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          phone?: string | null
          skills?: string[] | null
          state?: string | null
          status?: string
          total_hours?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_volunteers_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_details: {
        Row: {
          course: string | null
          duration_preference: string | null
          field_of_interest: string | null
          id: string
          submission_id: string
          university: string | null
          year_of_study: string | null
        }
        Insert: {
          course?: string | null
          duration_preference?: string | null
          field_of_interest?: string | null
          id?: string
          submission_id: string
          university?: string | null
          year_of_study?: string | null
        }
        Update: {
          course?: string | null
          duration_preference?: string | null
          field_of_interest?: string | null
          id?: string
          submission_id?: string
          university?: string | null
          year_of_study?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_organization_details: {
        Row: {
          id: string
          organization_description: string | null
          organization_name: string | null
          organization_type: string | null
          partnership_interest: string | null
          submission_id: string
          website: string | null
        }
        Insert: {
          id?: string
          organization_description?: string | null
          organization_name?: string | null
          organization_type?: string | null
          partnership_interest?: string | null
          submission_id: string
          website?: string | null
        }
        Update: {
          id?: string
          organization_description?: string | null
          organization_name?: string | null
          organization_type?: string | null
          partnership_interest?: string | null
          submission_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_organization_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string
          gender: string | null
          id: string
          linkedin_url: string | null
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name: string
          gender?: string | null
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          gender?: string | null
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          approved_at: string | null
          certificate_data: Json | null
          certificate_generated_at: string | null
          certificate_requested_at: string | null
          completed_at: string | null
          held_at: string | null
          hr_notes: string | null
          id: string
          offer_letter_data: Json | null
          offer_letter_generated_at: string | null
          rejected_at: string | null
          resume_url: string | null
          role: Database["public"]["Enums"]["participation_role"]
          status: string
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          certificate_data?: Json | null
          certificate_generated_at?: string | null
          certificate_requested_at?: string | null
          completed_at?: string | null
          held_at?: string | null
          hr_notes?: string | null
          id?: string
          offer_letter_data?: Json | null
          offer_letter_generated_at?: string | null
          rejected_at?: string | null
          resume_url?: string | null
          role: Database["public"]["Enums"]["participation_role"]
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          certificate_data?: Json | null
          certificate_generated_at?: string | null
          certificate_requested_at?: string | null
          completed_at?: string | null
          held_at?: string | null
          hr_notes?: string | null
          id?: string
          offer_letter_data?: Json | null
          offer_letter_generated_at?: string | null
          rejected_at?: string | null
          resume_url?: string | null
          role?: Database["public"]["Enums"]["participation_role"]
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteer_details: {
        Row: {
          areas_of_interest: string[] | null
          availability: string | null
          id: string
          previous_experience: string | null
          skills: string | null
          submission_id: string
        }
        Insert: {
          areas_of_interest?: string[] | null
          availability?: string | null
          id?: string
          previous_experience?: string | null
          skills?: string | null
          submission_id: string
        }
        Update: {
          areas_of_interest?: string[] | null
          availability?: string | null
          id?: string
          previous_experience?: string | null
          skills?: string | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_crm_role: { Args: { _user_id: string }; Returns: boolean }
      has_any_hr_role: { Args: { _user_id: string }; Returns: boolean }
      has_crm_role: {
        Args: {
          _role: Database["public"]["Enums"]["crm_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_hr_role: {
        Args: {
          _role: Database["public"]["Enums"]["hr_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      crm_role:
        | "crm_admin"
        | "supervisor"
        | "facilitator"
        | "finance"
        | "funder"
      hr_role:
        | "super_admin"
        | "hr_admin"
        | "manager"
        | "employee"
        | "volunteer"
        | "finance"
      participation_role:
        | "volunteer"
        | "internship"
        | "campus_ambassador"
        | "corporate_volunteer"
        | "partner_organization"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      crm_role: ["crm_admin", "supervisor", "facilitator", "finance", "funder"],
      hr_role: [
        "super_admin",
        "hr_admin",
        "manager",
        "employee",
        "volunteer",
        "finance",
      ],
      participation_role: [
        "volunteer",
        "internship",
        "campus_ambassador",
        "corporate_volunteer",
        "partner_organization",
      ],
    },
  },
} as const
