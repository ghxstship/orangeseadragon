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
      accommodations: {
        Row: {
          booking_id: string | null
          check_in_date: string
          check_in_time: string | null
          check_out_date: string
          check_out_time: string | null
          confirmation_number: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          event_id: string
          guest_email: string | null
          guest_name: string
          guest_phone: string | null
          hotel_address: string | null
          hotel_name: string
          hotel_phone: string | null
          id: string
          nightly_rate: number | null
          notes: string | null
          organization_id: string
          payment_method: string | null
          room_type: string | null
          special_requests: string | null
          status: Database["public"]["Enums"]["accommodation_status"] | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          check_in_date: string
          check_in_time?: string | null
          check_out_date: string
          check_out_time?: string | null
          confirmation_number?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          event_id: string
          guest_email?: string | null
          guest_name: string
          guest_phone?: string | null
          hotel_address?: string | null
          hotel_name: string
          hotel_phone?: string | null
          id?: string
          nightly_rate?: number | null
          notes?: string | null
          organization_id: string
          payment_method?: string | null
          room_type?: string | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["accommodation_status"] | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          check_in_date?: string
          check_in_time?: string | null
          check_out_date?: string
          check_out_time?: string | null
          confirmation_number?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          event_id?: string
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string | null
          hotel_address?: string | null
          hotel_name?: string
          hotel_phone?: string | null
          id?: string
          nightly_rate?: number | null
          notes?: string | null
          organization_id?: string
          payment_method?: string | null
          room_type?: string | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["accommodation_status"] | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "talent_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      account_type_configs: {
        Row: {
          color: string | null
          created_at: string | null
          default_role_slug: string | null
          description: string | null
          feature_flags: Json | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_internal: boolean | null
          name: string
          onboarding_steps: string[] | null
          position: number | null
          required_fields: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          default_role_slug?: string | null
          description?: string | null
          feature_flags?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_internal?: boolean | null
          name: string
          onboarding_steps?: string[] | null
          position?: number | null
          required_fields?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          default_role_slug?: string | null
          description?: string | null
          feature_flags?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_internal?: boolean | null
          name?: string
          onboarding_steps?: string[] | null
          position?: number | null
          required_fields?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          assigned_to: string | null
          company_id: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          deal_id: string | null
          description: string | null
          due_date: string | null
          event_id: string | null
          id: string
          is_completed: boolean | null
          notes: string | null
          organization_id: string
          outcome: string | null
          project_id: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          assigned_to?: string | null
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          organization_id: string
          outcome?: string | null
          project_id?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          assigned_to?: string | null
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          organization_id?: string
          outcome?: string | null
          project_id?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_dismissals: {
        Row: {
          announcement_id: string
          dismissed_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          dismissed_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          dismissed_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_dismissals_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "system_announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_dismissals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      anomaly_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          actual_value: number | null
          alert_type: string
          created_at: string | null
          description: string | null
          detected_at: string | null
          deviation_percent: number | null
          entity_id: string | null
          entity_type: string | null
          expected_value: number | null
          id: string
          is_false_positive: boolean | null
          metric_name: string | null
          organization_id: string
          resolution_notes: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          actual_value?: number | null
          alert_type: string
          created_at?: string | null
          description?: string | null
          detected_at?: string | null
          deviation_percent?: number | null
          entity_id?: string | null
          entity_type?: string | null
          expected_value?: number | null
          id?: string
          is_false_positive?: boolean | null
          metric_name?: string | null
          organization_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          actual_value?: number | null
          alert_type?: string
          created_at?: string | null
          description?: string | null
          detected_at?: string | null
          deviation_percent?: number | null
          entity_id?: string | null
          entity_type?: string | null
          expected_value?: number | null
          id?: string
          is_false_positive?: boolean | null
          metric_name?: string | null
          organization_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "anomaly_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anomaly_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_key_usage: {
        Row: {
          api_key_id: string
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown
          method: string
          response_time_ms: number | null
          status_code: number | null
          user_agent: string | null
        }
        Insert: {
          api_key_id: string
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: unknown
          method: string
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown
          method?: string
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_key_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          organization_id: string
          rate_limit: number | null
          revoked_at: string | null
          revoked_by: string | null
          scopes: string[] | null
          status: Database["public"]["Enums"]["api_key_status"] | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          organization_id: string
          rate_limit?: number | null
          revoked_at?: string | null
          revoked_by?: string | null
          scopes?: string[] | null
          status?: Database["public"]["Enums"]["api_key_status"] | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          rate_limit?: number | null
          revoked_at?: string | null
          revoked_by?: string | null
          scopes?: string[] | null
          status?: Database["public"]["Enums"]["api_key_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_decisions: {
        Row: {
          approval_request_id: string
          approver_id: string
          comments: string | null
          created_at: string | null
          decided_at: string | null
          decision: string
          delegated_to: string | null
          id: string
          step_number: number
        }
        Insert: {
          approval_request_id: string
          approver_id: string
          comments?: string | null
          created_at?: string | null
          decided_at?: string | null
          decision: string
          delegated_to?: string | null
          id?: string
          step_number: number
        }
        Update: {
          approval_request_id?: string
          approver_id?: string
          comments?: string | null
          created_at?: string | null
          decided_at?: string | null
          decision?: string
          delegated_to?: string | null
          id?: string
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "approval_decisions_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "approval_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_decisions_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_decisions_delegated_to_fkey"
            columns: ["delegated_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_requests: {
        Row: {
          approval_workflow_id: string
          completed_at: string | null
          created_at: string | null
          current_step: number | null
          due_date: string | null
          entity_id: string
          entity_type: string
          id: string
          notes: string | null
          organization_id: string
          requested_at: string | null
          requested_by: string
          status: Database["public"]["Enums"]["approval_request_status"] | null
          total_steps: number | null
          updated_at: string | null
        }
        Insert: {
          approval_workflow_id: string
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          due_date?: string | null
          entity_id: string
          entity_type: string
          id?: string
          notes?: string | null
          organization_id: string
          requested_at?: string | null
          requested_by: string
          status?: Database["public"]["Enums"]["approval_request_status"] | null
          total_steps?: number | null
          updated_at?: string | null
        }
        Update: {
          approval_workflow_id?: string
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          due_date?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          notes?: string | null
          organization_id?: string
          requested_at?: string | null
          requested_by?: string
          status?: Database["public"]["Enums"]["approval_request_status"] | null
          total_steps?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_approval_workflow_id_fkey"
            columns: ["approval_workflow_id"]
            isOneToOne: false
            referencedRelation: "approval_workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_workflows: {
        Row: {
          approval_type: Database["public"]["Enums"]["approval_workflow_type"]
          config: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          entity_type: string
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          approval_type: Database["public"]["Enums"]["approval_workflow_type"]
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_type: string
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          approval_type?: Database["public"]["Enums"]["approval_workflow_type"]
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_type?: string
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_workflows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      article_feedback: {
        Row: {
          article_id: string
          comment: string | null
          created_at: string | null
          id: string
          is_helpful: boolean
          user_id: string | null
        }
        Insert: {
          article_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          is_helpful: boolean
          user_id?: string | null
        }
        Update: {
          article_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_feedback_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "kb_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_categories: {
        Row: {
          color: string | null
          created_at: string | null
          custom_fields: Json | null
          depreciation_method:
            | Database["public"]["Enums"]["depreciation_method"]
            | null
          description: string | null
          icon: string | null
          id: string
          maintenance_interval_days: number | null
          name: string
          organization_id: string
          parent_id: string | null
          slug: string
          updated_at: string | null
          useful_life_months: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          depreciation_method?:
            | Database["public"]["Enums"]["depreciation_method"]
            | null
          description?: string | null
          icon?: string | null
          id?: string
          maintenance_interval_days?: number | null
          name: string
          organization_id: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
          useful_life_months?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          depreciation_method?:
            | Database["public"]["Enums"]["depreciation_method"]
            | null
          description?: string | null
          icon?: string | null
          id?: string
          maintenance_interval_days?: number | null
          name?: string
          organization_id?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
          useful_life_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "asset_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_check_actions: {
        Row: {
          action_type: Database["public"]["Enums"]["check_action_type"]
          actual_return_date: string | null
          asset_id: string | null
          checked_in_by: string | null
          checked_out_by: string | null
          checked_out_to: string | null
          condition_in: Database["public"]["Enums"]["asset_condition"] | null
          condition_out: Database["public"]["Enums"]["asset_condition"] | null
          created_at: string | null
          event_id: string | null
          expected_return_date: string | null
          from_location_id: string | null
          id: string
          kit_id: string | null
          notes: string | null
          organization_id: string
          project_id: string | null
          scan_method: Database["public"]["Enums"]["scan_method"] | null
          to_location_id: string | null
          updated_at: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["check_action_type"]
          actual_return_date?: string | null
          asset_id?: string | null
          checked_in_by?: string | null
          checked_out_by?: string | null
          checked_out_to?: string | null
          condition_in?: Database["public"]["Enums"]["asset_condition"] | null
          condition_out?: Database["public"]["Enums"]["asset_condition"] | null
          created_at?: string | null
          event_id?: string | null
          expected_return_date?: string | null
          from_location_id?: string | null
          id?: string
          kit_id?: string | null
          notes?: string | null
          organization_id: string
          project_id?: string | null
          scan_method?: Database["public"]["Enums"]["scan_method"] | null
          to_location_id?: string | null
          updated_at?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["check_action_type"]
          actual_return_date?: string | null
          asset_id?: string | null
          checked_in_by?: string | null
          checked_out_by?: string | null
          checked_out_to?: string | null
          condition_in?: Database["public"]["Enums"]["asset_condition"] | null
          condition_out?: Database["public"]["Enums"]["asset_condition"] | null
          created_at?: string | null
          event_id?: string | null
          expected_return_date?: string | null
          from_location_id?: string | null
          id?: string
          kit_id?: string | null
          notes?: string | null
          organization_id?: string
          project_id?: string | null
          scan_method?: Database["public"]["Enums"]["scan_method"] | null
          to_location_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_check_actions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_check_actions_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_check_actions_checked_out_by_fkey"
            columns: ["checked_out_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_check_actions_checked_out_to_fkey"
            columns: ["checked_out_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_check_actions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_check_actions_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_check_actions_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "asset_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_check_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_check_actions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_check_actions_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_documents: {
        Row: {
          asset_id: string
          created_at: string | null
          document_type: string
          expires_at: string | null
          file_size: number | null
          file_url: string
          id: string
          name: string
          notes: string | null
          uploaded_by: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          document_type: string
          expires_at?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          name: string
          notes?: string | null
          uploaded_by?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          document_type?: string
          expires_at?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          name?: string
          notes?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_documents_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_kit_items: {
        Row: {
          asset_id: string
          created_at: string | null
          id: string
          is_required: boolean | null
          kit_id: string
          notes: string | null
          quantity: number | null
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          kit_id: string
          notes?: string | null
          quantity?: number | null
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          kit_id?: string
          notes?: string | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_kit_items_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_kit_items_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "asset_kits"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_kits: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          kit_number: string
          location_id: string | null
          name: string
          notes: string | null
          organization_id: string
          slug: string
          status: Database["public"]["Enums"]["asset_status"] | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          kit_number: string
          location_id?: string | null
          name: string
          notes?: string | null
          organization_id: string
          slug: string
          status?: Database["public"]["Enums"]["asset_status"] | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          kit_number?: string
          location_id?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          slug?: string
          status?: Database["public"]["Enums"]["asset_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_kits_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "asset_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_kits_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_kits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_maintenance: {
        Row: {
          asset_id: string
          completed_date: string | null
          cost: number | null
          cost_currency: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          maintenance_type: Database["public"]["Enums"]["maintenance_type"]
          next_maintenance_date: string | null
          notes: string | null
          organization_id: string
          parts_used: Json | null
          performed_by: string | null
          scheduled_date: string
          status: Database["public"]["Enums"]["maintenance_status"] | null
          title: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          asset_id: string
          completed_date?: string | null
          cost?: number | null
          cost_currency?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          maintenance_type: Database["public"]["Enums"]["maintenance_type"]
          next_maintenance_date?: string | null
          notes?: string | null
          organization_id: string
          parts_used?: Json | null
          performed_by?: string | null
          scheduled_date: string
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          title: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          asset_id?: string
          completed_date?: string | null
          cost?: number | null
          cost_currency?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          maintenance_type?: Database["public"]["Enums"]["maintenance_type"]
          next_maintenance_date?: string | null
          notes?: string | null
          organization_id?: string
          parts_used?: Json | null
          performed_by?: string | null
          scheduled_date?: string
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          title?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_maintenance_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_maintenance_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_maintenance_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_maintenance_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_reservations: {
        Row: {
          asset_id: string | null
          created_at: string | null
          end_date: string
          event_id: string | null
          id: string
          kit_id: string | null
          notes: string | null
          organization_id: string
          project_id: string | null
          reserved_by: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          asset_id?: string | null
          created_at?: string | null
          end_date: string
          event_id?: string | null
          id?: string
          kit_id?: string | null
          notes?: string | null
          organization_id: string
          project_id?: string | null
          reserved_by: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_id?: string | null
          created_at?: string | null
          end_date?: string
          event_id?: string | null
          id?: string
          kit_id?: string | null
          notes?: string | null
          organization_id?: string
          project_id?: string | null
          reserved_by?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_reservations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_reservations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_reservations_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "asset_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_reservations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_reservations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_reservations_reserved_by_fkey"
            columns: ["reserved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_tag: string
          barcode: string | null
          category_id: string
          condition: Database["public"]["Enums"]["asset_condition"] | null
          created_at: string | null
          created_by: string | null
          current_value: number | null
          custom_fields: Json | null
          deleted_at: string | null
          depreciation_method:
            | Database["public"]["Enums"]["depreciation_method"]
            | null
          description: string | null
          id: string
          image_url: string | null
          last_depreciation_date: string | null
          location_id: string | null
          manufacturer: string | null
          model: string | null
          name: string
          notes: string | null
          organization_id: string
          purchase_currency: string | null
          purchase_date: string | null
          purchase_price: number | null
          qr_code: string | null
          rfid_tag: string | null
          salvage_value: number | null
          serial_number: string | null
          specifications: Json | null
          status: Database["public"]["Enums"]["asset_status"] | null
          updated_at: string | null
          useful_life_months: number | null
          vendor_id: string | null
          warranty_expires: string | null
        }
        Insert: {
          asset_tag: string
          barcode?: string | null
          category_id: string
          condition?: Database["public"]["Enums"]["asset_condition"] | null
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          custom_fields?: Json | null
          deleted_at?: string | null
          depreciation_method?:
            | Database["public"]["Enums"]["depreciation_method"]
            | null
          description?: string | null
          id?: string
          image_url?: string | null
          last_depreciation_date?: string | null
          location_id?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          notes?: string | null
          organization_id: string
          purchase_currency?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          qr_code?: string | null
          rfid_tag?: string | null
          salvage_value?: number | null
          serial_number?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["asset_status"] | null
          updated_at?: string | null
          useful_life_months?: number | null
          vendor_id?: string | null
          warranty_expires?: string | null
        }
        Update: {
          asset_tag?: string
          barcode?: string | null
          category_id?: string
          condition?: Database["public"]["Enums"]["asset_condition"] | null
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          custom_fields?: Json | null
          deleted_at?: string | null
          depreciation_method?:
            | Database["public"]["Enums"]["depreciation_method"]
            | null
          description?: string | null
          id?: string
          image_url?: string | null
          last_depreciation_date?: string | null
          location_id?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          purchase_currency?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          qr_code?: string | null
          rfid_tag?: string | null
          salvage_value?: number | null
          serial_number?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["asset_status"] | null
          updated_at?: string | null
          useful_life_months?: number | null
          vendor_id?: string | null
          warranty_expires?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "asset_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_findings: {
        Row: {
          assigned_to: string | null
          audit_id: string
          category: string | null
          created_at: string | null
          description: string
          due_date: string | null
          evidence: string | null
          finding_number: string
          id: string
          management_response: string | null
          recommendation: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["finding_severity"]
          status: string | null
          title: string
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          assigned_to?: string | null
          audit_id: string
          category?: string | null
          created_at?: string | null
          description: string
          due_date?: string | null
          evidence?: string | null
          finding_number: string
          id?: string
          management_response?: string | null
          recommendation?: string | null
          resolved_at?: string | null
          severity: Database["public"]["Enums"]["finding_severity"]
          status?: string | null
          title: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          assigned_to?: string | null
          audit_id?: string
          category?: string | null
          created_at?: string | null
          description?: string
          due_date?: string | null
          evidence?: string | null
          finding_number?: string
          id?: string
          management_response?: string | null
          recommendation?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["finding_severity"]
          status?: string | null
          title?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_findings_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_findings_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audit_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_findings_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          organization_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          organization_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_schedules: {
        Row: {
          audit_type: string
          auditors: string[] | null
          completed_at: string | null
          created_at: string | null
          department_id: string | null
          description: string | null
          id: string
          lead_auditor_id: string | null
          name: string
          notes: string | null
          organization_id: string
          project_id: string | null
          scheduled_date: string
          scope: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["audit_status"] | null
          updated_at: string | null
        }
        Insert: {
          audit_type: string
          auditors?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          lead_auditor_id?: string | null
          name: string
          notes?: string | null
          organization_id: string
          project_id?: string | null
          scheduled_date: string
          scope?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["audit_status"] | null
          updated_at?: string | null
        }
        Update: {
          audit_type?: string
          auditors?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          lead_auditor_id?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          project_id?: string | null
          scheduled_date?: string
          scope?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["audit_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_schedules_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_schedules_lead_auditor_id_fkey"
            columns: ["lead_auditor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_schedules_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_invoice_items: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          metadata: Json | null
          period_end: string | null
          period_start: string | null
          quantity: number | null
          unit_price: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          quantity?: number | null
          unit_price: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          quantity?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "billing_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_invoices: {
        Row: {
          created_at: string | null
          currency: string | null
          discount: number | null
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          organization_id: string
          paid_at: string | null
          pdf_url: string | null
          period_end: string | null
          period_start: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subscription_id: string | null
          subtotal: number
          tax: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          organization_id: string
          paid_at?: string | null
          pdf_url?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          subtotal: number
          tax?: number | null
          total: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          organization_id?: string
          paid_at?: string | null
          pdf_url?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "organization_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_guidelines: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          document_url: string | null
          dos_and_donts: Json | null
          id: string
          imagery_guidelines: string | null
          logo_usage: Json | null
          name: string
          organization_id: string
          primary_colors: Json | null
          published_at: string | null
          secondary_colors: Json | null
          status: Database["public"]["Enums"]["brand_guideline_status"] | null
          templates: Json | null
          typography: Json | null
          updated_at: string | null
          version: string | null
          voice_tone: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_url?: string | null
          dos_and_donts?: Json | null
          id?: string
          imagery_guidelines?: string | null
          logo_usage?: Json | null
          name: string
          organization_id: string
          primary_colors?: Json | null
          published_at?: string | null
          secondary_colors?: Json | null
          status?: Database["public"]["Enums"]["brand_guideline_status"] | null
          templates?: Json | null
          typography?: Json | null
          updated_at?: string | null
          version?: string | null
          voice_tone?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_url?: string | null
          dos_and_donts?: Json | null
          id?: string
          imagery_guidelines?: string | null
          logo_usage?: Json | null
          name?: string
          organization_id?: string
          primary_colors?: Json | null
          published_at?: string | null
          secondary_colors?: Json | null
          status?: Database["public"]["Enums"]["brand_guideline_status"] | null
          templates?: Json | null
          typography?: Json | null
          updated_at?: string | null
          version?: string | null
          voice_tone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_guidelines_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_guidelines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_categories: {
        Row: {
          category_type: Database["public"]["Enums"]["budget_category_type"]
          code: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          category_type: Database["public"]["Enums"]["budget_category_type"]
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          category_type?: Database["public"]["Enums"]["budget_category_type"]
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_line_items: {
        Row: {
          actual_amount: number | null
          budget_id: string
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          notes: string | null
          planned_amount: number
          updated_at: string | null
          variance: number | null
        }
        Insert: {
          actual_amount?: number | null
          budget_id: string
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          planned_amount: number
          updated_at?: string | null
          variance?: number | null
        }
        Update: {
          actual_amount?: number | null
          budget_id?: string
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          planned_amount?: number
          updated_at?: string | null
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_line_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_line_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_vs_actual: {
        Row: {
          actual_amount: number | null
          budget_id: string | null
          budgeted_amount: number
          calculated_at: string | null
          category_id: string | null
          committed_amount: number | null
          created_at: string | null
          event_id: string | null
          id: string
          notes: string | null
          organization_id: string
          period_end: string
          period_start: string
          project_id: string | null
          variance: number | null
          variance_percent: number | null
        }
        Insert: {
          actual_amount?: number | null
          budget_id?: string | null
          budgeted_amount: number
          calculated_at?: string | null
          category_id?: string | null
          committed_amount?: number | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          period_end: string
          period_start: string
          project_id?: string | null
          variance?: number | null
          variance_percent?: number | null
        }
        Update: {
          actual_amount?: number | null
          budget_id?: string | null
          budgeted_amount?: number
          calculated_at?: string | null
          category_id?: string | null
          committed_amount?: number | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          period_end?: string
          period_start?: string
          project_id?: string | null
          variance?: number | null
          variance_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_vs_actual_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_vs_actual_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_vs_actual_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_vs_actual_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_vs_actual_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          department_id: string | null
          description: string | null
          end_date: string
          event_id: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          period_type: Database["public"]["Enums"]["budget_period_type"]
          project_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["budget_status"] | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          department_id?: string | null
          description?: string | null
          end_date: string
          event_id?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          period_type: Database["public"]["Enums"]["budget_period_type"]
          project_id?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["budget_status"] | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          department_id?: string | null
          description?: string | null
          end_date?: string
          event_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          period_type?: Database["public"]["Enums"]["budget_period_type"]
          project_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["budget_status"] | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_event_attendees: {
        Row: {
          created_at: string | null
          email: string | null
          event_id: string
          id: string
          is_optional: boolean | null
          is_organizer: boolean | null
          name: string | null
          responded_at: string | null
          response: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          event_id: string
          id?: string
          is_optional?: boolean | null
          is_organizer?: boolean | null
          name?: string | null
          responded_at?: string | null
          response?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          event_id?: string
          id?: string
          is_optional?: boolean | null
          is_organizer?: boolean | null
          name?: string | null
          responded_at?: string | null
          response?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string
          entity_id: string | null
          entity_type: string | null
          external_id: string | null
          external_source: string | null
          id: string
          is_recurring: boolean | null
          location: string | null
          organization_id: string
          recurrence_rule: string | null
          start_time: string
          timezone: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          visibility: Database["public"]["Enums"]["visibility_type"] | null
        }
        Insert: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time: string
          entity_id?: string | null
          entity_type?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          organization_id: string
          recurrence_rule?: string | null
          start_time: string
          timezone?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
        }
        Update: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string
          entity_id?: string | null
          entity_type?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          organization_id?: string
          recurrence_rule?: string | null
          start_time?: string
          timezone?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_sync_connections: {
        Row: {
          access_token_encrypted: string | null
          created_at: string | null
          external_calendar_id: string | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          provider: string
          refresh_token_encrypted: string | null
          sync_direction: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string | null
          external_calendar_id?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          provider: string
          refresh_token_encrypted?: string | null
          sync_direction?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string | null
          external_calendar_id?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          provider?: string
          refresh_token_encrypted?: string | null
          sync_direction?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_sync_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget: number | null
          campaign_type: Database["public"]["Enums"]["campaign_type"]
          channels: string[] | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          end_date: string | null
          event_id: string | null
          goals: Json | null
          id: string
          kpis: Json | null
          name: string
          notes: string | null
          organization_id: string
          project_id: string | null
          spent: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          target_audience: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          campaign_type: Database["public"]["Enums"]["campaign_type"]
          channels?: string[] | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          event_id?: string | null
          goals?: Json | null
          id?: string
          kpis?: Json | null
          name: string
          notes?: string | null
          organization_id: string
          project_id?: string | null
          spent?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_audience?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          campaign_type?: Database["public"]["Enums"]["campaign_type"]
          channels?: string[] | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          event_id?: string | null
          goals?: Json | null
          id?: string
          kpis?: Json | null
          name?: string
          notes?: string | null
          organization_id?: string
          project_id?: string | null
          spent?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_audience?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      capacity_plan_items: {
        Row: {
          allocated_hours: number | null
          capacity_hours: number
          capacity_plan_id: string
          created_at: string | null
          department_id: string | null
          id: string
          notes: string | null
          period_end: string
          period_start: string
          position_id: string | null
          updated_at: string | null
          user_id: string | null
          utilization_percent: number | null
        }
        Insert: {
          allocated_hours?: number | null
          capacity_hours: number
          capacity_plan_id: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          position_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          utilization_percent?: number | null
        }
        Update: {
          allocated_hours?: number | null
          capacity_hours?: number
          capacity_plan_id?: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          position_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          utilization_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "capacity_plan_items_capacity_plan_id_fkey"
            columns: ["capacity_plan_id"]
            isOneToOne: false
            referencedRelation: "capacity_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capacity_plan_items_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capacity_plan_items_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capacity_plan_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      capacity_plans: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          name: string
          organization_id: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          name: string
          organization_id: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          organization_id?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capacity_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capacity_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      catering_orders: {
        Row: {
          actual_cost: number | null
          booking_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          delivery_location: string | null
          delivery_time: string | null
          dietary_requirements: Json | null
          estimated_cost: number | null
          event_day_id: string | null
          event_id: string
          head_count: number | null
          id: string
          menu_items: Json | null
          notes: string | null
          order_type: Database["public"]["Enums"]["catering_order_type"]
          organization_id: string
          special_requests: string | null
          status: Database["public"]["Enums"]["catering_status"] | null
          updated_at: string | null
          vendor_contact: string | null
          vendor_name: string | null
        }
        Insert: {
          actual_cost?: number | null
          booking_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          delivery_location?: string | null
          delivery_time?: string | null
          dietary_requirements?: Json | null
          estimated_cost?: number | null
          event_day_id?: string | null
          event_id: string
          head_count?: number | null
          id?: string
          menu_items?: Json | null
          notes?: string | null
          order_type: Database["public"]["Enums"]["catering_order_type"]
          organization_id: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["catering_status"] | null
          updated_at?: string | null
          vendor_contact?: string | null
          vendor_name?: string | null
        }
        Update: {
          actual_cost?: number | null
          booking_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          delivery_location?: string | null
          delivery_time?: string | null
          dietary_requirements?: Json | null
          estimated_cost?: number | null
          event_day_id?: string | null
          event_id?: string
          head_count?: number | null
          id?: string
          menu_items?: Json | null
          notes?: string | null
          order_type?: Database["public"]["Enums"]["catering_order_type"]
          organization_id?: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["catering_status"] | null
          updated_at?: string | null
          vendor_contact?: string | null
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catering_orders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "talent_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catering_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catering_orders_event_day_id_fkey"
            columns: ["event_day_id"]
            isOneToOne: false
            referencedRelation: "event_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catering_orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catering_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      certification_types: {
        Row: {
          created_at: string | null
          departments: string[] | null
          description: string | null
          id: string
          is_required: boolean | null
          issuing_authority: string | null
          name: string
          organization_id: string
          positions: string[] | null
          slug: string
          updated_at: string | null
          validity_months: number | null
        }
        Insert: {
          created_at?: string | null
          departments?: string[] | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          issuing_authority?: string | null
          name: string
          organization_id: string
          positions?: string[] | null
          slug: string
          updated_at?: string | null
          validity_months?: number | null
        }
        Update: {
          created_at?: string | null
          departments?: string[] | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          issuing_authority?: string | null
          name?: string
          organization_id?: string
          positions?: string[] | null
          slug?: string
          updated_at?: string | null
          validity_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "certification_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_judges: {
        Row: {
          challenge_id: string
          created_at: string | null
          id: string
          role: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          challenge_id: string
          created_at?: string | null
          id?: string
          role?: string | null
          user_id: string
          weight?: number | null
        }
        Update: {
          challenge_id?: string
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_judges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_judges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_submissions: {
        Row: {
          challenge_id: string
          content: string | null
          created_at: string | null
          description: string | null
          external_url: string | null
          feedback: string | null
          id: string
          is_winner: boolean | null
          media_urls: Json | null
          rank: number | null
          score: number | null
          submitted_at: string | null
          submitter_id: string
          title: string
          updated_at: string | null
          votes_count: number | null
        }
        Insert: {
          challenge_id: string
          content?: string | null
          created_at?: string | null
          description?: string | null
          external_url?: string | null
          feedback?: string | null
          id?: string
          is_winner?: boolean | null
          media_urls?: Json | null
          rank?: number | null
          score?: number | null
          submitted_at?: string | null
          submitter_id: string
          title: string
          updated_at?: string | null
          votes_count?: number | null
        }
        Update: {
          challenge_id?: string
          content?: string | null
          created_at?: string | null
          description?: string | null
          external_url?: string | null
          feedback?: string | null
          id?: string
          is_winner?: boolean | null
          media_urls?: Json | null
          rank?: number | null
          score?: number | null
          submitted_at?: string | null
          submitter_id?: string
          title?: string
          updated_at?: string | null
          votes_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_votes: {
        Row: {
          created_at: string | null
          id: string
          score: number | null
          submission_id: string
          voter_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          score?: number | null
          submission_id: string
          voter_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          score?: number | null
          submission_id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_votes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "challenge_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_public: boolean | null
          judging_criteria: Json | null
          max_submissions: number | null
          name: string
          organization_id: string
          prizes: Json | null
          rules: string | null
          slug: string
          start_date: string | null
          status: Database["public"]["Enums"]["challenge_status"] | null
          submission_requirements: Json | null
          updated_at: string | null
          voting_end: string | null
          voting_start: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_public?: boolean | null
          judging_criteria?: Json | null
          max_submissions?: number | null
          name: string
          organization_id: string
          prizes?: Json | null
          rules?: string | null
          slug: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["challenge_status"] | null
          submission_requirements?: Json | null
          updated_at?: string | null
          voting_end?: string | null
          voting_start?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_public?: boolean | null
          judging_criteria?: Json | null
          max_submissions?: number | null
          name?: string
          organization_id?: string
          prizes?: Json | null
          rules?: string | null
          slug?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["challenge_status"] | null
          submission_requirements?: Json | null
          updated_at?: string | null
          voting_end?: string | null
          voting_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          assigned_to: string | null
          checklist_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          is_required: boolean | null
          notes: string | null
          parent_id: string | null
          position: number | null
          template_item_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          checklist_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          is_required?: boolean | null
          notes?: string | null
          parent_id?: string | null
          position?: number | null
          template_item_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          checklist_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          is_required?: boolean | null
          notes?: string | null
          parent_id?: string | null
          position?: number | null
          template_item_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_template_item_id_fkey"
            columns: ["template_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_template_items"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_template_items: {
        Row: {
          assigned_role: string | null
          created_at: string | null
          description: string | null
          due_offset_days: number | null
          id: string
          is_required: boolean | null
          parent_id: string | null
          position: number | null
          template_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_role?: string | null
          created_at?: string | null
          description?: string | null
          due_offset_days?: number | null
          id?: string
          is_required?: boolean | null
          parent_id?: string | null
          position?: number | null
          template_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_role?: string | null
          created_at?: string | null
          description?: string | null
          due_offset_days?: number | null
          id?: string
          is_required?: boolean | null
          parent_id?: string | null
          position?: number | null
          template_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_template_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "checklist_template_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          entity_type: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_type?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_type?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string | null
          due_date: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          name: string
          organization_id: string
          progress_percent: number | null
          status: Database["public"]["Enums"]["checklist_status"] | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          name: string
          organization_id: string
          progress_percent?: number | null
          status?: Database["public"]["Enums"]["checklist_status"] | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          name?: string
          organization_id?: string
          progress_percent?: number | null
          status?: Database["public"]["Enums"]["checklist_status"] | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklists_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          is_hidden: boolean | null
          likes_count: number | null
          parent_id: string | null
          post_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          is_hidden?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          post_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_hidden?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          post_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "community_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "community_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "community_members"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_image_url: string | null
          created_at: string | null
          display_name: string
          external_id: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          interests: string[] | null
          is_active: boolean | null
          is_verified: boolean | null
          joined_at: string | null
          last_active_at: string | null
          location: string | null
          member_type:
            | Database["public"]["Enums"]["community_member_type"]
            | null
          organization_id: string
          social_links: Json | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          display_name: string
          external_id?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          is_verified?: boolean | null
          joined_at?: string | null
          last_active_at?: string | null
          location?: string | null
          member_type?:
            | Database["public"]["Enums"]["community_member_type"]
            | null
          organization_id: string
          social_links?: Json | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          display_name?: string
          external_id?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          is_verified?: boolean | null
          joined_at?: string | null
          last_active_at?: string | null
          location?: string | null
          member_type?:
            | Database["public"]["Enums"]["community_member_type"]
            | null
          organization_id?: string
          social_links?: Json | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          comments_count: number | null
          content: string | null
          created_at: string | null
          event_id: string | null
          id: string
          is_featured: boolean | null
          is_pinned: boolean | null
          likes_count: number | null
          media_urls: Json | null
          organization_id: string
          poll_ends_at: string | null
          poll_options: Json | null
          post_type: Database["public"]["Enums"]["post_type"] | null
          published_at: string | null
          shares_count: number | null
          updated_at: string | null
          visibility: Database["public"]["Enums"]["post_visibility"] | null
        }
        Insert: {
          author_id: string
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_featured?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: Json | null
          organization_id: string
          poll_ends_at?: string | null
          poll_options?: Json | null
          post_type?: Database["public"]["Enums"]["post_type"] | null
          published_at?: string | null
          shares_count?: number | null
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["post_visibility"] | null
        }
        Update: {
          author_id?: string
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_featured?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: Json | null
          organization_id?: string
          poll_ends_at?: string | null
          poll_options?: Json | null
          post_type?: Database["public"]["Enums"]["post_type"] | null
          published_at?: string | null
          shares_count?: number | null
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["post_visibility"] | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "community_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          annual_revenue: number | null
          city: string | null
          company_type: Database["public"]["Enums"]["company_type"] | null
          country: string | null
          created_at: string | null
          created_by: string | null
          custom_fields: Json | null
          description: string | null
          email: string | null
          employee_count: number | null
          id: string
          industry: string | null
          is_active: boolean | null
          legal_name: string | null
          logo_url: string | null
          name: string
          organization_id: string
          phone: string | null
          postal_code: string | null
          state: string | null
          tags: string[] | null
          tax_id: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          annual_revenue?: number | null
          city?: string | null
          company_type?: Database["public"]["Enums"]["company_type"] | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          description?: string | null
          email?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          legal_name?: string | null
          logo_url?: string | null
          name: string
          organization_id: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tags?: string[] | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          annual_revenue?: number | null
          city?: string | null
          company_type?: Database["public"]["Enums"]["company_type"] | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          description?: string | null
          email?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          organization_id?: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tags?: string[] | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_incidents: {
        Row: {
          affected_data: string | null
          affected_systems: string[] | null
          corrective_actions: string | null
          created_at: string | null
          description: string
          discovered_at: string | null
          id: string
          immediate_actions: string | null
          incident_number: string
          incident_type: string
          lessons_learned: string | null
          occurred_at: string
          organization_id: string
          preventive_actions: string | null
          reported_at: string | null
          reported_by: string | null
          resolved_at: string | null
          root_cause: string | null
          severity: Database["public"]["Enums"]["finding_severity"]
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          affected_data?: string | null
          affected_systems?: string[] | null
          corrective_actions?: string | null
          created_at?: string | null
          description: string
          discovered_at?: string | null
          id?: string
          immediate_actions?: string | null
          incident_number: string
          incident_type: string
          lessons_learned?: string | null
          occurred_at: string
          organization_id: string
          preventive_actions?: string | null
          reported_at?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity: Database["public"]["Enums"]["finding_severity"]
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          affected_data?: string | null
          affected_systems?: string[] | null
          corrective_actions?: string | null
          created_at?: string | null
          description?: string
          discovered_at?: string | null
          id?: string
          immediate_actions?: string | null
          incident_number?: string
          incident_type?: string
          lessons_learned?: string | null
          occurred_at?: string
          organization_id?: string
          preventive_actions?: string | null
          reported_at?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: Database["public"]["Enums"]["finding_severity"]
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_policies: {
        Row: {
          acknowledgment_frequency_days: number | null
          content: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          document_url: string | null
          effective_date: string | null
          id: string
          name: string
          organization_id: string
          owner_id: string | null
          policy_type: string
          requires_acknowledgment: boolean | null
          review_date: string | null
          slug: string
          status: Database["public"]["Enums"]["policy_status"] | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          acknowledgment_frequency_days?: number | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_url?: string | null
          effective_date?: string | null
          id?: string
          name: string
          organization_id: string
          owner_id?: string | null
          policy_type: string
          requires_acknowledgment?: boolean | null
          review_date?: string | null
          slug: string
          status?: Database["public"]["Enums"]["policy_status"] | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          acknowledgment_frequency_days?: number | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_url?: string | null
          effective_date?: string | null
          id?: string
          name?: string
          organization_id?: string
          owner_id?: string | null
          policy_type?: string
          requires_acknowledgment?: boolean | null
          review_date?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["policy_status"] | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_policies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_policies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          recipient_id: string
          requested_at: string | null
          requester_id: string
          responded_at: string | null
          status: Database["public"]["Enums"]["connection_status"] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          recipient_id: string
          requested_at?: string | null
          requester_id: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["connection_status"] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          recipient_id?: string
          requested_at?: string | null
          requester_id?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["connection_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "connections_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          email: string
          form_id: string | null
          id: string
          ip_address: unknown
          message: string
          metadata: Json | null
          name: string | null
          organization_id: string
          phone: string | null
          replied_at: string | null
          source_url: string | null
          status: string | null
          subject: string | null
          user_agent: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          email: string
          form_id?: string | null
          id?: string
          ip_address?: unknown
          message: string
          metadata?: Json | null
          name?: string | null
          organization_id: string
          phone?: string | null
          replied_at?: string | null
          source_url?: string | null
          status?: string | null
          subject?: string | null
          user_agent?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          email?: string
          form_id?: string | null
          id?: string
          ip_address?: unknown
          message?: string
          metadata?: Json | null
          name?: string | null
          organization_id?: string
          phone?: string | null
          replied_at?: string | null
          source_url?: string | null
          status?: string | null
          subject?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_submissions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_submissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          company_id: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          custom_fields: Json | null
          department: string | null
          email: string | null
          first_name: string
          full_name: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          job_title: string | null
          last_name: string
          linkedin_url: string | null
          mobile: string | null
          notes: string | null
          organization_id: string
          phone: string | null
          postal_code: string | null
          state: string | null
          tags: string[] | null
          twitter_handle: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          company_id?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          department?: string | null
          email?: string | null
          first_name: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          job_title?: string | null
          last_name: string
          linkedin_url?: string | null
          mobile?: string | null
          notes?: string | null
          organization_id: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tags?: string[] | null
          twitter_handle?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          company_id?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          department?: string | null
          email?: string | null
          first_name?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          job_title?: string | null
          last_name?: string
          linkedin_url?: string | null
          mobile?: string | null
          notes?: string | null
          organization_id?: string
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tags?: string[] | null
          twitter_handle?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      content_approvals: {
        Row: {
          assigned_to: string | null
          comments: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          organization_id: string
          requested_at: string | null
          requested_by: string
          responded_at: string | null
          revision_notes: string | null
          status: Database["public"]["Enums"]["approval_status"] | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          comments?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          organization_id: string
          requested_at?: string | null
          requested_by: string
          responded_at?: string | null
          revision_notes?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          comments?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          organization_id?: string
          requested_at?: string | null
          requested_by?: string
          responded_at?: string | null
          revision_notes?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_approvals_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_approvals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_approvals_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          address: string | null
          city: string | null
          company_name: string | null
          contact_name: string
          country: string | null
          created_at: string | null
          currency: string | null
          default_rate_amount: number | null
          default_rate_type: Database["public"]["Enums"]["rate_type"] | null
          email: string
          id: string
          is_active: boolean | null
          notes: string | null
          organization_id: string
          payment_terms: number | null
          phone: string | null
          postal_code: string | null
          state: string | null
          tax_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          contact_name: string
          country?: string | null
          created_at?: string | null
          currency?: string | null
          default_rate_amount?: number | null
          default_rate_type?: Database["public"]["Enums"]["rate_type"] | null
          email: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          organization_id: string
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          contact_name?: string
          country?: string | null
          created_at?: string | null
          currency?: string | null
          default_rate_amount?: number | null
          default_rate_type?: Database["public"]["Enums"]["rate_type"] | null
          email?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          organization_id?: string
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contractors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contractors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          auto_renewal_terms: string | null
          contract_number: string
          contract_type: Database["public"]["Enums"]["contract_type"]
          counterparty_id: string | null
          counterparty_name: string | null
          counterparty_type: Database["public"]["Enums"]["counterparty_type"]
          countersigned_date: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          document_url: string | null
          end_date: string | null
          event_id: string | null
          id: string
          notes: string | null
          organization_id: string
          project_id: string | null
          renewal_notice_days: number | null
          renewal_type: Database["public"]["Enums"]["renewal_type"] | null
          signed_by: string | null
          signed_date: string | null
          start_date: string
          status: Database["public"]["Enums"]["contract_status"] | null
          terminated_date: string | null
          termination_reason: string | null
          title: string
          updated_at: string | null
          value: number | null
        }
        Insert: {
          auto_renewal_terms?: string | null
          contract_number: string
          contract_type: Database["public"]["Enums"]["contract_type"]
          counterparty_id?: string | null
          counterparty_name?: string | null
          counterparty_type: Database["public"]["Enums"]["counterparty_type"]
          countersigned_date?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          document_url?: string | null
          end_date?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          project_id?: string | null
          renewal_notice_days?: number | null
          renewal_type?: Database["public"]["Enums"]["renewal_type"] | null
          signed_by?: string | null
          signed_date?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"] | null
          terminated_date?: string | null
          termination_reason?: string | null
          title: string
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          auto_renewal_terms?: string | null
          contract_number?: string
          contract_type?: Database["public"]["Enums"]["contract_type"]
          counterparty_id?: string | null
          counterparty_name?: string | null
          counterparty_type?: Database["public"]["Enums"]["counterparty_type"]
          countersigned_date?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          document_url?: string | null
          end_date?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          project_id?: string | null
          renewal_notice_days?: number | null
          renewal_type?: Database["public"]["Enums"]["renewal_type"] | null
          signed_by?: string | null
          signed_date?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"] | null
          terminated_date?: string | null
          termination_reason?: string | null
          title?: string
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_assignments: {
        Row: {
          checked_in_at: string | null
          checked_out_at: string | null
          confirmed_at: string | null
          created_at: string | null
          created_by: string | null
          crew_call_id: string
          crew_call_position_id: string
          currency: string | null
          id: string
          invited_at: string | null
          notes: string | null
          organization_id: string
          rate_amount: number | null
          rate_type: Database["public"]["Enums"]["rate_type"] | null
          responded_at: string | null
          status: Database["public"]["Enums"]["assignment_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          checked_in_at?: string | null
          checked_out_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          crew_call_id: string
          crew_call_position_id: string
          currency?: string | null
          id?: string
          invited_at?: string | null
          notes?: string | null
          organization_id: string
          rate_amount?: number | null
          rate_type?: Database["public"]["Enums"]["rate_type"] | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          checked_in_at?: string | null
          checked_out_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          crew_call_id?: string
          crew_call_position_id?: string
          currency?: string | null
          id?: string
          invited_at?: string | null
          notes?: string | null
          organization_id?: string
          rate_amount?: number | null
          rate_type?: Database["public"]["Enums"]["rate_type"] | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_assignments_crew_call_id_fkey"
            columns: ["crew_call_id"]
            isOneToOne: false
            referencedRelation: "crew_calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_assignments_crew_call_position_id_fkey"
            columns: ["crew_call_position_id"]
            isOneToOne: false
            referencedRelation: "crew_call_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_call_positions: {
        Row: {
          call_time: string | null
          created_at: string | null
          crew_call_id: string
          currency: string | null
          department_id: string | null
          description: string | null
          end_time: string | null
          id: string
          notes: string | null
          position_id: string | null
          quantity_filled: number | null
          quantity_needed: number | null
          rate_amount: number | null
          rate_type: Database["public"]["Enums"]["rate_type"] | null
          required_certifications: string[] | null
          required_skills: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          call_time?: string | null
          created_at?: string | null
          crew_call_id: string
          currency?: string | null
          department_id?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          position_id?: string | null
          quantity_filled?: number | null
          quantity_needed?: number | null
          rate_amount?: number | null
          rate_type?: Database["public"]["Enums"]["rate_type"] | null
          required_certifications?: string[] | null
          required_skills?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          call_time?: string | null
          created_at?: string | null
          crew_call_id?: string
          currency?: string | null
          department_id?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          position_id?: string | null
          quantity_filled?: number | null
          quantity_needed?: number | null
          rate_amount?: number | null
          rate_type?: Database["public"]["Enums"]["rate_type"] | null
          required_certifications?: string[] | null
          required_skills?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_call_positions_crew_call_id_fkey"
            columns: ["crew_call_id"]
            isOneToOne: false
            referencedRelation: "crew_calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_call_positions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_call_positions_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_calls: {
        Row: {
          call_time: string
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          end_time: string | null
          event_day_id: string | null
          event_id: string | null
          filled_positions: number | null
          id: string
          location_id: string | null
          location_notes: string | null
          name: string
          notes: string | null
          organization_id: string
          project_id: string | null
          published_at: string | null
          published_by: string | null
          status: Database["public"]["Enums"]["crew_call_status"] | null
          total_positions: number | null
          updated_at: string | null
        }
        Insert: {
          call_time: string
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          end_time?: string | null
          event_day_id?: string | null
          event_id?: string | null
          filled_positions?: number | null
          id?: string
          location_id?: string | null
          location_notes?: string | null
          name: string
          notes?: string | null
          organization_id: string
          project_id?: string | null
          published_at?: string | null
          published_by?: string | null
          status?: Database["public"]["Enums"]["crew_call_status"] | null
          total_positions?: number | null
          updated_at?: string | null
        }
        Update: {
          call_time?: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          end_time?: string | null
          event_day_id?: string | null
          event_id?: string | null
          filled_positions?: number | null
          id?: string
          location_id?: string | null
          location_notes?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          project_id?: string | null
          published_at?: string | null
          published_by?: string | null
          status?: Database["public"]["Enums"]["crew_call_status"] | null
          total_positions?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_calls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_calls_event_day_id_fkey"
            columns: ["event_day_id"]
            isOneToOne: false
            referencedRelation: "event_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_calls_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_calls_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_calls_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_calls_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_calls_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cue_sheets: {
        Row: {
          created_at: string | null
          created_by: string | null
          department: Database["public"]["Enums"]["cue_department"]
          description: string | null
          event_id: string
          id: string
          name: string
          organization_id: string
          runsheet_id: string | null
          stage_id: string | null
          status: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          department: Database["public"]["Enums"]["cue_department"]
          description?: string | null
          event_id: string
          id?: string
          name: string
          organization_id: string
          runsheet_id?: string | null
          stage_id?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          department?: Database["public"]["Enums"]["cue_department"]
          description?: string | null
          event_id?: string
          id?: string
          name?: string
          organization_id?: string
          runsheet_id?: string | null
          stage_id?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cue_sheets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cue_sheets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cue_sheets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cue_sheets_runsheet_id_fkey"
            columns: ["runsheet_id"]
            isOneToOne: false
            referencedRelation: "runsheets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cue_sheets_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      cues: {
        Row: {
          action: string | null
          created_at: string | null
          cue_number: string
          cue_sheet_id: string
          cue_type: Database["public"]["Enums"]["cue_type"] | null
          description: string
          duration_seconds: number | null
          executed_at: string | null
          executed_by: string | null
          id: string
          is_executed: boolean | null
          notes: string | null
          position: number
          runsheet_item_id: string | null
          trigger_midi: Json | null
          trigger_osc: Json | null
          trigger_time: string | null
          trigger_timecode: string | null
          trigger_type: Database["public"]["Enums"]["trigger_type"] | null
          updated_at: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          cue_number: string
          cue_sheet_id: string
          cue_type?: Database["public"]["Enums"]["cue_type"] | null
          description: string
          duration_seconds?: number | null
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          is_executed?: boolean | null
          notes?: string | null
          position: number
          runsheet_item_id?: string | null
          trigger_midi?: Json | null
          trigger_osc?: Json | null
          trigger_time?: string | null
          trigger_timecode?: string | null
          trigger_type?: Database["public"]["Enums"]["trigger_type"] | null
          updated_at?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          cue_number?: string
          cue_sheet_id?: string
          cue_type?: Database["public"]["Enums"]["cue_type"] | null
          description?: string
          duration_seconds?: number | null
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          is_executed?: boolean | null
          notes?: string | null
          position?: number
          runsheet_item_id?: string | null
          trigger_midi?: Json | null
          trigger_osc?: Json | null
          trigger_time?: string | null
          trigger_timecode?: string | null
          trigger_type?: Database["public"]["Enums"]["trigger_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cues_cue_sheet_id_fkey"
            columns: ["cue_sheet_id"]
            isOneToOne: false
            referencedRelation: "cue_sheets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cues_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cues_runsheet_item_id_fkey"
            columns: ["runsheet_item_id"]
            isOneToOne: false
            referencedRelation: "runsheet_items"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_domains: {
        Row: {
          created_at: string | null
          dns_records: Json | null
          domain: string
          id: string
          is_primary: boolean | null
          is_verified: boolean | null
          organization_id: string
          ssl_expires_at: string | null
          ssl_status: string | null
          subdomain: string | null
          updated_at: string | null
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          dns_records?: Json | null
          domain: string
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          organization_id: string
          ssl_expires_at?: string | null
          ssl_status?: string | null
          subdomain?: string | null
          updated_at?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          dns_records?: Json | null
          domain?: string
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          organization_id?: string
          ssl_expires_at?: string | null
          ssl_status?: string | null
          subdomain?: string | null
          updated_at?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_domains_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_definitions: {
        Row: {
          created_at: string | null
          default_value: Json | null
          description: string | null
          entity_type: string
          field_type: string
          id: string
          is_active: boolean | null
          is_filterable: boolean | null
          is_required: boolean | null
          is_searchable: boolean | null
          name: string
          options: Json | null
          organization_id: string
          position: number | null
          slug: string
          updated_at: string | null
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string | null
          default_value?: Json | null
          description?: string | null
          entity_type: string
          field_type: string
          id?: string
          is_active?: boolean | null
          is_filterable?: boolean | null
          is_required?: boolean | null
          is_searchable?: boolean | null
          name: string
          options?: Json | null
          organization_id: string
          position?: number | null
          slug: string
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string | null
          default_value?: Json | null
          description?: string | null
          entity_type?: string
          field_type?: string
          id?: string
          is_active?: boolean | null
          is_filterable?: boolean | null
          is_required?: boolean | null
          is_searchable?: boolean | null
          name?: string
          options?: Json | null
          organization_id?: string
          position?: number | null
          slug?: string
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_definitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_values: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          field_definition_id: string
          id: string
          organization_id: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          field_definition_id: string
          id?: string
          organization_id: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          field_definition_id?: string
          id?: string
          organization_id?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_field_definition_id_fkey"
            columns: ["field_definition_id"]
            isOneToOne: false
            referencedRelation: "custom_field_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_field_values_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_widget_instances: {
        Row: {
          config_overrides: Json | null
          created_at: string | null
          dashboard_id: string
          height: number | null
          id: string
          position_x: number | null
          position_y: number | null
          updated_at: string | null
          widget_id: string
          width: number | null
        }
        Insert: {
          config_overrides?: Json | null
          created_at?: string | null
          dashboard_id: string
          height?: number | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          updated_at?: string | null
          widget_id: string
          width?: number | null
        }
        Update: {
          config_overrides?: Json | null
          created_at?: string | null
          dashboard_id?: string
          height?: number | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          updated_at?: string | null
          widget_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widget_instances_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "user_dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_widget_instances_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "dashboard_widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_widgets: {
        Row: {
          config: Json
          created_at: string | null
          created_by: string | null
          data_source: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          organization_id: string
          refresh_interval_seconds: number | null
          slug: string
          updated_at: string | null
          widget_type: string
        }
        Insert: {
          config: Json
          created_at?: string | null
          created_by?: string | null
          data_source?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          organization_id: string
          refresh_interval_seconds?: number | null
          slug: string
          updated_at?: string | null
          widget_type: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          data_source?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          organization_id?: string
          refresh_interval_seconds?: number | null
          slug?: string
          updated_at?: string | null
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widgets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_widgets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_products: {
        Row: {
          created_at: string | null
          deal_id: string
          description: string | null
          discount_percent: number | null
          id: string
          name: string
          quantity: number | null
          total: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deal_id: string
          description?: string | null
          discount_percent?: number | null
          id?: string
          name: string
          quantity?: number | null
          total: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deal_id?: string
          description?: string | null
          discount_percent?: number | null
          id?: string
          name?: string
          quantity?: number | null
          total?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_products_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_team_members: {
        Row: {
          created_at: string | null
          deal_id: string
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deal_id: string
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deal_id?: string
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_team_members_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          actual_close_date: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          custom_fields: Json | null
          deal_type: Database["public"]["Enums"]["deal_type"] | null
          description: string | null
          event_id: string | null
          expected_close_date: string | null
          id: string
          lost_at: string | null
          lost_reason: string | null
          name: string
          notes: string | null
          organization_id: string
          owner_id: string | null
          probability: number | null
          project_id: string | null
          source: string | null
          stage: string
          tags: string[] | null
          updated_at: string | null
          value: number | null
          won_at: string | null
        }
        Insert: {
          actual_close_date?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deal_type?: Database["public"]["Enums"]["deal_type"] | null
          description?: string | null
          event_id?: string | null
          expected_close_date?: string | null
          id?: string
          lost_at?: string | null
          lost_reason?: string | null
          name: string
          notes?: string | null
          organization_id: string
          owner_id?: string | null
          probability?: number | null
          project_id?: string | null
          source?: string | null
          stage: string
          tags?: string[] | null
          updated_at?: string | null
          value?: number | null
          won_at?: string | null
        }
        Update: {
          actual_close_date?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deal_type?: Database["public"]["Enums"]["deal_type"] | null
          description?: string | null
          event_id?: string | null
          expected_close_date?: string | null
          id?: string
          lost_at?: string | null
          lost_reason?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          owner_id?: string | null
          probability?: number | null
          project_id?: string | null
          source?: string | null
          stage?: string
          tags?: string[] | null
          updated_at?: string | null
          value?: number | null
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          color: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          icon: string | null
          id: string
          manager_id: string | null
          name: string
          organization_id: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          manager_id?: string | null
          name: string
          organization_id: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          organization_id?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          status: Database["public"]["Enums"]["message_status"] | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          status?: Database["public"]["Enums"]["message_status"] | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          position: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          position?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          position?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_replies: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          discussion_id: string
          id: string
          is_solution: boolean | null
          likes_count: number | null
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          discussion_id: string
          id?: string
          is_solution?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          discussion_id?: string
          id?: string
          is_solution?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_replies_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "discussion_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_subscriptions: {
        Row: {
          created_at: string | null
          discussion_id: string
          id: string
          notify_on_reply: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          discussion_id: string
          id?: string
          notify_on_reply?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          discussion_id?: string
          id?: string
          notify_on_reply?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_subscriptions_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          author_id: string
          category_id: string | null
          content: string
          created_at: string | null
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          last_reply_at: string | null
          last_reply_by: string | null
          organization_id: string
          replies_count: number | null
          status: Database["public"]["Enums"]["discussion_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id: string
          category_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          last_reply_by?: string | null
          organization_id: string
          replies_count?: number | null
          status?: Database["public"]["Enums"]["discussion_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string
          category_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          last_reply_by?: string | null
          organization_id?: string
          replies_count?: number | null
          status?: Database["public"]["Enums"]["discussion_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "discussions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "discussion_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_last_reply_by_fkey"
            columns: ["last_reply_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_comments: {
        Row: {
          content: string
          created_at: string | null
          document_id: string
          id: string
          is_resolved: boolean | null
          parent_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          selection_end: number | null
          selection_start: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          document_id: string
          id?: string
          is_resolved?: boolean | null
          parent_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          selection_end?: number | null
          selection_start?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          document_id?: string
          id?: string
          is_resolved?: boolean | null
          parent_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          selection_end?: number | null
          selection_start?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "document_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_comments_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_folders: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_system: boolean | null
          name: string
          organization_id: string
          parent_id: string | null
          path: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          organization_id: string
          parent_id?: string | null
          path?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          organization_id?: string
          parent_id?: string | null
          path?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_folders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_folders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      document_shares: {
        Row: {
          created_at: string | null
          created_by: string | null
          document_id: string
          expires_at: string | null
          id: string
          permission: string | null
          share_token: string | null
          shared_with_email: string | null
          shared_with_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          document_id: string
          expires_at?: string | null
          id?: string
          permission?: string | null
          share_token?: string | null
          shared_with_email?: string | null
          shared_with_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          document_id?: string
          expires_at?: string | null
          id?: string
          permission?: string | null
          share_token?: string | null
          shared_with_email?: string | null
          shared_with_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_shares_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_shares_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_shares_shared_with_user_id_fkey"
            columns: ["shared_with_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          change_summary: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          document_id: string
          id: string
          title: string
          version: number
        }
        Insert: {
          change_summary?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id: string
          id?: string
          title: string
          version: number
        }
        Update: {
          change_summary?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string
          id?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          archived_at: string | null
          content: string | null
          content_format: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          document_type: Database["public"]["Enums"]["document_type"] | null
          event_id: string | null
          folder_id: string | null
          id: string
          is_template: boolean | null
          last_edited_by: string | null
          metadata: Json | null
          organization_id: string
          project_id: string | null
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          status: Database["public"]["Enums"]["document_status"] | null
          summary: string | null
          tags: string[] | null
          template_id: string | null
          title: string
          updated_at: string | null
          version: number | null
          visibility: Database["public"]["Enums"]["visibility_type"] | null
          word_count: number | null
        }
        Insert: {
          archived_at?: string | null
          content?: string | null
          content_format?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          event_id?: string | null
          folder_id?: string | null
          id?: string
          is_template?: boolean | null
          last_edited_by?: string | null
          metadata?: Json | null
          organization_id: string
          project_id?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          status?: Database["public"]["Enums"]["document_status"] | null
          summary?: string | null
          tags?: string[] | null
          template_id?: string | null
          title: string
          updated_at?: string | null
          version?: number | null
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
          word_count?: number | null
        }
        Update: {
          archived_at?: string | null
          content?: string | null
          content_format?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          event_id?: string | null
          folder_id?: string | null
          id?: string
          is_template?: boolean | null
          last_edited_by?: string | null
          metadata?: Json | null
          organization_id?: string
          project_id?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["document_status"] | null
          summary?: string | null
          tags?: string[] | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
          version?: number | null
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_last_edited_by_fkey"
            columns: ["last_edited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sends: {
        Row: {
          body_html: string | null
          body_text: string | null
          bounce_reason: string | null
          bounced_at: string | null
          clicked_at: string | null
          created_at: string | null
          external_id: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          organization_id: string
          recipient_email: string
          recipient_name: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["email_status"] | null
          subject: string
          template_id: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          bounce_reason?: string | null
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          organization_id: string
          recipient_email: string
          recipient_name?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_status"] | null
          subject: string
          template_id?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          bounce_reason?: string | null
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          organization_id?: string
          recipient_email?: string
          recipient_name?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_status"] | null
          subject?: string
          template_id?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sends_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sends_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_html: string | null
          body_text: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          from_email: string | null
          from_name: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          organization_id: string
          reply_to: string | null
          slug: string
          subject: string
          template_type: Database["public"]["Enums"]["email_template_type"]
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          organization_id: string
          reply_to?: string | null
          slug: string
          subject: string
          template_type: Database["public"]["Enums"]["email_template_type"]
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          organization_id?: string
          reply_to?: string | null
          slug?: string
          subject?: string
          template_type?: Database["public"]["Enums"]["email_template_type"]
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_tags: {
        Row: {
          created_at: string | null
          created_by: string | null
          entity_id: string
          entity_type: string
          id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          entity_id: string
          entity_type: string
          id?: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      event_budgets: {
        Row: {
          budget_id: string
          created_at: string | null
          event_id: string
          id: string
        }
        Insert: {
          budget_id: string
          created_at?: string | null
          event_id: string
          id?: string
        }
        Update: {
          budget_id?: string
          created_at?: string | null
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_budgets_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_budgets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_days: {
        Row: {
          capacity: number | null
          created_at: string | null
          date: string
          description: string | null
          doors_time: string | null
          end_time: string | null
          event_id: string
          id: string
          name: string | null
          settings: Json | null
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          date: string
          description?: string | null
          doors_time?: string | null
          end_time?: string | null
          event_id: string
          id?: string
          name?: string | null
          settings?: Json | null
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          date?: string
          description?: string | null
          doors_time?: string | null
          end_time?: string | null
          event_id?: string
          id?: string
          name?: string | null
          settings?: Json | null
          start_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_days_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_partners: {
        Row: {
          company_id: string
          contract_id: string | null
          created_at: string | null
          event_id: string
          id: string
          notes: string | null
          partner_type: string | null
          responsibilities: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          contract_id?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          notes?: string | null
          partner_type?: string | null
          responsibilities?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          contract_id?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          partner_type?: string | null
          responsibilities?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_partners_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_partners_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_partners_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sponsors: {
        Row: {
          benefits: Json | null
          commitment_amount: number | null
          company_id: string
          contract_id: string | null
          created_at: string | null
          currency: string | null
          event_id: string
          id: string
          notes: string | null
          sponsor_level: string | null
          updated_at: string | null
        }
        Insert: {
          benefits?: Json | null
          commitment_amount?: number | null
          company_id: string
          contract_id?: string | null
          created_at?: string | null
          currency?: string | null
          event_id: string
          id?: string
          notes?: string | null
          sponsor_level?: string | null
          updated_at?: string | null
        }
        Update: {
          benefits?: Json | null
          commitment_amount?: number | null
          company_id?: string
          contract_id?: string | null
          created_at?: string | null
          currency?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          sponsor_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_sponsors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_sponsors_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_sponsors_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_venues: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          is_primary: boolean | null
          notes: string | null
          venue_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          venue_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_venues_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_venues_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          actual_attendance: number | null
          capacity: number | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          doors_time: string | null
          end_date: string
          end_time: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          expected_attendance: number | null
          id: string
          is_recurring: boolean | null
          metadata: Json | null
          name: string
          organization_id: string
          parent_event_id: string | null
          phase: Database["public"]["Enums"]["event_phase"] | null
          project_id: string | null
          recurrence_rule: string | null
          settings: Json | null
          slug: string
          start_date: string
          start_time: string | null
          timezone: string | null
          updated_at: string | null
          venue_id: string | null
          visibility: Database["public"]["Enums"]["visibility_type"] | null
        }
        Insert: {
          actual_attendance?: number | null
          capacity?: number | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          doors_time?: string | null
          end_date: string
          end_time?: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          expected_attendance?: number | null
          id?: string
          is_recurring?: boolean | null
          metadata?: Json | null
          name: string
          organization_id: string
          parent_event_id?: string | null
          phase?: Database["public"]["Enums"]["event_phase"] | null
          project_id?: string | null
          recurrence_rule?: string | null
          settings?: Json | null
          slug: string
          start_date: string
          start_time?: string | null
          timezone?: string | null
          updated_at?: string | null
          venue_id?: string | null
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
        }
        Update: {
          actual_attendance?: number | null
          capacity?: number | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          doors_time?: string | null
          end_date?: string
          end_time?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          expected_attendance?: number | null
          id?: string
          is_recurring?: boolean | null
          metadata?: Json | null
          name?: string
          organization_id?: string
          parent_event_id?: string | null
          phase?: Database["public"]["Enums"]["event_phase"] | null
          project_id?: string | null
          recurrence_rule?: string | null
          settings?: Json | null
          slug?: string
          start_date?: string
          start_time?: string | null
          timezone?: string | null
          updated_at?: string | null
          venue_id?: string | null
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          category_id: string | null
          created_at: string | null
          currency: string | null
          description: string
          event_id: string | null
          expense_date: string
          expense_number: string
          id: string
          is_billable: boolean | null
          is_reimbursable: boolean | null
          notes: string | null
          organization_id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          project_id: string | null
          receipt_url: string | null
          reimbursed_at: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["expense_status"] | null
          submitted_at: string | null
          tax_amount: number | null
          updated_at: string | null
          user_id: string
          vendor_name: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          description: string
          event_id?: string | null
          expense_date: string
          expense_number: string
          id?: string
          is_billable?: boolean | null
          is_reimbursable?: boolean | null
          notes?: string | null
          organization_id: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          project_id?: string | null
          receipt_url?: string | null
          reimbursed_at?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["expense_status"] | null
          submitted_at?: string | null
          tax_amount?: number | null
          updated_at?: string | null
          user_id: string
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string
          event_id?: string | null
          expense_date?: string
          expense_number?: string
          id?: string
          is_billable?: boolean | null
          is_reimbursable?: boolean | null
          notes?: string | null
          organization_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          project_id?: string | null
          receipt_url?: string | null
          reimbursed_at?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["expense_status"] | null
          submitted_at?: string | null
          tax_amount?: number | null
          updated_at?: string | null
          user_id?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      export_jobs: {
        Row: {
          columns: Json | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          entity_type: string
          error_message: string | null
          expires_at: string | null
          file_size: number | null
          file_url: string | null
          filters: Json | null
          format: Database["public"]["Enums"]["report_format"]
          id: string
          organization_id: string
          row_count: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["import_status"] | null
        }
        Insert: {
          columns?: Json | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          entity_type: string
          error_message?: string | null
          expires_at?: string | null
          file_size?: number | null
          file_url?: string | null
          filters?: Json | null
          format: Database["public"]["Enums"]["report_format"]
          id?: string
          organization_id: string
          row_count?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["import_status"] | null
        }
        Update: {
          columns?: Json | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          entity_type?: string
          error_message?: string | null
          expires_at?: string | null
          file_size?: number | null
          file_url?: string | null
          filters?: Json | null
          format?: Database["public"]["Enums"]["report_format"]
          id?: string
          organization_id?: string
          row_count?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["import_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "export_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "export_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_items: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_published: boolean | null
          not_helpful_count: number | null
          organization_id: string
          position: number | null
          question: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          not_helpful_count?: number | null
          organization_id: string
          position?: number | null
          question: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          not_helpful_count?: number | null
          organization_id?: string
          position?: number | null
          question?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          allowed_organizations: string[] | null
          allowed_tiers:
            | Database["public"]["Enums"]["subscription_tier"][]
            | null
          allowed_users: string[] | null
          config: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_enabled: boolean | null
          name: string
          rollout_percentage: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          allowed_organizations?: string[] | null
          allowed_tiers?:
            | Database["public"]["Enums"]["subscription_tier"][]
            | null
          allowed_users?: string[] | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name: string
          rollout_percentage?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          allowed_organizations?: string[] | null
          allowed_tiers?:
            | Database["public"]["Enums"]["subscription_tier"][]
            | null
          allowed_users?: string[] | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name?: string
          rollout_percentage?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      forecast_items: {
        Row: {
          actual_value: number | null
          category_id: string | null
          created_at: string | null
          forecast_period_id: string
          id: string
          name: string
          notes: string | null
          planned_value: number
          probability: number | null
          updated_at: string | null
        }
        Insert: {
          actual_value?: number | null
          category_id?: string | null
          created_at?: string | null
          forecast_period_id: string
          id?: string
          name: string
          notes?: string | null
          planned_value: number
          probability?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_value?: number | null
          category_id?: string | null
          created_at?: string | null
          forecast_period_id?: string
          id?: string
          name?: string
          notes?: string | null
          planned_value?: number
          probability?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forecast_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forecast_items_forecast_period_id_fkey"
            columns: ["forecast_period_id"]
            isOneToOne: false
            referencedRelation: "forecast_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      forecast_periods: {
        Row: {
          actual_value: number | null
          created_at: string | null
          forecast_id: string
          id: string
          notes: string | null
          period_end: string
          period_start: string
          planned_value: number | null
          updated_at: string | null
          variance: number | null
        }
        Insert: {
          actual_value?: number | null
          created_at?: string | null
          forecast_id: string
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          planned_value?: number | null
          updated_at?: string | null
          variance?: number | null
        }
        Update: {
          actual_value?: number | null
          created_at?: string | null
          forecast_id?: string
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          planned_value?: number | null
          updated_at?: string | null
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forecast_periods_forecast_id_fkey"
            columns: ["forecast_id"]
            isOneToOne: false
            referencedRelation: "forecasts"
            referencedColumns: ["id"]
          },
        ]
      }
      forecast_scenarios: {
        Row: {
          adjustments: Json | null
          assumptions: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          forecast_id: string
          id: string
          is_default: boolean | null
          name: string
          scenario_type: Database["public"]["Enums"]["scenario_type"]
          updated_at: string | null
        }
        Insert: {
          adjustments?: Json | null
          assumptions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          forecast_id: string
          id?: string
          is_default?: boolean | null
          name: string
          scenario_type: Database["public"]["Enums"]["scenario_type"]
          updated_at?: string | null
        }
        Update: {
          adjustments?: Json | null
          assumptions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          forecast_id?: string
          id?: string
          is_default?: boolean | null
          name?: string
          scenario_type?: Database["public"]["Enums"]["scenario_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forecast_scenarios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forecast_scenarios_forecast_id_fkey"
            columns: ["forecast_id"]
            isOneToOne: false
            referencedRelation: "forecasts"
            referencedColumns: ["id"]
          },
        ]
      }
      forecasts: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          forecast_type: Database["public"]["Enums"]["forecast_type"]
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          period_type: Database["public"]["Enums"]["forecast_period"]
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          forecast_type: Database["public"]["Enums"]["forecast_type"]
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          period_type: Database["public"]["Enums"]["forecast_period"]
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          forecast_type?: Database["public"]["Enums"]["forecast_type"]
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          period_type?: Database["public"]["Enums"]["forecast_period"]
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forecasts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forecasts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      form_fields: {
        Row: {
          conditional_logic: Json | null
          created_at: string | null
          default_value: string | null
          field_type: Database["public"]["Enums"]["form_field_type"]
          form_id: string
          help_text: string | null
          id: string
          is_hidden: boolean | null
          is_required: boolean | null
          label: string
          name: string
          options: Json | null
          placeholder: string | null
          position: number | null
          updated_at: string | null
          validation_rules: Json | null
        }
        Insert: {
          conditional_logic?: Json | null
          created_at?: string | null
          default_value?: string | null
          field_type: Database["public"]["Enums"]["form_field_type"]
          form_id: string
          help_text?: string | null
          id?: string
          is_hidden?: boolean | null
          is_required?: boolean | null
          label: string
          name: string
          options?: Json | null
          placeholder?: string | null
          position?: number | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Update: {
          conditional_logic?: Json | null
          created_at?: string | null
          default_value?: string | null
          field_type?: Database["public"]["Enums"]["form_field_type"]
          form_id?: string
          help_text?: string | null
          id?: string
          is_hidden?: boolean | null
          is_required?: boolean | null
          label?: string
          name?: string
          options?: Json | null
          placeholder?: string | null
          position?: number | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          created_at: string | null
          data: Json
          form_id: string
          id: string
          ip_address: unknown
          is_complete: boolean | null
          source_url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data: Json
          form_id: string
          id?: string
          ip_address?: unknown
          is_complete?: boolean | null
          source_url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          form_id?: string
          id?: string
          ip_address?: unknown
          is_complete?: boolean | null
          source_url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          closes_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          max_submissions: number | null
          name: string
          notification_emails: string[] | null
          opens_at: string | null
          organization_id: string
          redirect_url: string | null
          requires_auth: boolean | null
          settings: Json | null
          slug: string
          status: Database["public"]["Enums"]["form_status"] | null
          submissions_count: number | null
          submit_button_text: string | null
          success_message: string | null
          updated_at: string | null
        }
        Insert: {
          closes_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          max_submissions?: number | null
          name: string
          notification_emails?: string[] | null
          opens_at?: string | null
          organization_id: string
          redirect_url?: string | null
          requires_auth?: boolean | null
          settings?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["form_status"] | null
          submissions_count?: number | null
          submit_button_text?: string | null
          success_message?: string | null
          updated_at?: string | null
        }
        Update: {
          closes_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          max_submissions?: number | null
          name?: string
          notification_emails?: string[] | null
          opens_at?: string | null
          organization_id?: string
          redirect_url?: string | null
          requires_auth?: boolean | null
          settings?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["form_status"] | null
          submissions_count?: number | null
          submit_button_text?: string | null
          success_message?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_list_entries: {
        Row: {
          access_areas: string[] | null
          added_by: string | null
          checked_in_at: string | null
          checked_in_by: string | null
          company: string | null
          confirmed_at: string | null
          created_at: string | null
          email: string | null
          guest_list_id: string
          id: string
          internal_notes: string | null
          name: string
          notes: string | null
          phone: string | null
          plus_ones: number | null
          plus_ones_checked_in: number | null
          status: Database["public"]["Enums"]["guest_entry_status"] | null
          ticket_tier: Database["public"]["Enums"]["ticket_tier"] | null
          updated_at: string | null
        }
        Insert: {
          access_areas?: string[] | null
          added_by?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          company?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email?: string | null
          guest_list_id: string
          id?: string
          internal_notes?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          plus_ones?: number | null
          plus_ones_checked_in?: number | null
          status?: Database["public"]["Enums"]["guest_entry_status"] | null
          ticket_tier?: Database["public"]["Enums"]["ticket_tier"] | null
          updated_at?: string | null
        }
        Update: {
          access_areas?: string[] | null
          added_by?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          company?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email?: string | null
          guest_list_id?: string
          id?: string
          internal_notes?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          plus_ones?: number | null
          plus_ones_checked_in?: number | null
          status?: Database["public"]["Enums"]["guest_entry_status"] | null
          ticket_tier?: Database["public"]["Enums"]["ticket_tier"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_list_entries_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_list_entries_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_list_entries_guest_list_id_fkey"
            columns: ["guest_list_id"]
            isOneToOne: false
            referencedRelation: "guest_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_lists: {
        Row: {
          capacity: number | null
          checked_in_count: number | null
          created_at: string | null
          created_by: string | null
          entries_count: number | null
          event_day_id: string | null
          event_id: string
          id: string
          list_type: Database["public"]["Enums"]["guest_list_type"]
          name: string
          notes: string | null
          organization_id: string
          owner_id: string | null
          status: Database["public"]["Enums"]["guest_list_status"] | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          checked_in_count?: number | null
          created_at?: string | null
          created_by?: string | null
          entries_count?: number | null
          event_day_id?: string | null
          event_id: string
          id?: string
          list_type: Database["public"]["Enums"]["guest_list_type"]
          name: string
          notes?: string | null
          organization_id: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["guest_list_status"] | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          checked_in_count?: number | null
          created_at?: string | null
          created_by?: string | null
          entries_count?: number | null
          event_day_id?: string | null
          event_id?: string
          id?: string
          list_type?: Database["public"]["Enums"]["guest_list_type"]
          name?: string
          notes?: string | null
          organization_id?: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["guest_list_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_lists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_lists_event_day_id_fkey"
            columns: ["event_day_id"]
            isOneToOne: false
            referencedRelation: "event_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_lists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_lists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_lists_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitality_requests: {
        Row: {
          assigned_to: string | null
          booking_id: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          event_id: string
          id: string
          notes: string | null
          organization_id: string
          priority: Database["public"]["Enums"]["priority_level"] | null
          request_type: Database["public"]["Enums"]["hospitality_request_type"]
          requested_by: string | null
          status: Database["public"]["Enums"]["hospitality_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          event_id: string
          id?: string
          notes?: string | null
          organization_id: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          request_type: Database["public"]["Enums"]["hospitality_request_type"]
          requested_by?: string | null
          status?: Database["public"]["Enums"]["hospitality_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          organization_id?: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          request_type?: Database["public"]["Enums"]["hospitality_request_type"]
          requested_by?: string | null
          status?: Database["public"]["Enums"]["hospitality_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hospitality_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospitality_requests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "talent_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospitality_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospitality_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospitality_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      import_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          entity_type: string
          error_count: number | null
          errors: Json | null
          file_name: string
          file_size: number | null
          file_url: string | null
          id: string
          mapping: Json | null
          options: Json | null
          organization_id: string
          processed_rows: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["import_status"] | null
          success_count: number | null
          total_rows: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          entity_type: string
          error_count?: number | null
          errors?: Json | null
          file_name: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          mapping?: Json | null
          options?: Json | null
          organization_id: string
          processed_rows?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["import_status"] | null
          success_count?: number | null
          total_rows?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          entity_type?: string
          error_count?: number | null
          errors?: Json | null
          file_name?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          mapping?: Json | null
          options?: Json | null
          organization_id?: string
          processed_rows?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["import_status"] | null
          success_count?: number | null
          total_rows?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "import_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_reports: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          created_at: string | null
          description: string
          event_id: string | null
          id: string
          incident_number: string
          incident_type: string
          location: string | null
          metadata: Json | null
          occurred_at: string
          organization_id: string
          project_id: string | null
          reported_by: string | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["priority_level"]
          status: string | null
          title: string
          updated_at: string | null
          witnesses: string[] | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          created_at?: string | null
          description: string
          event_id?: string | null
          id?: string
          incident_number: string
          incident_type: string
          location?: string | null
          metadata?: Json | null
          occurred_at: string
          organization_id: string
          project_id?: string | null
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: Database["public"]["Enums"]["priority_level"]
          status?: string | null
          title: string
          updated_at?: string | null
          witnesses?: string[] | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          created_at?: string | null
          description?: string
          event_id?: string | null
          id?: string
          incident_number?: string
          incident_type?: string
          location?: string | null
          metadata?: Json | null
          occurred_at?: string
          organization_id?: string
          project_id?: string | null
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["priority_level"]
          status?: string | null
          title?: string
          updated_at?: string | null
          witnesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_reports_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      insight_reports: {
        Row: {
          category: string | null
          confidence_score: number | null
          created_at: string | null
          data_points: Json | null
          details: Json | null
          dismissed_at: string | null
          dismissed_by: string | null
          entity_id: string | null
          entity_type: string | null
          expires_at: string | null
          generated_at: string | null
          id: string
          impact_score: number | null
          insight_type: Database["public"]["Enums"]["insight_type"]
          is_actionable: boolean | null
          is_dismissed: boolean | null
          organization_id: string
          summary: string | null
          title: string
        }
        Insert: {
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          data_points?: Json | null
          details?: Json | null
          dismissed_at?: string | null
          dismissed_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          impact_score?: number | null
          insight_type: Database["public"]["Enums"]["insight_type"]
          is_actionable?: boolean | null
          is_dismissed?: boolean | null
          organization_id: string
          summary?: string | null
          title: string
        }
        Update: {
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          data_points?: Json | null
          details?: Json | null
          dismissed_at?: string | null
          dismissed_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          impact_score?: number | null
          insight_type?: Database["public"]["Enums"]["insight_type"]
          is_actionable?: boolean | null
          is_dismissed?: boolean | null
          organization_id?: string
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "insight_reports_dismissed_by_fkey"
            columns: ["dismissed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insight_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_connections: {
        Row: {
          config: Json | null
          created_at: string | null
          created_by: string | null
          credentials_encrypted: string | null
          error_count: number | null
          id: string
          integration_type: string
          last_error: string | null
          last_sync_at: string | null
          name: string
          organization_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          credentials_encrypted?: string | null
          error_count?: number | null
          id?: string
          integration_type: string
          last_error?: string | null
          last_sync_at?: string | null
          name: string
          organization_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          credentials_encrypted?: string | null
          error_count?: number | null
          id?: string
          integration_type?: string
          last_error?: string | null
          last_sync_at?: string | null
          name?: string
          organization_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_connections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_sync_logs: {
        Row: {
          completed_at: string | null
          connection_id: string
          duration_ms: number | null
          errors: Json | null
          id: string
          records_created: number | null
          records_failed: number | null
          records_processed: number | null
          records_updated: number | null
          started_at: string | null
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          connection_id: string
          duration_ms?: number | null
          errors?: Json | null
          id?: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string | null
          status: string
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          connection_id?: string
          duration_ms?: number | null
          errors?: Json | null
          id?: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_logs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "integration_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          barcode: string | null
          category_id: string | null
          cost_currency: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location_id: string | null
          name: string
          organization_id: string
          quantity_available: number | null
          quantity_on_hand: number | null
          quantity_reserved: number | null
          reorder_point: number | null
          reorder_quantity: number | null
          sku: string
          specifications: Json | null
          unit_cost: number | null
          unit_of_measure: string | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          cost_currency?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_id?: string | null
          name: string
          organization_id: string
          quantity_available?: number | null
          quantity_on_hand?: number | null
          quantity_reserved?: number | null
          reorder_point?: number | null
          reorder_quantity?: number | null
          sku: string
          specifications?: Json | null
          unit_cost?: number | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          cost_currency?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location_id?: string | null
          name?: string
          organization_id?: string
          quantity_available?: number | null
          quantity_on_hand?: number | null
          quantity_reserved?: number | null
          reorder_point?: number | null
          reorder_quantity?: number | null
          sku?: string
          specifications?: Json | null
          unit_cost?: number | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "asset_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          created_at: string | null
          created_by: string | null
          event_id: string | null
          from_location_id: string | null
          id: string
          inventory_item_id: string
          notes: string | null
          organization_id: string
          project_id: string | null
          quantity: number
          reference_number: string | null
          to_location_id: string | null
          total_cost: number | null
          transaction_type: Database["public"]["Enums"]["inventory_transaction_type"]
          unit_cost: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          event_id?: string | null
          from_location_id?: string | null
          id?: string
          inventory_item_id: string
          notes?: string | null
          organization_id: string
          project_id?: string | null
          quantity: number
          reference_number?: string | null
          to_location_id?: string | null
          total_cost?: number | null
          transaction_type: Database["public"]["Enums"]["inventory_transaction_type"]
          unit_cost?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          event_id?: string | null
          from_location_id?: string | null
          id?: string
          inventory_item_id?: string
          notes?: string | null
          organization_id?: string
          project_id?: string | null
          quantity?: number
          reference_number?: string | null
          to_location_id?: string | null
          total_cost?: number | null
          transaction_type?: Database["public"]["Enums"]["inventory_transaction_type"]
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          budget_category_id: string | null
          created_at: string | null
          description: string
          discount_amount: number | null
          discount_percent: number | null
          id: string
          invoice_id: string
          line_total: number
          position: number
          quantity: number
          tax_amount: number | null
          tax_rate: number | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          budget_category_id?: string | null
          created_at?: string | null
          description: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          invoice_id: string
          line_total: number
          position: number
          quantity: number
          tax_amount?: number | null
          tax_rate?: number | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          budget_category_id?: string | null
          created_at?: string | null
          description?: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          invoice_id?: string
          line_total?: number
          position?: number
          quantity?: number
          tax_amount?: number | null
          tax_rate?: number | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_budget_category_id_fkey"
            columns: ["budget_category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          billing_address: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          direction: Database["public"]["Enums"]["invoice_direction"]
          discount_amount: number | null
          due_date: string
          event_id: string | null
          id: string
          internal_notes: string | null
          invoice_number: string
          invoice_type: Database["public"]["Enums"]["invoice_type"] | null
          issue_date: string
          notes: string | null
          organization_id: string
          paid_at: string | null
          payment_terms: number | null
          project_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          total_amount: number
          updated_at: string | null
          viewed_at: string | null
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number | null
          billing_address?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          direction: Database["public"]["Enums"]["invoice_direction"]
          discount_amount?: number | null
          due_date: string
          event_id?: string | null
          id?: string
          internal_notes?: string | null
          invoice_number: string
          invoice_type?: Database["public"]["Enums"]["invoice_type"] | null
          issue_date: string
          notes?: string | null
          organization_id: string
          paid_at?: string | null
          payment_terms?: number | null
          project_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount: number
          updated_at?: string | null
          viewed_at?: string | null
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number | null
          billing_address?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          direction?: Database["public"]["Enums"]["invoice_direction"]
          discount_amount?: number | null
          due_date?: string
          event_id?: string | null
          id?: string
          internal_notes?: string | null
          invoice_number?: string
          invoice_type?: Database["public"]["Enums"]["invoice_type"] | null
          issue_date?: string
          notes?: string | null
          organization_id?: string
          paid_at?: string | null
          payment_terms?: number | null
          project_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number
          updated_at?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_articles: {
        Row: {
          category_id: string | null
          content: string
          created_at: string | null
          created_by: string | null
          excerpt: string | null
          helpful_count: number | null
          id: string
          is_featured: boolean | null
          last_edited_by: string | null
          meta_description: string | null
          meta_title: string | null
          not_helpful_count: number | null
          published_at: string | null
          related_articles: string[] | null
          slug: string
          status: Database["public"]["Enums"]["article_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          category_id?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          last_edited_by?: string | null
          meta_description?: string | null
          meta_title?: string | null
          not_helpful_count?: number | null
          published_at?: string | null
          related_articles?: string[] | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          last_edited_by?: string | null
          meta_description?: string | null
          meta_title?: string | null
          not_helpful_count?: number | null
          published_at?: string | null
          related_articles?: string[] | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "kb_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_articles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_articles_last_edited_by_fkey"
            columns: ["last_edited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_public: boolean | null
          name: string
          parent_id: string | null
          position: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          parent_id?: string | null
          position?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          parent_id?: string | null
          position?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "kb_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          location_type: Database["public"]["Enums"]["location_type"]
          longitude: number | null
          metadata: Json | null
          name: string
          organization_id: string
          parent_id: string | null
          postal_code: string | null
          slug: string
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location_type: Database["public"]["Enums"]["location_type"]
          longitude?: number | null
          metadata?: Json | null
          name: string
          organization_id: string
          parent_id?: string | null
          postal_code?: string | null
          slug: string
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location_type?: Database["public"]["Enums"]["location_type"]
          longitude?: number | null
          metadata?: Json | null
          name?: string
          organization_id?: string
          parent_id?: string | null
          postal_code?: string | null
          slug?: string
          state?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      login_history: {
        Row: {
          created_at: string | null
          failure_reason: string | null
          id: string
          ip_address: unknown
          location: Json | null
          login_method: string
          status: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          location?: Json | null
          login_method: string
          status: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          location?: Json | null
          login_method?: string
          status?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "login_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_materials: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          campaign_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          dimensions: string | null
          event_id: string | null
          file_url: string | null
          id: string
          material_type: Database["public"]["Enums"]["material_type"]
          name: string
          organization_id: string
          preview_url: string | null
          published_at: string | null
          specifications: Json | null
          status: Database["public"]["Enums"]["material_status"] | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          campaign_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          dimensions?: string | null
          event_id?: string | null
          file_url?: string | null
          id?: string
          material_type: Database["public"]["Enums"]["material_type"]
          name: string
          organization_id: string
          preview_url?: string | null
          published_at?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["material_status"] | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          campaign_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          dimensions?: string | null
          event_id?: string | null
          file_url?: string | null
          id?: string
          material_type?: Database["public"]["Enums"]["material_type"]
          name?: string
          organization_id?: string
          preview_url?: string | null
          published_at?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["material_status"] | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_materials_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_materials_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_materials_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_materials_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_materials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          parent_id: string | null
          position: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          parent_id?: string | null
          position?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          parent_id?: string | null
          position?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_favorites: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_inquiries: {
        Row: {
          created_at: string | null
          id: string
          inquirer_id: string
          listing_id: string
          message: string
          responded_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inquirer_id: string
          listing_id: string
          message: string
          responded_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inquirer_id?: string
          listing_id?: string
          message?: string
          responded_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_inquiries_inquirer_id_fkey"
            columns: ["inquirer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_inquiries_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          category_id: string | null
          condition: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          expires_at: string | null
          featured_until: string | null
          id: string
          images: Json | null
          inquiries_count: number | null
          listing_type: string
          location: string | null
          organization_id: string
          price: number | null
          price_negotiable: boolean | null
          seller_id: string
          sold_at: string | null
          sold_to: string | null
          specifications: Json | null
          status:
            | Database["public"]["Enums"]["marketplace_listing_status"]
            | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          category_id?: string | null
          condition?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          featured_until?: string | null
          id?: string
          images?: Json | null
          inquiries_count?: number | null
          listing_type: string
          location?: string | null
          organization_id: string
          price?: number | null
          price_negotiable?: boolean | null
          seller_id: string
          sold_at?: string | null
          sold_to?: string | null
          specifications?: Json | null
          status?:
            | Database["public"]["Enums"]["marketplace_listing_status"]
            | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          category_id?: string | null
          condition?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          featured_until?: string | null
          id?: string
          images?: Json | null
          inquiries_count?: number | null
          listing_type?: string
          location?: string | null
          organization_id?: string
          price?: number | null
          price_negotiable?: boolean | null
          seller_id?: string
          sold_at?: string | null
          sold_to?: string | null
          specifications?: Json | null
          status?:
            | Database["public"]["Enums"]["marketplace_listing_status"]
            | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_sold_to_fkey"
            columns: ["sold_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          file_size: number | null
          file_type: string
          file_url: string
          folder_path: string | null
          height: number | null
          id: string
          metadata: Json | null
          mime_type: string | null
          name: string
          organization_id: string
          status: Database["public"]["Enums"]["media_status"] | null
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string | null
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          file_type: string
          file_url: string
          folder_path?: string | null
          height?: number | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          name: string
          organization_id: string
          status?: Database["public"]["Enums"]["media_status"] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          folder_path?: string | null
          height?: number | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          name?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["media_status"] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string | null
          organization_id: string | null
          thread_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string | null
          organization_id?: string | null
          thread_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string | null
          organization_id?: string | null
          thread_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          name: string
          organization_id: string
          project_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          name: string
          organization_id: string
          project_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          name?: string
          organization_id?: string
          project_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          metadata: Json | null
          name: string | null
          organization_id: string
          preferences: Json | null
          source: string | null
          status: string | null
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          metadata?: Json | null
          name?: string | null
          organization_id: string
          preferences?: Json | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          metadata?: Json | null
          name?: string | null
          organization_id?: string
          preferences?: Json | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_subscribers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          message: string | null
          organization_id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          organization_id: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          organization_id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_applications: {
        Row: {
          client_id: string
          client_secret_hash: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_confidential: boolean | null
          logo_url: string | null
          name: string
          organization_id: string
          privacy_policy_url: string | null
          redirect_uris: string[]
          scopes: string[] | null
          terms_of_service_url: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          client_secret_hash: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_confidential?: boolean | null
          logo_url?: string | null
          name: string
          organization_id: string
          privacy_policy_url?: string | null
          redirect_uris: string[]
          scopes?: string[] | null
          terms_of_service_url?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          client_secret_hash?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_confidential?: boolean | null
          logo_url?: string | null
          name?: string
          organization_id?: string
          privacy_policy_url?: string | null
          redirect_uris?: string[]
          scopes?: string[] | null
          terms_of_service_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oauth_applications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_authorizations: {
        Row: {
          application_id: string
          authorized_at: string | null
          id: string
          revoked_at: string | null
          scopes: string[] | null
          user_id: string
        }
        Insert: {
          application_id: string
          authorized_at?: string | null
          id?: string
          revoked_at?: string | null
          scopes?: string[] | null
          user_id: string
        }
        Update: {
          application_id?: string
          authorized_at?: string | null
          id?: string
          revoked_at?: string | null
          scopes?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_authorizations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "oauth_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_authorizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_tokens: {
        Row: {
          authorization_id: string
          created_at: string | null
          expires_at: string
          id: string
          revoked_at: string | null
          scopes: string[] | null
          token_hash: string
          token_type: string
        }
        Insert: {
          authorization_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          revoked_at?: string | null
          scopes?: string[] | null
          token_hash: string
          token_type: string
        }
        Update: {
          authorization_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          revoked_at?: string | null
          scopes?: string[] | null
          token_hash?: string
          token_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_tokens_authorization_id_fkey"
            columns: ["authorization_id"]
            isOneToOne: false
            referencedRelation: "oauth_authorizations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_steps: {
        Row: {
          applicable_account_types: string[] | null
          applicable_subscription_tiers:
            | Database["public"]["Enums"]["subscription_tier"][]
            | null
          created_at: string | null
          description: string | null
          estimated_minutes: number | null
          help_text: string | null
          icon: string | null
          id: string
          is_required: boolean | null
          is_skippable: boolean | null
          name: string
          position: number
          slug: string
          updated_at: string | null
        }
        Insert: {
          applicable_account_types?: string[] | null
          applicable_subscription_tiers?:
            | Database["public"]["Enums"]["subscription_tier"][]
            | null
          created_at?: string | null
          description?: string | null
          estimated_minutes?: number | null
          help_text?: string | null
          icon?: string | null
          id?: string
          is_required?: boolean | null
          is_skippable?: boolean | null
          name: string
          position?: number
          slug: string
          updated_at?: string | null
        }
        Update: {
          applicable_account_types?: string[] | null
          applicable_subscription_tiers?:
            | Database["public"]["Enums"]["subscription_tier"][]
            | null
          created_at?: string | null
          description?: string | null
          estimated_minutes?: number | null
          help_text?: string | null
          icon?: string | null
          id?: string
          is_required?: boolean | null
          is_skippable?: boolean | null
          name?: string
          position?: number
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          application_deadline: string | null
          applications_count: number | null
          benefits: string | null
          compensation_max: number | null
          compensation_min: number | null
          compensation_type: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          end_date: string | null
          id: string
          is_featured: boolean | null
          is_remote: boolean | null
          location: string | null
          opportunity_type: string
          organization_id: string
          posted_by: string
          preferred_skills: string[] | null
          required_skills: string[] | null
          requirements: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["opportunity_status"] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          application_deadline?: string | null
          applications_count?: number | null
          benefits?: string | null
          compensation_max?: number | null
          compensation_min?: number | null
          compensation_type?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_featured?: boolean | null
          is_remote?: boolean | null
          location?: string | null
          opportunity_type: string
          organization_id: string
          posted_by: string
          preferred_skills?: string[] | null
          required_skills?: string[] | null
          requirements?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          application_deadline?: string | null
          applications_count?: number | null
          benefits?: string | null
          compensation_max?: number | null
          compensation_min?: number | null
          compensation_type?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_featured?: boolean | null
          is_remote?: boolean | null
          location?: string | null
          opportunity_type?: string
          organization_id?: string
          posted_by?: string
          preferred_skills?: string[] | null
          required_skills?: string[] | null
          requirements?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_applications: {
        Row: {
          answers: Json | null
          applicant_id: string
          cover_letter: string | null
          created_at: string | null
          id: string
          notes: string | null
          opportunity_id: string
          portfolio_url: string | null
          rating: number | null
          resume_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          answers?: Json | null
          applicant_id: string
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          opportunity_id: string
          portfolio_url?: string | null
          rating?: number | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          answers?: Json | null
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          opportunity_id?: string
          portfolio_url?: string | null
          rating?: number | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_credits: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          expires_at: string | null
          id: string
          organization_id: string
          source: string | null
          used_amount: number | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          organization_id: string
          source?: string | null
          used_amount?: number | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          organization_id?: string
          source?: string | null
          used_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_credits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_credits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_feature_overrides: {
        Row: {
          config: Json | null
          created_at: string | null
          feature_flag_id: string
          id: string
          is_enabled: boolean
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          feature_flag_id: string
          id?: string
          is_enabled: boolean
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          feature_flag_id?: string
          id?: string
          is_enabled?: boolean
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_feature_overrides_feature_flag_id_fkey"
            columns: ["feature_flag_id"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_feature_overrides_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          account_type_slug: string | null
          created_at: string | null
          declined_at: string | null
          department_id: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          message: string | null
          metadata: Json | null
          organization_id: string
          position_id: string | null
          reminder_count: number | null
          reminder_sent_at: string | null
          revoked_at: string | null
          role_id: string
          token: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          account_type_slug?: string | null
          created_at?: string | null
          declined_at?: string | null
          department_id?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          message?: string | null
          metadata?: Json | null
          organization_id: string
          position_id?: string | null
          reminder_count?: number | null
          reminder_sent_at?: string | null
          revoked_at?: string | null
          role_id: string
          token: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          account_type_slug?: string | null
          created_at?: string | null
          declined_at?: string | null
          department_id?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          message?: string | null
          metadata?: Json | null
          organization_id?: string
          position_id?: string | null
          reminder_count?: number | null
          reminder_sent_at?: string | null
          revoked_at?: string | null
          role_id?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          department_id: string | null
          id: string
          invited_by: string | null
          is_owner: boolean | null
          joined_at: string | null
          organization_id: string
          position_id: string | null
          role_id: string
          status: Database["public"]["Enums"]["member_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          invited_by?: string | null
          is_owner?: boolean | null
          joined_at?: string | null
          organization_id: string
          position_id?: string | null
          role_id: string
          status?: Database["public"]["Enums"]["member_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          invited_by?: string | null
          is_owner?: boolean | null
          joined_at?: string | null
          organization_id?: string
          position_id?: string | null
          role_id?: string
          status?: Database["public"]["Enums"]["member_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_subscriptions: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          cancel_at_period_end: boolean | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          metadata: Json | null
          organization_id: string
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          metadata?: Json | null
          organization_id: string
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          deleted_at: string | null
          description: string | null
          email: string | null
          id: string
          legal_name: string | null
          locale: string | null
          logo_url: string | null
          metadata: Json | null
          name: string
          phone: string | null
          postal_code: string | null
          settings: Json | null
          slug: string
          state: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          timezone: string | null
          trial_ends_at: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          locale?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name: string
          phone?: string | null
          postal_code?: string | null
          settings?: Json | null
          slug: string
          state?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          locale?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          settings?: Json | null
          slug?: string
          state?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          billing_address: Json | null
          billing_email: string | null
          billing_name: string | null
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_last_four: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          organization_id: string
          payment_type: string
          stripe_payment_method_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_address?: Json | null
          billing_email?: string | null
          billing_name?: string | null
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last_four?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          organization_id: string
          payment_type: string
          stripe_payment_method_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_address?: Json | null
          billing_email?: string | null
          billing_name?: string | null
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last_four?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          organization_id?: string
          payment_type?: string
          stripe_payment_method_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          currency: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          organization_id: string
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_number: string
          reference_number: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          organization_id: string
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_number: string
          reference_number?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          organization_id?: string
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_number?: string
          reference_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_definitions: {
        Row: {
          action: string
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          name: string
          resource: string
          slug: string
          tier_required: Database["public"]["Enums"]["subscription_tier"] | null
        }
        Insert: {
          action: string
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          resource: string
          slug: string
          tier_required?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
        }
        Update: {
          action?: string
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          resource?: string
          slug?: string
          tier_required?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_lost: boolean | null
          is_won: boolean | null
          name: string
          organization_id: string
          position: number
          probability: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_lost?: boolean | null
          is_won?: boolean | null
          name: string
          organization_id: string
          position: number
          probability?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_lost?: boolean | null
          is_won?: boolean | null
          name?: string
          organization_id?: string
          position?: number
          probability?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_acknowledgments: {
        Row: {
          acknowledged_at: string | null
          expires_at: string | null
          id: string
          ip_address: unknown
          policy_id: string
          user_agent: string | null
          user_id: string
          version: number
        }
        Insert: {
          acknowledged_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          policy_id: string
          user_agent?: string | null
          user_id: string
          version: number
        }
        Update: {
          acknowledged_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          policy_id?: string
          user_agent?: string | null
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "policy_acknowledgments_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "compliance_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_acknowledgments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_versions: {
        Row: {
          change_summary: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          effective_date: string | null
          id: string
          policy_id: string
          version: number
        }
        Insert: {
          change_summary?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          id?: string
          policy_id: string
          version: number
        }
        Update: {
          change_summary?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          id?: string
          policy_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "policy_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_versions_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "compliance_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_programs: {
        Row: {
          added_at: string | null
          id: string
          portfolio_id: string
          position: number | null
          program_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          portfolio_id: string
          position?: number | null
          program_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          portfolio_id?: string
          position?: number | null
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_programs_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          budget_amount: number | null
          budget_currency: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          owner_id: string | null
          settings: Json | null
          slug: string
          status: Database["public"]["Enums"]["program_status"] | null
          updated_at: string | null
        }
        Insert: {
          budget_amount?: number | null
          budget_currency?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          owner_id?: string | null
          settings?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["program_status"] | null
          updated_at?: string | null
        }
        Update: {
          budget_amount?: number | null
          budget_currency?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          owner_id?: string | null
          settings?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["program_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolios_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolios_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          created_at: string | null
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          level: number | null
          name: string
          organization_id: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: number | null
          name: string
          organization_id: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: number | null
          name?: string
          organization_id?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "positions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "positions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          accuracy_score: number | null
          actual_value: number | null
          category: string | null
          confidence_interval_high: number | null
          confidence_interval_low: number | null
          confidence_score: number | null
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_type: string | null
          expires_at: string | null
          generated_at: string | null
          id: string
          input_data: Json | null
          model_version: string | null
          organization_id: string
          predicted_date: string | null
          predicted_value: number | null
          prediction_type: string
          title: string
        }
        Insert: {
          accuracy_score?: number | null
          actual_value?: number | null
          category?: string | null
          confidence_interval_high?: number | null
          confidence_interval_low?: number | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          input_data?: Json | null
          model_version?: string | null
          organization_id: string
          predicted_date?: string | null
          predicted_value?: number | null
          prediction_type: string
          title: string
        }
        Update: {
          accuracy_score?: number | null
          actual_value?: number | null
          category?: string | null
          confidence_interval_high?: number | null
          confidence_interval_low?: number | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          input_data?: Json | null
          model_version?: string | null
          organization_id?: string
          predicted_date?: string | null
          predicted_value?: number | null
          prediction_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      production_notes: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          department: Database["public"]["Enums"]["cue_department"] | null
          event_day_id: string | null
          event_id: string
          id: string
          is_resolved: boolean | null
          organization_id: string
          priority: Database["public"]["Enums"]["priority_level"] | null
          resolved_at: string | null
          resolved_by: string | null
          runsheet_id: string | null
          runsheet_item_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          department?: Database["public"]["Enums"]["cue_department"] | null
          event_day_id?: string | null
          event_id: string
          id?: string
          is_resolved?: boolean | null
          organization_id: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          resolved_at?: string | null
          resolved_by?: string | null
          runsheet_id?: string | null
          runsheet_item_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          department?: Database["public"]["Enums"]["cue_department"] | null
          event_day_id?: string | null
          event_id?: string
          id?: string
          is_resolved?: boolean | null
          organization_id?: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          resolved_at?: string | null
          resolved_by?: string | null
          runsheet_id?: string | null
          runsheet_item_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_notes_event_day_id_fkey"
            columns: ["event_day_id"]
            isOneToOne: false
            referencedRelation: "event_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_notes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_notes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_notes_runsheet_id_fkey"
            columns: ["runsheet_id"]
            isOneToOne: false
            referencedRelation: "runsheets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_notes_runsheet_item_id_fkey"
            columns: ["runsheet_item_id"]
            isOneToOne: false
            referencedRelation: "runsheet_items"
            referencedColumns: ["id"]
          },
        ]
      }
      program_members: {
        Row: {
          id: string
          joined_at: string | null
          permissions: Json | null
          program_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          permissions?: Json | null
          program_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          permissions?: Json | null
          program_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_members_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      program_metrics: {
        Row: {
          calculated_at: string | null
          created_at: string | null
          id: string
          metric_type: string
          name: string
          period_end: string | null
          period_start: string | null
          previous_value: number | null
          program_id: string
          target_value: number | null
          unit: string | null
          value: number | null
        }
        Insert: {
          calculated_at?: string | null
          created_at?: string | null
          id?: string
          metric_type: string
          name: string
          period_end?: string | null
          period_start?: string | null
          previous_value?: number | null
          program_id: string
          target_value?: number | null
          unit?: string | null
          value?: number | null
        }
        Update: {
          calculated_at?: string | null
          created_at?: string | null
          id?: string
          metric_type?: string
          name?: string
          period_end?: string | null
          period_start?: string | null
          previous_value?: number | null
          program_id?: string
          target_value?: number | null
          unit?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "program_metrics_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_objectives: {
        Row: {
          created_at: string | null
          current_value: number | null
          description: string | null
          due_date: string | null
          id: string
          name: string
          program_id: string
          status: string | null
          target_value: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          program_id: string
          status?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          program_id?: string
          status?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_objectives_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_projects: {
        Row: {
          added_at: string | null
          added_by: string | null
          id: string
          position: number | null
          program_id: string
          project_id: string
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          position?: number | null
          program_id: string
          project_id: string
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          position?: number | null
          program_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_projects_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_projects_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          budget_amount: number | null
          budget_currency: string | null
          color: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          end_date: string | null
          icon: string | null
          id: string
          metadata: Json | null
          name: string
          organization_id: string
          owner_id: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          settings: Json | null
          slug: string
          start_date: string | null
          status: Database["public"]["Enums"]["program_status"] | null
          updated_at: string | null
          visibility: Database["public"]["Enums"]["visibility_type"] | null
        }
        Insert: {
          budget_amount?: number | null
          budget_currency?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          name: string
          organization_id: string
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          settings?: Json | null
          slug: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["program_status"] | null
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
        }
        Update: {
          budget_amount?: number | null
          budget_currency?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          organization_id?: string
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          settings?: Json | null
          slug?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["program_status"] | null
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_budgets: {
        Row: {
          budget_id: string
          created_at: string | null
          id: string
          project_id: string
        }
        Insert: {
          budget_id: string
          created_at?: string | null
          id?: string
          project_id: string
        }
        Update: {
          budget_id?: string
          created_at?: string | null
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_budgets_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_events: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          project_id: string
          relationship_type: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          project_id: string
          relationship_type?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          project_id?: string
          relationship_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string | null
          id: string
          joined_at: string | null
          permissions: Json | null
          project_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          permissions?: Json | null
          project_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          permissions?: Json | null
          project_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget_amount: number | null
          budget_currency: string | null
          color: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          end_date: string | null
          icon: string | null
          id: string
          metadata: Json | null
          name: string
          organization_id: string
          parent_id: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          settings: Json | null
          slug: string
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string | null
          visibility: Database["public"]["Enums"]["visibility_type"] | null
          workspace_id: string | null
        }
        Insert: {
          budget_amount?: number | null
          budget_currency?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          name: string
          organization_id: string
          parent_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          settings?: Json | null
          slug: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
          workspace_id?: string | null
        }
        Update: {
          budget_amount?: number | null
          budget_currency?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          organization_id?: string
          parent_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          settings?: Json | null
          slug?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_items: {
        Row: {
          created_at: string | null
          description: string | null
          discount_percent: number | null
          id: string
          is_optional: boolean | null
          line_total: number
          name: string
          position: number
          proposal_id: string
          quantity: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          id?: string
          is_optional?: boolean | null
          line_total: number
          name: string
          position: number
          proposal_id: string
          quantity: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          id?: string
          is_optional?: boolean | null
          line_total?: number
          name?: string
          position?: number
          proposal_id?: string
          quantity?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_items_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          accepted_at: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          deal_id: string | null
          description: string | null
          discount_amount: number | null
          document_url: string | null
          id: string
          notes: string | null
          organization_id: string
          proposal_number: string
          rejected_at: string | null
          rejection_reason: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["proposal_status"] | null
          subtotal: number
          tax_amount: number | null
          terms: string | null
          title: string
          total_amount: number
          updated_at: string | null
          valid_until: string | null
          viewed_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_id?: string | null
          description?: string | null
          discount_amount?: number | null
          document_url?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          proposal_number: string
          rejected_at?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["proposal_status"] | null
          subtotal: number
          tax_amount?: number | null
          terms?: string | null
          title: string
          total_amount: number
          updated_at?: string | null
          valid_until?: string | null
          viewed_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_id?: string | null
          description?: string | null
          discount_amount?: number | null
          document_url?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          proposal_number?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["proposal_status"] | null
          subtotal?: number
          tax_amount?: number | null
          terms?: string | null
          title?: string
          total_amount?: number
          updated_at?: string | null
          valid_until?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      public_events: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          custom_css: string | null
          custom_js: string | null
          description: string | null
          event_id: string
          gallery_urls: Json | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          organization_id: string
          published_at: string | null
          short_description: string | null
          slug: string
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          custom_css?: string | null
          custom_js?: string | null
          description?: string | null
          event_id: string
          gallery_urls?: Json | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          organization_id: string
          published_at?: string | null
          short_description?: string | null
          slug: string
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          custom_css?: string | null
          custom_js?: string | null
          description?: string | null
          event_id?: string
          gallery_urls?: Json | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          organization_id?: string
          published_at?: string | null
          short_description?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      public_pages: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          organization_id: string
          parent_id: string | null
          position: number | null
          published_at: string | null
          slug: string
          template: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          organization_id: string
          parent_id?: string | null
          position?: number | null
          published_at?: string | null
          slug: string
          template?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          organization_id?: string
          parent_id?: string | null
          position?: number | null
          published_at?: string | null
          slug?: string
          template?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_pages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_pages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_pages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          line_total: number
          notes: string | null
          position: number
          purchase_order_id: string
          quantity_ordered: number
          quantity_received: number | null
          requisition_item_id: string | null
          tax_rate: number | null
          unit_of_measure: string | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          line_total: number
          notes?: string | null
          position: number
          purchase_order_id: string
          quantity_ordered: number
          quantity_received?: number | null
          requisition_item_id?: string | null
          tax_rate?: number | null
          unit_of_measure?: string | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          line_total?: number
          notes?: string | null
          position?: number
          purchase_order_id?: string
          quantity_ordered?: number
          quantity_received?: number | null
          requisition_item_id?: string | null
          tax_rate?: number | null
          unit_of_measure?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_requisition_item_id_fkey"
            columns: ["requisition_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_requisition_items"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          acknowledged_at: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          event_id: string | null
          expected_delivery_date: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          order_date: string
          organization_id: string
          payment_terms: number | null
          po_number: string
          project_id: string | null
          requisition_id: string | null
          sent_at: string | null
          shipping_address: string | null
          shipping_amount: number | null
          status: Database["public"]["Enums"]["po_status"] | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          event_id?: string | null
          expected_delivery_date?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_date: string
          organization_id: string
          payment_terms?: number | null
          po_number: string
          project_id?: string | null
          requisition_id?: string | null
          sent_at?: string | null
          shipping_address?: string | null
          shipping_amount?: number | null
          status?: Database["public"]["Enums"]["po_status"] | null
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          event_id?: string | null
          expected_delivery_date?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_date?: string
          organization_id?: string
          payment_terms?: number | null
          po_number?: string
          project_id?: string | null
          requisition_id?: string | null
          sent_at?: string | null
          shipping_address?: string | null
          shipping_amount?: number | null
          status?: Database["public"]["Enums"]["po_status"] | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_requisition_id_fkey"
            columns: ["requisition_id"]
            isOneToOne: false
            referencedRelation: "purchase_requisitions"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_requisition_items: {
        Row: {
          created_at: string | null
          description: string
          estimated_total: number | null
          estimated_unit_price: number | null
          id: string
          notes: string | null
          position: number
          preferred_vendor_id: string | null
          quantity: number
          requisition_id: string
          unit_of_measure: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          estimated_total?: number | null
          estimated_unit_price?: number | null
          id?: string
          notes?: string | null
          position: number
          preferred_vendor_id?: string | null
          quantity: number
          requisition_id: string
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          estimated_total?: number | null
          estimated_unit_price?: number | null
          id?: string
          notes?: string | null
          position?: number
          preferred_vendor_id?: string | null
          quantity?: number
          requisition_id?: string
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requisition_items_requisition_id_fkey"
            columns: ["requisition_id"]
            isOneToOne: false
            referencedRelation: "purchase_requisitions"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_requisitions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          currency: string | null
          department_id: string | null
          description: string | null
          estimated_total: number | null
          event_id: string | null
          id: string
          needed_by: string | null
          notes: string | null
          organization_id: string
          priority: Database["public"]["Enums"]["requisition_priority"] | null
          project_id: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          requested_by: string
          requisition_number: string
          status: Database["public"]["Enums"]["requisition_status"] | null
          submitted_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          currency?: string | null
          department_id?: string | null
          description?: string | null
          estimated_total?: number | null
          event_id?: string | null
          id?: string
          needed_by?: string | null
          notes?: string | null
          organization_id: string
          priority?: Database["public"]["Enums"]["requisition_priority"] | null
          project_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          requested_by: string
          requisition_number: string
          status?: Database["public"]["Enums"]["requisition_status"] | null
          submitted_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          currency?: string | null
          department_id?: string | null
          description?: string | null
          estimated_total?: number | null
          event_id?: string | null
          id?: string
          needed_by?: string | null
          notes?: string | null
          organization_id?: string
          priority?: Database["public"]["Enums"]["requisition_priority"] | null
          project_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          requested_by?: string
          requisition_number?: string
          status?: Database["public"]["Enums"]["requisition_status"] | null
          submitted_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requisitions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requisitions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requisitions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requisitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requisitions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requisitions_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requisitions_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_card_items: {
        Row: {
          created_at: string | null
          currency: string | null
          double_time_rate: number | null
          id: string
          notes: string | null
          overtime_rate: number | null
          position_id: string | null
          rate_card_id: string
          rate_type: Database["public"]["Enums"]["rate_type"]
          regular_rate: number
          skill_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          double_time_rate?: number | null
          id?: string
          notes?: string | null
          overtime_rate?: number | null
          position_id?: string | null
          rate_card_id: string
          rate_type: Database["public"]["Enums"]["rate_type"]
          regular_rate: number
          skill_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          double_time_rate?: number | null
          id?: string
          notes?: string | null
          overtime_rate?: number | null
          position_id?: string | null
          rate_card_id?: string
          rate_type?: Database["public"]["Enums"]["rate_type"]
          regular_rate?: number
          skill_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_card_items_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_card_items_rate_card_id_fkey"
            columns: ["rate_card_id"]
            isOneToOne: false
            referencedRelation: "rate_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_card_items_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_cards: {
        Row: {
          created_at: string | null
          description: string | null
          effective_date: string
          end_date: string | null
          id: string
          is_default: boolean | null
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          effective_date: string
          end_date?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          effective_date?: string
          end_date?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_cards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      recent_items: {
        Row: {
          accessed_at: string | null
          entity_id: string
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          accessed_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          accessed_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recent_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          action_items: Json | null
          category: string | null
          created_at: string | null
          description: string | null
          effort_level: string | null
          entity_id: string | null
          entity_type: string | null
          expected_impact: string | null
          expires_at: string | null
          generated_at: string | null
          id: string
          implemented_at: string | null
          organization_id: string
          outcome_notes: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          rationale: string | null
          recommendation_type: string
          status: string | null
          title: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          action_items?: Json | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          effort_level?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expected_impact?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          implemented_at?: string | null
          organization_id: string
          outcome_notes?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          rationale?: string | null
          recommendation_type: string
          status?: string | null
          title: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          action_items?: Json | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          effort_level?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expected_impact?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          implemented_at?: string | null
          organization_id?: string
          outcome_notes?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          rationale?: string | null
          recommendation_type?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      report_definitions: {
        Row: {
          category: string | null
          columns: Json | null
          created_at: string | null
          created_by: string | null
          default_format: Database["public"]["Enums"]["report_format"] | null
          description: string | null
          filters: Json | null
          grouping: Json | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          organization_id: string
          query_config: Json
          report_type: string
          slug: string
          sorting: Json | null
          updated_at: string | null
          visualizations: Json | null
        }
        Insert: {
          category?: string | null
          columns?: Json | null
          created_at?: string | null
          created_by?: string | null
          default_format?: Database["public"]["Enums"]["report_format"] | null
          description?: string | null
          filters?: Json | null
          grouping?: Json | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          organization_id: string
          query_config: Json
          report_type: string
          slug: string
          sorting?: Json | null
          updated_at?: string | null
          visualizations?: Json | null
        }
        Update: {
          category?: string | null
          columns?: Json | null
          created_at?: string | null
          created_by?: string | null
          default_format?: Database["public"]["Enums"]["report_format"] | null
          description?: string | null
          filters?: Json | null
          grouping?: Json | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          organization_id?: string
          query_config?: Json
          report_type?: string
          slug?: string
          sorting?: Json | null
          updated_at?: string | null
          visualizations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "report_definitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_definitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      report_exports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          expires_at: string | null
          file_size: number | null
          file_url: string | null
          filters: Json | null
          format: Database["public"]["Enums"]["report_format"]
          id: string
          name: string
          organization_id: string
          report_definition_id: string | null
          row_count: number | null
          schedule_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["report_status"] | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_size?: number | null
          file_url?: string | null
          filters?: Json | null
          format: Database["public"]["Enums"]["report_format"]
          id?: string
          name: string
          organization_id: string
          report_definition_id?: string | null
          row_count?: number | null
          schedule_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_size?: number | null
          file_url?: string | null
          filters?: Json | null
          format?: Database["public"]["Enums"]["report_format"]
          id?: string
          name?: string
          organization_id?: string
          report_definition_id?: string | null
          row_count?: number | null
          schedule_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "report_exports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_exports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_exports_report_definition_id_fkey"
            columns: ["report_definition_id"]
            isOneToOne: false
            referencedRelation: "report_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_exports_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "report_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      report_schedules: {
        Row: {
          created_at: string | null
          created_by: string | null
          filters: Json | null
          format: Database["public"]["Enums"]["report_format"] | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          name: string
          next_run_at: string | null
          recipients: Json | null
          report_definition_id: string
          schedule_cron: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          filters?: Json | null
          format?: Database["public"]["Enums"]["report_format"] | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          recipients?: Json | null
          report_definition_id: string
          schedule_cron: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          filters?: Json | null
          format?: Database["public"]["Enums"]["report_format"] | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          recipients?: Json | null
          report_definition_id?: string
          schedule_cron?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_schedules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_schedules_report_definition_id_fkey"
            columns: ["report_definition_id"]
            isOneToOne: false
            referencedRelation: "report_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      report_subscriptions: {
        Row: {
          created_at: string | null
          delivery_config: Json | null
          delivery_method: string | null
          id: string
          is_active: boolean | null
          report_schedule_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          delivery_config?: Json | null
          delivery_method?: string | null
          id?: string
          is_active?: boolean | null
          report_schedule_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          delivery_config?: Json | null
          delivery_method?: string | null
          id?: string
          is_active?: boolean | null
          report_schedule_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_subscriptions_report_schedule_id_fkey"
            columns: ["report_schedule_id"]
            isOneToOne: false
            referencedRelation: "report_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_forecasts: {
        Row: {
          allocated_hours: number | null
          available_hours: number | null
          created_at: string | null
          department_id: string | null
          gap_hours: number | null
          headcount_available: number | null
          headcount_required: number | null
          id: string
          notes: string | null
          organization_id: string
          period_end: string
          period_start: string
          position_id: string | null
          project_id: string | null
          required_hours: number | null
          updated_at: string | null
        }
        Insert: {
          allocated_hours?: number | null
          available_hours?: number | null
          created_at?: string | null
          department_id?: string | null
          gap_hours?: number | null
          headcount_available?: number | null
          headcount_required?: number | null
          id?: string
          notes?: string | null
          organization_id: string
          period_end: string
          period_start: string
          position_id?: string | null
          project_id?: string | null
          required_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          allocated_hours?: number | null
          available_hours?: number | null
          created_at?: string | null
          department_id?: string | null
          gap_hours?: number | null
          headcount_available?: number | null
          headcount_required?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          period_end?: string
          period_start?: string
          position_id?: string | null
          project_id?: string | null
          required_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_forecasts_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_forecasts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_forecasts_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_forecasts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      rider_items: {
        Row: {
          category: Database["public"]["Enums"]["rider_item_category"]
          created_at: string | null
          id: string
          is_required: boolean | null
          item: string
          notes: string | null
          position: number | null
          provider: Database["public"]["Enums"]["rider_item_provider"] | null
          quantity: number | null
          rider_id: string
          specifications: string | null
          status: Database["public"]["Enums"]["rider_item_status"] | null
          substitution_allowed: boolean | null
          substitution_notes: string | null
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["rider_item_category"]
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          item: string
          notes?: string | null
          position?: number | null
          provider?: Database["public"]["Enums"]["rider_item_provider"] | null
          quantity?: number | null
          rider_id: string
          specifications?: string | null
          status?: Database["public"]["Enums"]["rider_item_status"] | null
          substitution_allowed?: boolean | null
          substitution_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["rider_item_category"]
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          item?: string
          notes?: string | null
          position?: number | null
          provider?: Database["public"]["Enums"]["rider_item_provider"] | null
          quantity?: number | null
          rider_id?: string
          specifications?: string | null
          status?: Database["public"]["Enums"]["rider_item_status"] | null
          substitution_allowed?: boolean | null
          substitution_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rider_items_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
        ]
      }
      riders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          booking_id: string | null
          created_at: string | null
          created_by: string | null
          document_url: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          rider_type: Database["public"]["Enums"]["rider_type"]
          signed_at: string | null
          status: Database["public"]["Enums"]["rider_status"] | null
          submitted_at: string | null
          talent_id: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id?: string | null
          created_at?: string | null
          created_by?: string | null
          document_url?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          rider_type: Database["public"]["Enums"]["rider_type"]
          signed_at?: string | null
          status?: Database["public"]["Enums"]["rider_status"] | null
          submitted_at?: string | null
          talent_id?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id?: string | null
          created_at?: string | null
          created_by?: string | null
          document_url?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          rider_type?: Database["public"]["Enums"]["rider_type"]
          signed_at?: string | null
          status?: Database["public"]["Enums"]["rider_status"] | null
          submitted_at?: string | null
          talent_id?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "riders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "talent_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riders_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_assessments: {
        Row: {
          assessment_date: string
          assessor_id: string | null
          created_at: string | null
          description: string | null
          event_id: string | null
          id: string
          name: string
          next_review_date: string | null
          notes: string | null
          organization_id: string
          overall_risk_level: Database["public"]["Enums"]["risk_level"] | null
          project_id: string | null
          status: Database["public"]["Enums"]["risk_status"] | null
          updated_at: string | null
        }
        Insert: {
          assessment_date: string
          assessor_id?: string | null
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          name: string
          next_review_date?: string | null
          notes?: string | null
          organization_id: string
          overall_risk_level?: Database["public"]["Enums"]["risk_level"] | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["risk_status"] | null
          updated_at?: string | null
        }
        Update: {
          assessment_date?: string
          assessor_id?: string | null
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          name?: string
          next_review_date?: string | null
          notes?: string | null
          organization_id?: string
          overall_risk_level?: Database["public"]["Enums"]["risk_level"] | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["risk_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_assessor_id_fkey"
            columns: ["assessor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_assessments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_assessments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_items: {
        Row: {
          assessment_id: string
          category: string | null
          closed_at: string | null
          contingency_plan: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          impact: number | null
          likelihood: number | null
          mitigation_plan: string | null
          name: string
          notes: string | null
          owner_id: string | null
          residual_impact: number | null
          residual_likelihood: number | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          risk_score: number | null
          status: Database["public"]["Enums"]["risk_status"] | null
          updated_at: string | null
        }
        Insert: {
          assessment_id: string
          category?: string | null
          closed_at?: string | null
          contingency_plan?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          impact?: number | null
          likelihood?: number | null
          mitigation_plan?: string | null
          name: string
          notes?: string | null
          owner_id?: string | null
          residual_impact?: number | null
          residual_likelihood?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_score?: number | null
          status?: Database["public"]["Enums"]["risk_status"] | null
          updated_at?: string | null
        }
        Update: {
          assessment_id?: string
          category?: string | null
          closed_at?: string | null
          contingency_plan?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          impact?: number | null
          likelihood?: number | null
          mitigation_plan?: string | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          residual_impact?: number | null
          residual_likelihood?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_score?: number | null
          status?: Database["public"]["Enums"]["risk_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_items_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_items_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_mitigations: {
        Row: {
          action: string
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          effectiveness: string | null
          id: string
          notes: string | null
          risk_item_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          action: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          effectiveness?: string | null
          id?: string
          notes?: string | null
          risk_item_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          action?: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          effectiveness?: string | null
          id?: string
          notes?: string | null
          risk_item_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_mitigations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_mitigations_risk_item_id_fkey"
            columns: ["risk_item_id"]
            isOneToOne: false
            referencedRelation: "risk_items"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          level: number
          name: string
          organization_id: string | null
          permissions: Json | null
          slug: string
          tier: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          level: number
          name: string
          organization_id?: string | null
          permissions?: Json | null
          slug: string
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          level?: number
          name?: string
          organization_id?: string | null
          permissions?: Json | null
          slug?: string
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      runsheet_items: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          item_type: Database["public"]["Enums"]["runsheet_item_type"]
          metadata: Json | null
          notes: string | null
          parent_id: string | null
          position: number
          runsheet_id: string
          scheduled_end: string
          scheduled_start: string
          status: Database["public"]["Enums"]["runsheet_item_status"] | null
          talent_id: string | null
          technical_notes: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          item_type: Database["public"]["Enums"]["runsheet_item_type"]
          metadata?: Json | null
          notes?: string | null
          parent_id?: string | null
          position: number
          runsheet_id: string
          scheduled_end: string
          scheduled_start: string
          status?: Database["public"]["Enums"]["runsheet_item_status"] | null
          talent_id?: string | null
          technical_notes?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          item_type?: Database["public"]["Enums"]["runsheet_item_type"]
          metadata?: Json | null
          notes?: string | null
          parent_id?: string | null
          position?: number
          runsheet_id?: string
          scheduled_end?: string
          scheduled_start?: string
          status?: Database["public"]["Enums"]["runsheet_item_status"] | null
          talent_id?: string | null
          technical_notes?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "runsheet_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "runsheet_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runsheet_items_runsheet_id_fkey"
            columns: ["runsheet_id"]
            isOneToOne: false
            referencedRelation: "runsheets"
            referencedColumns: ["id"]
          },
        ]
      }
      runsheets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          event_day_id: string | null
          event_id: string
          id: string
          locked_at: string | null
          locked_by: string | null
          name: string
          organization_id: string
          stage_id: string | null
          status: Database["public"]["Enums"]["runsheet_status"] | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          event_day_id?: string | null
          event_id: string
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          name: string
          organization_id: string
          stage_id?: string | null
          status?: Database["public"]["Enums"]["runsheet_status"] | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          event_day_id?: string | null
          event_id?: string
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          name?: string
          organization_id?: string
          stage_id?: string | null
          status?: Database["public"]["Enums"]["runsheet_status"] | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "runsheets_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runsheets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runsheets_event_day_id_fkey"
            columns: ["event_day_id"]
            isOneToOne: false
            referencedRelation: "event_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runsheets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runsheets_locked_by_fkey"
            columns: ["locked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runsheets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runsheets_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_filters: {
        Row: {
          created_at: string | null
          entity_type: string
          filters: Json
          id: string
          is_default: boolean | null
          is_shared: boolean | null
          name: string
          organization_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          entity_type: string
          filters: Json
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          name: string
          organization_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          entity_type?: string
          filters?: Json
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          name?: string
          organization_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_filters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_filters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_reports: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          is_default: boolean | null
          name: string
          report_definition_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean | null
          name: string
          report_definition_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean | null
          name?: string
          report_definition_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_reports_report_definition_id_fkey"
            columns: ["report_definition_id"]
            isOneToOne: false
            referencedRelation: "report_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_views: {
        Row: {
          columns: Json | null
          config: Json
          created_at: string | null
          entity_type: string
          filters: Json | null
          grouping: Json | null
          id: string
          is_default: boolean | null
          is_shared: boolean | null
          name: string
          organization_id: string
          sorting: Json | null
          updated_at: string | null
          user_id: string | null
          view_type: string
        }
        Insert: {
          columns?: Json | null
          config: Json
          created_at?: string | null
          entity_type: string
          filters?: Json | null
          grouping?: Json | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          name: string
          organization_id: string
          sorting?: Json | null
          updated_at?: string | null
          user_id?: string | null
          view_type: string
        }
        Update: {
          columns?: Json | null
          config?: Json
          created_at?: string | null
          entity_type?: string
          filters?: Json | null
          grouping?: Json | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          name?: string
          organization_id?: string
          sorting?: Json | null
          updated_at?: string | null
          user_id?: string | null
          view_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_views_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          query: string
          results_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          query: string
          results_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          query?: string
          results_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      search_index: {
        Row: {
          content: string | null
          entity_id: string
          entity_type: string
          id: string
          indexed_at: string | null
          metadata: Json | null
          organization_id: string
          search_vector: unknown
          title: string
        }
        Insert: {
          content?: string | null
          entity_id: string
          entity_type: string
          id?: string
          indexed_at?: string | null
          metadata?: Json | null
          organization_id: string
          search_vector?: unknown
          title: string
        }
        Update: {
          content?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          indexed_at?: string | null
          metadata?: Json | null
          organization_id?: string
          search_vector?: unknown
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_index_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      setlist_items: {
        Row: {
          artist: string | null
          bpm: number | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          is_encore: boolean | null
          key: string | null
          notes: string | null
          position: number
          setlist_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          artist?: string | null
          bpm?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          is_encore?: boolean | null
          key?: string | null
          notes?: string | null
          position: number
          setlist_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          artist?: string | null
          bpm?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          is_encore?: boolean | null
          key?: string | null
          notes?: string | null
          position?: number
          setlist_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setlist_items_setlist_id_fkey"
            columns: ["setlist_id"]
            isOneToOne: false
            referencedRelation: "setlists"
            referencedColumns: ["id"]
          },
        ]
      }
      setlists: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          booking_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          status: Database["public"]["Enums"]["setlist_status"] | null
          submitted_at: string | null
          talent_id: string | null
          total_duration_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["setlist_status"] | null
          submitted_at?: string | null
          talent_id?: string | null
          total_duration_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["setlist_status"] | null
          submitted_at?: string | null
          talent_id?: string | null
          total_duration_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setlists_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setlists_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "talent_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setlists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setlists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setlists_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          break_minutes: number | null
          created_at: string | null
          crew_assignment_id: string | null
          date: string
          event_id: string | null
          id: string
          location_id: string | null
          notes: string | null
          organization_id: string
          project_id: string | null
          scheduled_end: string
          scheduled_start: string
          status: Database["public"]["Enums"]["shift_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          break_minutes?: number | null
          created_at?: string | null
          crew_assignment_id?: string | null
          date: string
          event_id?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          organization_id: string
          project_id?: string | null
          scheduled_end: string
          scheduled_start: string
          status?: Database["public"]["Enums"]["shift_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          break_minutes?: number | null
          created_at?: string | null
          crew_assignment_id?: string | null
          date?: string
          event_id?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          organization_id?: string
          project_id?: string | null
          scheduled_end?: string
          scheduled_start?: string
          status?: Database["public"]["Enums"]["shift_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_crew_assignment_id_fkey"
            columns: ["crew_assignment_id"]
            isOneToOne: false
            referencedRelation: "crew_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      show_calls: {
        Row: {
          call_time: string
          created_at: string | null
          created_by: string | null
          description: string | null
          event_day_id: string | null
          event_id: string
          id: string
          name: string
          notes: string | null
          organization_id: string
          status: Database["public"]["Enums"]["show_call_status"] | null
          updated_at: string | null
        }
        Insert: {
          call_time: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_day_id?: string | null
          event_id: string
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["show_call_status"] | null
          updated_at?: string | null
        }
        Update: {
          call_time?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_day_id?: string | null
          event_id?: string
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["show_call_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "show_calls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "show_calls_event_day_id_fkey"
            columns: ["event_day_id"]
            isOneToOne: false
            referencedRelation: "event_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "show_calls_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "show_calls_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      site_surveys: {
        Row: {
          attendees: string[] | null
          audio_assessment: Json | null
          completed_at: string | null
          created_at: string | null
          documents: Json | null
          event_id: string | null
          general_notes: string | null
          id: string
          lighting_assessment: Json | null
          load_in_assessment: Json | null
          organization_id: string
          photos: Json | null
          power_assessment: Json | null
          recommendations: string | null
          rigging_assessment: Json | null
          safety_assessment: Json | null
          staging_assessment: Json | null
          status: string | null
          survey_date: string
          surveyed_by: string | null
          updated_at: string | null
          venue_id: string
          video_assessment: Json | null
        }
        Insert: {
          attendees?: string[] | null
          audio_assessment?: Json | null
          completed_at?: string | null
          created_at?: string | null
          documents?: Json | null
          event_id?: string | null
          general_notes?: string | null
          id?: string
          lighting_assessment?: Json | null
          load_in_assessment?: Json | null
          organization_id: string
          photos?: Json | null
          power_assessment?: Json | null
          recommendations?: string | null
          rigging_assessment?: Json | null
          safety_assessment?: Json | null
          staging_assessment?: Json | null
          status?: string | null
          survey_date: string
          surveyed_by?: string | null
          updated_at?: string | null
          venue_id: string
          video_assessment?: Json | null
        }
        Update: {
          attendees?: string[] | null
          audio_assessment?: Json | null
          completed_at?: string | null
          created_at?: string | null
          documents?: Json | null
          event_id?: string | null
          general_notes?: string | null
          id?: string
          lighting_assessment?: Json | null
          load_in_assessment?: Json | null
          organization_id?: string
          photos?: Json | null
          power_assessment?: Json | null
          recommendations?: string | null
          rigging_assessment?: Json | null
          safety_assessment?: Json | null
          staging_assessment?: Json | null
          status?: string | null
          survey_date?: string
          surveyed_by?: string | null
          updated_at?: string | null
          venue_id?: string
          video_assessment?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "site_surveys_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_surveys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_surveys_surveyed_by_fkey"
            columns: ["surveyed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_surveys_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_sends: {
        Row: {
          content: string
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          external_id: string | null
          id: string
          metadata: Json | null
          organization_id: string
          recipient_name: string | null
          recipient_phone: string
          scheduled_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["sms_status"] | null
          template_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          recipient_name?: string | null
          recipient_phone: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["sms_status"] | null
          template_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          recipient_name?: string | null
          recipient_phone?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["sms_status"] | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_sends_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_sends_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "sms_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_templates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          slug: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          slug: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          slug?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          campaign_id: string | null
          content: string
          created_at: string | null
          created_by: string | null
          engagement_data: Json | null
          event_id: string | null
          external_post_id: string | null
          external_url: string | null
          hashtags: string[] | null
          id: string
          link_url: string | null
          media_urls: Json | null
          mentions: string[] | null
          organization_id: string
          platform: Database["public"]["Enums"]["social_platform"]
          published_at: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["social_post_status"] | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          engagement_data?: Json | null
          event_id?: string | null
          external_post_id?: string | null
          external_url?: string | null
          hashtags?: string[] | null
          id?: string
          link_url?: string | null
          media_urls?: Json | null
          mentions?: string[] | null
          organization_id: string
          platform: Database["public"]["Enums"]["social_platform"]
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["social_post_status"] | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          engagement_data?: Json | null
          event_id?: string | null
          external_post_id?: string | null
          external_url?: string | null
          hashtags?: string[] | null
          id?: string
          link_url?: string | null
          media_urls?: Json | null
          mentions?: string[] | null
          organization_id?: string
          platform?: Database["public"]["Enums"]["social_platform"]
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["social_post_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          capacity: number | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          dimensions: Json | null
          event_id: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          slug: string
          stage_plot_url: string | null
          technical_specs: Json | null
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          dimensions?: Json | null
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          slug: string
          stage_plot_url?: string | null
          technical_specs?: Json | null
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          dimensions?: Json | null
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          slug?: string
          stage_plot_url?: string | null
          technical_specs?: Json | null
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          created_at: string | null
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          limits: Json | null
          name: string
          position: number | null
          price: number
          slug: string
          stripe_price_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          trial_days: number | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          limits?: Json | null
          name: string
          position?: number | null
          price: number
          slug: string
          stripe_price_id?: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          trial_days?: number | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          limits?: Json | null
          name?: string
          position?: number | null
          price?: number
          slug?: string
          stripe_price_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_days?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          closed_at: string | null
          created_at: string | null
          description: string
          first_response_at: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          priority: Database["public"]["Enums"]["ticket_priority"] | null
          resolved_at: string | null
          satisfaction_comment: string | null
          satisfaction_rating: number | null
          source: string | null
          status: Database["public"]["Enums"]["support_ticket_status"] | null
          subject: string
          tags: string[] | null
          ticket_number: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          closed_at?: string | null
          created_at?: string | null
          description: string
          first_response_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          resolved_at?: string | null
          satisfaction_comment?: string | null
          satisfaction_rating?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["support_ticket_status"] | null
          subject: string
          tags?: string[] | null
          ticket_number: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          closed_at?: string | null
          created_at?: string | null
          description?: string
          first_response_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          resolved_at?: string | null
          satisfaction_comment?: string | null
          satisfaction_rating?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["support_ticket_status"] | null
          subject?: string
          tags?: string[] | null
          ticket_number?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_announcements: {
        Row: {
          action_text: string | null
          action_url: string | null
          announcement_type: string | null
          content: string
          created_at: string | null
          created_by: string | null
          ends_at: string | null
          id: string
          is_dismissible: boolean | null
          severity: string | null
          starts_at: string | null
          target_organizations: string[] | null
          target_tiers:
            | Database["public"]["Enums"]["subscription_tier"][]
            | null
          title: string
          updated_at: string | null
        }
        Insert: {
          action_text?: string | null
          action_url?: string | null
          announcement_type?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_dismissible?: boolean | null
          severity?: string | null
          starts_at?: string | null
          target_organizations?: string[] | null
          target_tiers?:
            | Database["public"]["Enums"]["subscription_tier"][]
            | null
          title: string
          updated_at?: string | null
        }
        Update: {
          action_text?: string | null
          action_url?: string | null
          announcement_type?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_dismissible?: boolean | null
          severity?: string | null
          starts_at?: string | null
          target_organizations?: string[] | null
          target_tiers?:
            | Database["public"]["Enums"]["subscription_tier"][]
            | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          entity_types: string[] | null
          id: string
          name: string
          organization_id: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          entity_types?: string[] | null
          id?: string
          name: string
          organization_id: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          entity_types?: string[] | null
          id?: string
          name?: string
          organization_id?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_bookings: {
        Row: {
          balance_due_date: string | null
          balance_paid_date: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          curfew_time: string | null
          deposit_amount: number | null
          deposit_due_date: string | null
          deposit_paid_date: string | null
          event_day_id: string | null
          event_id: string
          fee_amount: number | null
          fee_currency: string | null
          fee_type: Database["public"]["Enums"]["fee_type"] | null
          id: string
          internal_notes: string | null
          load_in_time: string | null
          notes: string | null
          organization_id: string
          performance_date: string
          performance_type:
            | Database["public"]["Enums"]["performance_type"]
            | null
          set_duration_minutes: number | null
          set_time: string | null
          soundcheck_time: string | null
          stage_id: string | null
          status: Database["public"]["Enums"]["talent_booking_status"] | null
          talent_id: string
          updated_at: string | null
        }
        Insert: {
          balance_due_date?: string | null
          balance_paid_date?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          curfew_time?: string | null
          deposit_amount?: number | null
          deposit_due_date?: string | null
          deposit_paid_date?: string | null
          event_day_id?: string | null
          event_id: string
          fee_amount?: number | null
          fee_currency?: string | null
          fee_type?: Database["public"]["Enums"]["fee_type"] | null
          id?: string
          internal_notes?: string | null
          load_in_time?: string | null
          notes?: string | null
          organization_id: string
          performance_date: string
          performance_type?:
            | Database["public"]["Enums"]["performance_type"]
            | null
          set_duration_minutes?: number | null
          set_time?: string | null
          soundcheck_time?: string | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["talent_booking_status"] | null
          talent_id: string
          updated_at?: string | null
        }
        Update: {
          balance_due_date?: string | null
          balance_paid_date?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          curfew_time?: string | null
          deposit_amount?: number | null
          deposit_due_date?: string | null
          deposit_paid_date?: string | null
          event_day_id?: string | null
          event_id?: string
          fee_amount?: number | null
          fee_currency?: string | null
          fee_type?: Database["public"]["Enums"]["fee_type"] | null
          id?: string
          internal_notes?: string | null
          load_in_time?: string | null
          notes?: string | null
          organization_id?: string
          performance_date?: string
          performance_type?:
            | Database["public"]["Enums"]["performance_type"]
            | null
          set_duration_minutes?: number | null
          set_time?: string | null
          soundcheck_time?: string | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["talent_booking_status"] | null
          talent_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "talent_bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_bookings_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_bookings_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_bookings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_bookings_event_day_id_fkey"
            columns: ["event_day_id"]
            isOneToOne: false
            referencedRelation: "event_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_bookings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_bookings_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_bookings_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          created_by: string | null
          currency: string | null
          due_date: string | null
          id: string
          notes: string | null
          organization_id: string
          paid_date: string | null
          payment_method:
            | Database["public"]["Enums"]["talent_payment_method"]
            | null
          payment_type: Database["public"]["Enums"]["talent_payment_type"]
          reference_number: string | null
          status: Database["public"]["Enums"]["talent_payment_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          paid_date?: string | null
          payment_method?:
            | Database["public"]["Enums"]["talent_payment_method"]
            | null
          payment_type: Database["public"]["Enums"]["talent_payment_type"]
          reference_number?: string | null
          status?: Database["public"]["Enums"]["talent_payment_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          paid_date?: string | null
          payment_method?:
            | Database["public"]["Enums"]["talent_payment_method"]
            | null
          payment_type?: Database["public"]["Enums"]["talent_payment_type"]
          reference_number?: string | null
          status?: Database["public"]["Enums"]["talent_payment_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "talent_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "talent_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_profiles: {
        Row: {
          agent_email: string | null
          agent_name: string | null
          agent_phone: string | null
          base_fee: number | null
          bio: string | null
          booking_status: Database["public"]["Enums"]["booking_status"] | null
          created_at: string | null
          created_by: string | null
          email: string | null
          facebook_url: string | null
          fee_currency: string | null
          fee_notes: string | null
          gallery_urls: Json | null
          genres: string[] | null
          hospitality_requirements: string | null
          id: string
          instagram_handle: string | null
          is_active: boolean | null
          is_exclusive: boolean | null
          logo_url: string | null
          manager_email: string | null
          manager_name: string | null
          manager_phone: string | null
          metadata: Json | null
          name: string
          organization_id: string
          phone: string | null
          photo_url: string | null
          press_kit_url: string | null
          short_bio: string | null
          slug: string
          soundcloud_url: string | null
          spotify_url: string | null
          tags: string[] | null
          talent_type: Database["public"]["Enums"]["talent_type"]
          technical_requirements: string | null
          travel_requirements: string | null
          twitter_handle: string | null
          updated_at: string | null
          website: string | null
          youtube_url: string | null
        }
        Insert: {
          agent_email?: string | null
          agent_name?: string | null
          agent_phone?: string | null
          base_fee?: number | null
          bio?: string | null
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          facebook_url?: string | null
          fee_currency?: string | null
          fee_notes?: string | null
          gallery_urls?: Json | null
          genres?: string[] | null
          hospitality_requirements?: string | null
          id?: string
          instagram_handle?: string | null
          is_active?: boolean | null
          is_exclusive?: boolean | null
          logo_url?: string | null
          manager_email?: string | null
          manager_name?: string | null
          manager_phone?: string | null
          metadata?: Json | null
          name: string
          organization_id: string
          phone?: string | null
          photo_url?: string | null
          press_kit_url?: string | null
          short_bio?: string | null
          slug: string
          soundcloud_url?: string | null
          spotify_url?: string | null
          tags?: string[] | null
          talent_type: Database["public"]["Enums"]["talent_type"]
          technical_requirements?: string | null
          travel_requirements?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
          website?: string | null
          youtube_url?: string | null
        }
        Update: {
          agent_email?: string | null
          agent_name?: string | null
          agent_phone?: string | null
          base_fee?: number | null
          bio?: string | null
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          facebook_url?: string | null
          fee_currency?: string | null
          fee_notes?: string | null
          gallery_urls?: Json | null
          genres?: string[] | null
          hospitality_requirements?: string | null
          id?: string
          instagram_handle?: string | null
          is_active?: boolean | null
          is_exclusive?: boolean | null
          logo_url?: string | null
          manager_email?: string | null
          manager_name?: string | null
          manager_phone?: string | null
          metadata?: Json | null
          name?: string
          organization_id?: string
          phone?: string | null
          photo_url?: string | null
          press_kit_url?: string | null
          short_bio?: string | null
          slug?: string
          soundcloud_url?: string | null
          spotify_url?: string | null
          tags?: string[] | null
          talent_type?: Database["public"]["Enums"]["talent_type"]
          technical_requirements?: string | null
          travel_requirements?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
          website?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "talent_profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_attachments: {
        Row: {
          created_at: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          name: string
          task_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          name: string
          task_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          name?: string
          task_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          created_at: string | null
          dependency_type: Database["public"]["Enums"]["dependency_type"] | null
          depends_on_task_id: string
          id: string
          lag_hours: number | null
          task_id: string
        }
        Insert: {
          created_at?: string | null
          dependency_type?:
            | Database["public"]["Enums"]["dependency_type"]
            | null
          depends_on_task_id: string
          id?: string
          lag_hours?: number | null
          task_id: string
        }
        Update: {
          created_at?: string | null
          dependency_type?:
            | Database["public"]["Enums"]["dependency_type"]
            | null
          depends_on_task_id?: string
          id?: string
          lag_hours?: number | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_lists: {
        Row: {
          color: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          organization_id: string
          position: number | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          organization_id: string
          position?: number | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string
          position?: number | null
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_lists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_lists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      task_time_entries: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number
          ended_at: string | null
          id: string
          is_billable: boolean | null
          started_at: string | null
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes: number
          ended_at?: string | null
          id?: string
          is_billable?: boolean | null
          started_at?: string | null
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          is_billable?: boolean | null
          started_at?: string | null
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_watchers: {
        Row: {
          created_at: string | null
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_watchers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_watchers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          custom_id: string | null
          deleted_at: string | null
          depth: number | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          logged_hours: number | null
          organization_id: string
          parent_id: string | null
          position: number | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          project_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          tags: string[] | null
          task_list_id: string | null
          task_type: Database["public"]["Enums"]["task_type"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_id?: string | null
          deleted_at?: string | null
          depth?: number | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          logged_hours?: number | null
          organization_id: string
          parent_id?: string | null
          position?: number | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          project_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          task_list_id?: string | null
          task_type?: Database["public"]["Enums"]["task_type"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_id?: string | null
          deleted_at?: string | null
          depth?: number | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          logged_hours?: number | null
          organization_id?: string
          parent_id?: string | null
          position?: number | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          project_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          task_list_id?: string | null
          task_type?: Database["public"]["Enums"]["task_type"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_task_list_id_fkey"
            columns: ["task_list_id"]
            isOneToOne: false
            referencedRelation: "task_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          author_company: string | null
          author_image_url: string | null
          author_name: string
          author_title: string | null
          content: string
          created_at: string | null
          event_id: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          organization_id: string
          position: number | null
          published_at: string | null
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          author_company?: string | null
          author_image_url?: string | null
          author_name: string
          author_title?: string | null
          content: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          organization_id: string
          position?: number | null
          published_at?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          author_company?: string | null
          author_image_url?: string | null
          author_name?: string
          author_title?: string | null
          content?: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          organization_id?: string
          position?: number | null
          published_at?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          sender_id: string
          thread_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          sender_id: string
          thread_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_participants: {
        Row: {
          id: string
          is_muted: boolean | null
          joined_at: string | null
          last_read_at: string | null
          role: string | null
          thread_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          thread_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_participants_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_comments: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          id: string
          is_from_customer: boolean | null
          is_internal: boolean | null
          ticket_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          id?: string
          is_from_customer?: boolean | null
          is_internal?: boolean | null
          ticket_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          is_from_customer?: boolean | null
          is_internal?: boolean | null
          ticket_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_orders: {
        Row: {
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_name: string | null
          customer_phone: string | null
          discount: number | null
          event_id: string
          fees: number | null
          id: string
          metadata: Json | null
          notes: string | null
          order_number: string
          organization_id: string
          paid_at: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_reference: string | null
          refund_amount: number | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["ticket_order_status"] | null
          subtotal: number
          tax: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_name?: string | null
          customer_phone?: string | null
          discount?: number | null
          event_id: string
          fees?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number: string
          organization_id: string
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_reference?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["ticket_order_status"] | null
          subtotal: number
          tax?: number | null
          total: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_name?: string | null
          customer_phone?: string | null
          discount?: number | null
          event_id?: string
          fees?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number?: string
          organization_id?: string
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_reference?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["ticket_order_status"] | null
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_types: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          event_id: string
          id: string
          includes: string[] | null
          is_active: boolean | null
          max_per_order: number | null
          name: string
          organization_id: string
          price: number
          quantity_available: number | null
          quantity_sold: number | null
          restrictions: string | null
          sale_end: string | null
          sale_start: string | null
          tier: Database["public"]["Enums"]["ticket_tier"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          event_id: string
          id?: string
          includes?: string[] | null
          is_active?: boolean | null
          max_per_order?: number | null
          name: string
          organization_id: string
          price: number
          quantity_available?: number | null
          quantity_sold?: number | null
          restrictions?: string | null
          sale_end?: string | null
          sale_start?: string | null
          tier?: Database["public"]["Enums"]["ticket_tier"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          event_id?: string
          id?: string
          includes?: string[] | null
          is_active?: boolean | null
          max_per_order?: number | null
          name?: string
          organization_id?: string
          price?: number
          quantity_available?: number | null
          quantity_sold?: number | null
          restrictions?: string | null
          sale_end?: string | null
          sale_start?: string | null
          tier?: Database["public"]["Enums"]["ticket_tier"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          barcode: string | null
          cancelled_at: string | null
          checked_in_at: string | null
          checked_in_by: string | null
          created_at: string | null
          event_day_id: string | null
          event_id: string
          holder_email: string | null
          holder_name: string | null
          id: string
          notes: string | null
          order_id: string | null
          organization_id: string
          qr_code: string | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["ticket_status"] | null
          ticket_number: string
          ticket_type_id: string
          transferred_at: string | null
          transferred_from: string | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          cancelled_at?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string | null
          event_day_id?: string | null
          event_id: string
          holder_email?: string | null
          holder_name?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          organization_id: string
          qr_code?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          ticket_number: string
          ticket_type_id: string
          transferred_at?: string | null
          transferred_from?: string | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          cancelled_at?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string | null
          event_day_id?: string | null
          event_id?: string
          holder_email?: string | null
          holder_name?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          organization_id?: string
          qr_code?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          ticket_number?: string
          ticket_type_id?: string
          transferred_at?: string | null
          transferred_from?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_event_day_id_fkey"
            columns: ["event_day_id"]
            isOneToOne: false
            referencedRelation: "event_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ticket_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_transferred_from_fkey"
            columns: ["transferred_from"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheet_entries: {
        Row: {
          break_minutes: number | null
          created_at: string | null
          date: string
          description: string | null
          double_time_hours: number | null
          end_time: string
          event_id: string | null
          id: string
          is_billable: boolean | null
          overtime_hours: number | null
          project_id: string | null
          rate_amount: number | null
          rate_type: Database["public"]["Enums"]["rate_type"] | null
          regular_hours: number | null
          shift_id: string | null
          start_time: string
          task_id: string | null
          timesheet_id: string
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          break_minutes?: number | null
          created_at?: string | null
          date: string
          description?: string | null
          double_time_hours?: number | null
          end_time: string
          event_id?: string | null
          id?: string
          is_billable?: boolean | null
          overtime_hours?: number | null
          project_id?: string | null
          rate_amount?: number | null
          rate_type?: Database["public"]["Enums"]["rate_type"] | null
          regular_hours?: number | null
          shift_id?: string | null
          start_time: string
          task_id?: string | null
          timesheet_id: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          break_minutes?: number | null
          created_at?: string | null
          date?: string
          description?: string | null
          double_time_hours?: number | null
          end_time?: string
          event_id?: string | null
          id?: string
          is_billable?: boolean | null
          overtime_hours?: number | null
          project_id?: string | null
          rate_amount?: number | null
          rate_type?: Database["public"]["Enums"]["rate_type"] | null
          regular_hours?: number | null
          shift_id?: string | null
          start_time?: string
          task_id?: string | null
          timesheet_id?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timesheet_entries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_entries_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_entries_timesheet_id_fkey"
            columns: ["timesheet_id"]
            isOneToOne: false
            referencedRelation: "timesheets"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          currency: string | null
          id: string
          notes: string | null
          organization_id: string
          paid_at: string | null
          period_end: string
          period_start: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["timesheet_status"] | null
          submitted_at: string | null
          total_amount: number | null
          total_double_time_hours: number | null
          total_overtime_hours: number | null
          total_regular_hours: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          paid_at?: string | null
          period_end: string
          period_start: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["timesheet_status"] | null
          submitted_at?: string | null
          total_amount?: number | null
          total_double_time_hours?: number | null
          total_overtime_hours?: number | null
          total_regular_hours?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          paid_at?: string | null
          period_end?: string
          period_start?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["timesheet_status"] | null
          submitted_at?: string | null
          total_amount?: number | null
          total_double_time_hours?: number | null
          total_overtime_hours?: number | null
          total_regular_hours?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      training_completions: {
        Row: {
          attempts: number | null
          certificate_url: string | null
          completed_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          passed: boolean | null
          score: number | null
          started_at: string | null
          training_material_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          certificate_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          passed?: boolean | null
          score?: number | null
          started_at?: string | null
          training_material_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          certificate_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          passed?: boolean | null
          score?: number | null
          started_at?: string | null
          training_material_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_completions_training_material_id_fkey"
            columns: ["training_material_id"]
            isOneToOne: false
            referencedRelation: "training_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      training_materials: {
        Row: {
          content: string | null
          content_url: string | null
          created_at: string | null
          created_by: string | null
          departments: string[] | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          material_type: string
          name: string
          organization_id: string
          passing_score: number | null
          positions: string[] | null
          slug: string
          updated_at: string | null
          validity_months: number | null
        }
        Insert: {
          content?: string | null
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          departments?: string[] | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          material_type: string
          name: string
          organization_id: string
          passing_score?: number | null
          positions?: string[] | null
          slug: string
          updated_at?: string | null
          validity_months?: number | null
        }
        Update: {
          content?: string | null
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          departments?: string[] | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          material_type?: string
          name?: string
          organization_id?: string
          passing_score?: number | null
          positions?: string[] | null
          slug?: string
          updated_at?: string | null
          validity_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "training_materials_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_materials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      transportation: {
        Row: {
          arrival_date: string | null
          arrival_location: string
          arrival_time: string | null
          booking_id: string | null
          carrier: string | null
          confirmation_number: string | null
          cost: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          departure_date: string
          departure_location: string
          departure_time: string | null
          driver_name: string | null
          driver_phone: string | null
          event_id: string
          flight_number: string | null
          id: string
          notes: string | null
          organization_id: string
          passenger_count: number | null
          passenger_names: string[] | null
          special_requests: string | null
          status: Database["public"]["Enums"]["transport_status"] | null
          transport_type: Database["public"]["Enums"]["transport_type"]
          updated_at: string | null
          vehicle_type: string | null
        }
        Insert: {
          arrival_date?: string | null
          arrival_location: string
          arrival_time?: string | null
          booking_id?: string | null
          carrier?: string | null
          confirmation_number?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          departure_date: string
          departure_location: string
          departure_time?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          event_id: string
          flight_number?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          passenger_count?: number | null
          passenger_names?: string[] | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["transport_status"] | null
          transport_type: Database["public"]["Enums"]["transport_type"]
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Update: {
          arrival_date?: string | null
          arrival_location?: string
          arrival_time?: string | null
          booking_id?: string | null
          carrier?: string | null
          confirmation_number?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          departure_date?: string
          departure_location?: string
          departure_time?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          event_id?: string
          flight_number?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          passenger_count?: number | null
          passenger_names?: string[] | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["transport_status"] | null
          transport_type?: Database["public"]["Enums"]["transport_type"]
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transportation_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "talent_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transportation_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transportation_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transportation_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_limits: {
        Row: {
          alert_threshold_percent: number | null
          created_at: string | null
          current_value: number | null
          id: string
          last_alert_at: string | null
          limit_value: number
          metric_type: Database["public"]["Enums"]["usage_metric_type"]
          organization_id: string
          overage_allowed: boolean | null
          overage_rate: number | null
          reset_at: string | null
          updated_at: string | null
        }
        Insert: {
          alert_threshold_percent?: number | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          last_alert_at?: string | null
          limit_value: number
          metric_type: Database["public"]["Enums"]["usage_metric_type"]
          organization_id: string
          overage_allowed?: boolean | null
          overage_rate?: number | null
          reset_at?: string | null
          updated_at?: string | null
        }
        Update: {
          alert_threshold_percent?: number | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          last_alert_at?: string | null
          limit_value?: number
          metric_type?: Database["public"]["Enums"]["usage_metric_type"]
          organization_id?: string
          overage_allowed?: boolean | null
          overage_rate?: number | null
          reset_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_limits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_records: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_type: Database["public"]["Enums"]["usage_metric_type"]
          organization_id: string
          period_end: string
          period_start: string
          quantity: number
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type: Database["public"]["Enums"]["usage_metric_type"]
          organization_id: string
          period_end: string
          period_start: string
          quantity: number
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: Database["public"]["Enums"]["usage_metric_type"]
          organization_id?: string
          period_end?: string
          period_start?: string
          quantity?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          organization_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_availability: {
        Row: {
          availability_type: Database["public"]["Enums"]["availability_type"]
          created_at: string | null
          date: string
          end_time: string | null
          id: string
          notes: string | null
          organization_id: string
          start_time: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability_type: Database["public"]["Enums"]["availability_type"]
          created_at?: string | null
          date: string
          end_time?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          start_time?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability_type?: Database["public"]["Enums"]["availability_type"]
          created_at?: string | null
          date?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          start_time?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_availability_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_availability_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bookmarks: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_certifications: {
        Row: {
          certification_number: string | null
          certification_type_id: string
          created_at: string | null
          document_url: string | null
          expiry_date: string | null
          id: string
          issued_date: string
          issuing_authority: string | null
          notes: string | null
          organization_id: string
          status: Database["public"]["Enums"]["certification_status"] | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          certification_number?: string | null
          certification_type_id: string
          created_at?: string | null
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issued_date: string
          issuing_authority?: string | null
          notes?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["certification_status"] | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          certification_number?: string | null
          certification_type_id?: string
          created_at?: string | null
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issued_date?: string
          issuing_authority?: string | null
          notes?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["certification_status"] | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_certifications_certification_type_id_fkey"
            columns: ["certification_type_id"]
            isOneToOne: false
            referencedRelation: "certification_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_certifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_certifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_certifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_dashboards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_shared: boolean | null
          layout: Json | null
          name: string
          organization_id: string
          slug: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          layout?: Json | null
          name: string
          organization_id: string
          slug: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          layout?: Json | null
          name?: string
          organization_id?: string
          slug?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_dashboards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_dashboards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          data: Json | null
          id: string
          organization_id: string | null
          skipped_at: string | null
          started_at: string | null
          status: string | null
          step_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          organization_id?: string | null
          skipped_at?: string | null
          started_at?: string | null
          status?: string | null
          step_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          organization_id?: string | null
          skipped_at?: string | null
          started_at?: string | null
          status?: string | null
          step_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_onboarding_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_onboarding_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "onboarding_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_onboarding_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding_state: {
        Row: {
          account_type_slug: string
          completed_at: string | null
          created_at: string | null
          current_step_slug: string | null
          dismissed_at: string | null
          id: string
          is_completed: boolean | null
          metadata: Json | null
          organization_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_type_slug: string
          completed_at?: string | null
          created_at?: string | null
          current_step_slug?: string | null
          dismissed_at?: string | null
          id?: string
          is_completed?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_type_slug?: string
          completed_at?: string | null
          created_at?: string | null
          current_step_slug?: string | null
          dismissed_at?: string | null
          id?: string
          is_completed?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_onboarding_state_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_onboarding_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          accessibility: Json | null
          created_at: string | null
          date_format: string | null
          default_view: string | null
          email_preferences: Json | null
          first_day_of_week: number | null
          id: string
          language: string | null
          notifications: Json | null
          sidebar_collapsed: boolean | null
          theme: string | null
          time_format: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accessibility?: Json | null
          created_at?: string | null
          date_format?: string | null
          default_view?: string | null
          email_preferences?: Json | null
          first_day_of_week?: number | null
          id?: string
          language?: string | null
          notifications?: Json | null
          sidebar_collapsed?: boolean | null
          theme?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accessibility?: Json | null
          created_at?: string | null
          date_format?: string | null
          default_view?: string | null
          email_preferences?: Json | null
          first_day_of_week?: number | null
          id?: string
          language?: string | null
          notifications?: Json | null
          sidebar_collapsed?: boolean | null
          theme?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          bio: string | null
          certifications: Json | null
          cover_image_url: string | null
          created_at: string | null
          education: Json | null
          experience: Json | null
          github_url: string | null
          headline: string | null
          id: string
          interests: string[] | null
          is_available_for_hire: boolean | null
          is_public: boolean | null
          linkedin_url: string | null
          location: string | null
          portfolio_url: string | null
          preferred_contact_method: string | null
          skills: string[] | null
          twitter_handle: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          certifications?: Json | null
          cover_image_url?: string | null
          created_at?: string | null
          education?: Json | null
          experience?: Json | null
          github_url?: string | null
          headline?: string | null
          id?: string
          interests?: string[] | null
          is_available_for_hire?: boolean | null
          is_public?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          preferred_contact_method?: string | null
          skills?: string[] | null
          twitter_handle?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          certifications?: Json | null
          cover_image_url?: string | null
          created_at?: string | null
          education?: Json | null
          experience?: Json | null
          github_url?: string | null
          headline?: string | null
          id?: string
          interests?: string[] | null
          is_available_for_hire?: boolean | null
          is_public?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          preferred_contact_method?: string | null
          skills?: string[] | null
          twitter_handle?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: unknown
          is_current: boolean | null
          last_active_at: string | null
          location: Json | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: unknown
          is_current?: boolean | null
          last_active_at?: string | null
          location?: Json | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_current?: boolean | null
          last_active_at?: string | null
          location?: Json | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skills: {
        Row: {
          created_at: string | null
          id: string
          is_verified: boolean | null
          notes: string | null
          proficiency_level: number | null
          skill_id: string
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
          years_experience: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          notes?: string | null
          proficiency_level?: number | null
          skill_id: string
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
          years_experience?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          notes?: string | null
          proficiency_level?: number | null
          skill_id?: string
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skills_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_type: string | null
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          email: string
          email_verified_at: string | null
          full_name: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          locale: string | null
          onboarding_completed_at: string | null
          phone: string | null
          profile_completed_at: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          account_type?: string | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          email_verified_at?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          locale?: string | null
          onboarding_completed_at?: string | null
          phone?: string | null
          profile_completed_at?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          account_type?: string | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          email_verified_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          locale?: string | null
          onboarding_completed_at?: string | null
          phone?: string | null
          profile_completed_at?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vendor_contacts: {
        Row: {
          company_id: string
          contact_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          role: string | null
        }
        Insert: {
          company_id: string
          contact_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          role?: string | null
        }
        Update: {
          company_id?: string
          contact_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_availability: {
        Row: {
          created_at: string | null
          date: string
          event_id: string | null
          held_by: string | null
          hold_until: string | null
          id: string
          is_available: boolean | null
          notes: string | null
          space_id: string | null
          updated_at: string | null
          venue_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          event_id?: string | null
          held_by?: string | null
          hold_until?: string | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          space_id?: string | null
          updated_at?: string | null
          venue_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          event_id?: string | null
          held_by?: string | null
          hold_until?: string | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          space_id?: string | null
          updated_at?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_availability_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_availability_held_by_fkey"
            columns: ["held_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_availability_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "venue_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_availability_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_spaces: {
        Row: {
          amenities: string[] | null
          capacity_banquet: number | null
          capacity_seated: number | null
          capacity_standing: number | null
          capacity_theater: number | null
          created_at: string | null
          currency: string | null
          daily_rate: number | null
          description: string | null
          dimensions: Json | null
          floor_plan_url: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          space_type: string | null
          technical_specs: Json | null
          updated_at: string | null
          venue_id: string
        }
        Insert: {
          amenities?: string[] | null
          capacity_banquet?: number | null
          capacity_seated?: number | null
          capacity_standing?: number | null
          capacity_theater?: number | null
          created_at?: string | null
          currency?: string | null
          daily_rate?: number | null
          description?: string | null
          dimensions?: Json | null
          floor_plan_url?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          space_type?: string | null
          technical_specs?: Json | null
          updated_at?: string | null
          venue_id: string
        }
        Update: {
          amenities?: string[] | null
          capacity_banquet?: number | null
          capacity_seated?: number | null
          capacity_standing?: number | null
          capacity_theater?: number | null
          created_at?: string | null
          currency?: string | null
          daily_rate?: number | null
          description?: string | null
          dimensions?: Json | null
          floor_plan_url?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          space_type?: string | null
          technical_specs?: Json | null
          updated_at?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_spaces_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          amenities: string[] | null
          capacity: number | null
          city: string | null
          contact_name: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          email: string | null
          gallery_urls: Json | null
          house_rules: string | null
          id: string
          is_active: boolean | null
          is_partner: boolean | null
          latitude: number | null
          load_in_info: string | null
          logo_url: string | null
          longitude: number | null
          metadata: Json | null
          name: string
          organization_id: string
          parking_info: string | null
          phone: string | null
          postal_code: string | null
          slug: string
          state: string | null
          technical_specs: Json | null
          timezone: string | null
          updated_at: string | null
          venue_type: Database["public"]["Enums"]["venue_type"]
          website: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          capacity?: number | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email?: string | null
          gallery_urls?: Json | null
          house_rules?: string | null
          id?: string
          is_active?: boolean | null
          is_partner?: boolean | null
          latitude?: number | null
          load_in_info?: string | null
          logo_url?: string | null
          longitude?: number | null
          metadata?: Json | null
          name: string
          organization_id: string
          parking_info?: string | null
          phone?: string | null
          postal_code?: string | null
          slug: string
          state?: string | null
          technical_specs?: Json | null
          timezone?: string | null
          updated_at?: string | null
          venue_type: Database["public"]["Enums"]["venue_type"]
          website?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          capacity?: number | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email?: string | null
          gallery_urls?: Json | null
          house_rules?: string | null
          id?: string
          is_active?: boolean | null
          is_partner?: boolean | null
          latitude?: number | null
          load_in_info?: string | null
          logo_url?: string | null
          longitude?: number | null
          metadata?: Json | null
          name?: string
          organization_id?: string
          parking_info?: string | null
          phone?: string | null
          postal_code?: string | null
          slug?: string
          state?: string | null
          technical_specs?: Json | null
          timezone?: string | null
          updated_at?: string | null
          venue_type?: Database["public"]["Enums"]["venue_type"]
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venues_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          attempt_number: number | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          event_type: string
          id: string
          next_retry_at: string | null
          payload: Json
          request_headers: Json | null
          response_body: string | null
          response_headers: Json | null
          response_status: number | null
          status: string | null
          webhook_id: string
        }
        Insert: {
          attempt_number?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          event_type: string
          id?: string
          next_retry_at?: string | null
          payload: Json
          request_headers?: Json | null
          response_body?: string | null
          response_headers?: Json | null
          response_status?: number | null
          status?: string | null
          webhook_id: string
        }
        Update: {
          attempt_number?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          event_type?: string
          id?: string
          next_retry_at?: string | null
          payload?: Json
          request_headers?: Json | null
          response_body?: string | null
          response_headers?: Json | null
          response_status?: number | null
          status?: string | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string | null
          created_by: string | null
          events: string[]
          failure_count: number | null
          headers: Json | null
          id: string
          last_failure_at: string | null
          last_success_at: string | null
          last_triggered_at: string | null
          name: string
          organization_id: string
          retry_count: number | null
          secret: string | null
          status: Database["public"]["Enums"]["webhook_status"] | null
          timeout_seconds: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          events: string[]
          failure_count?: number | null
          headers?: Json | null
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          name: string
          organization_id: string
          retry_count?: number | null
          secret?: string | null
          status?: Database["public"]["Enums"]["webhook_status"] | null
          timeout_seconds?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          events?: string[]
          failure_count?: number | null
          headers?: Json | null
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          name?: string
          organization_id?: string
          retry_count?: number | null
          secret?: string | null
          status?: Database["public"]["Enums"]["webhook_status"] | null
          timeout_seconds?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          completed_at: string | null
          context: Json | null
          created_at: string | null
          current_step_id: string | null
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          organization_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["workflow_run_status"] | null
          trigger_data: Json | null
          triggered_by: string | null
          updated_at: string | null
          workflow_template_id: string
        }
        Insert: {
          completed_at?: string | null
          context?: Json | null
          created_at?: string | null
          current_step_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          organization_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["workflow_run_status"] | null
          trigger_data?: Json | null
          triggered_by?: string | null
          updated_at?: string | null
          workflow_template_id: string
        }
        Update: {
          completed_at?: string | null
          context?: Json | null
          created_at?: string | null
          current_step_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          organization_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["workflow_run_status"] | null
          trigger_data?: Json | null
          triggered_by?: string | null
          updated_at?: string | null
          workflow_template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_current_step_id_fkey"
            columns: ["current_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_workflow_template_id_fkey"
            columns: ["workflow_template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_step_executions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          retry_count: number | null
          started_at: string | null
          status: string | null
          workflow_run_id: string
          workflow_step_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
          workflow_run_id: string
          workflow_step_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
          workflow_run_id?: string
          workflow_step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_step_executions_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_step_executions_workflow_step_id_fkey"
            columns: ["workflow_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          conditions: Json | null
          config: Json | null
          created_at: string | null
          id: string
          name: string
          on_failure_step_id: string | null
          on_success_step_id: string | null
          position: number
          retry_count: number | null
          step_type: string
          timeout_seconds: number | null
          updated_at: string | null
          workflow_template_id: string
        }
        Insert: {
          conditions?: Json | null
          config?: Json | null
          created_at?: string | null
          id?: string
          name: string
          on_failure_step_id?: string | null
          on_success_step_id?: string | null
          position: number
          retry_count?: number | null
          step_type: string
          timeout_seconds?: number | null
          updated_at?: string | null
          workflow_template_id: string
        }
        Update: {
          conditions?: Json | null
          config?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          on_failure_step_id?: string | null
          on_success_step_id?: string | null
          position?: number
          retry_count?: number | null
          step_type?: string
          timeout_seconds?: number | null
          updated_at?: string | null
          workflow_template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_on_failure_step_id_fkey"
            columns: ["on_failure_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_steps_on_success_step_id_fkey"
            columns: ["on_success_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_steps_workflow_template_id_fkey"
            columns: ["workflow_template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          entity_type: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          organization_id: string | null
          slug: string
          trigger_config: Json | null
          trigger_type: Database["public"]["Enums"]["workflow_trigger_type"]
          updated_at: string | null
          version: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_type?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          organization_id?: string | null
          slug: string
          trigger_config?: Json | null
          trigger_type: Database["public"]["Enums"]["workflow_trigger_type"]
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_type?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          organization_id?: string | null
          slug?: string
          trigger_config?: Json | null
          trigger_type?: Database["public"]["Enums"]["workflow_trigger_type"]
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          color: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_default: boolean | null
          name: string
          organization_id: string
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          organization_id: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization_ids: { Args: never; Returns: string[] }
      get_user_role_level: { Args: { org_id: string }; Returns: number }
      has_permission: {
        Args: { org_id: string; permission_key: string }
        Returns: boolean
      }
      is_organization_member: { Args: { org_id: string }; Returns: boolean }
      is_organization_owner: { Args: { org_id: string }; Returns: boolean }
      is_project_member: { Args: { proj_id: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      accommodation_status:
        | "booked"
        | "confirmed"
        | "checked_in"
        | "checked_out"
        | "cancelled"
      activity_type:
        | "call"
        | "email"
        | "meeting"
        | "note"
        | "task"
        | "demo"
        | "proposal"
      alert_severity: "critical" | "warning" | "info"
      api_key_status: "active" | "revoked" | "expired"
      approval_request_status:
        | "pending"
        | "approved"
        | "rejected"
        | "escalated"
        | "cancelled"
      approval_status:
        | "pending"
        | "approved"
        | "rejected"
        | "revision_requested"
      approval_workflow_type:
        | "single_approver"
        | "any_of_list"
        | "all_of_list"
        | "sequential_chain"
        | "parallel_chain"
        | "manager_hierarchy"
        | "role_based"
      article_status: "draft" | "published" | "archived"
      asset_condition: "excellent" | "good" | "fair" | "poor" | "broken"
      asset_status:
        | "available"
        | "in_use"
        | "maintenance"
        | "reserved"
        | "retired"
        | "lost"
        | "damaged"
      assignment_status:
        | "invited"
        | "confirmed"
        | "declined"
        | "checked_in"
        | "checked_out"
        | "no_show"
      audit_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      availability_type: "available" | "unavailable" | "tentative" | "preferred"
      billing_cycle: "monthly" | "quarterly" | "annual"
      booking_status: "available" | "limited" | "unavailable"
      brand_guideline_status: "draft" | "active" | "archived"
      budget_category_type: "income" | "expense" | "capital"
      budget_period_type:
        | "annual"
        | "quarterly"
        | "monthly"
        | "project"
        | "event"
      budget_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "active"
        | "closed"
      campaign_status:
        | "planning"
        | "active"
        | "paused"
        | "completed"
        | "cancelled"
      campaign_type:
        | "launch"
        | "awareness"
        | "engagement"
        | "conversion"
        | "retention"
        | "event"
        | "seasonal"
      catering_order_type:
        | "greenroom"
        | "crew_meal"
        | "vip"
        | "hospitality"
        | "concession"
      catering_status: "pending" | "confirmed" | "delivered" | "cancelled"
      certification_status: "pending" | "active" | "expired" | "revoked"
      challenge_status:
        | "draft"
        | "active"
        | "voting"
        | "completed"
        | "cancelled"
      check_action_type:
        | "check_out"
        | "check_in"
        | "transfer"
        | "reserve"
        | "release"
      checklist_status: "not_started" | "in_progress" | "completed"
      community_member_type:
        | "fan"
        | "artist"
        | "creator"
        | "influencer"
        | "brand"
      company_type: "prospect" | "client" | "partner" | "vendor" | "competitor"
      connection_status: "pending" | "accepted" | "declined" | "blocked"
      contract_status:
        | "draft"
        | "pending_review"
        | "pending_signature"
        | "active"
        | "expired"
        | "terminated"
        | "renewed"
      contract_type:
        | "vendor"
        | "client"
        | "employment"
        | "nda"
        | "service"
        | "licensing"
        | "rental"
        | "sponsorship"
      counterparty_type: "company" | "contact" | "vendor" | "user"
      crew_call_status:
        | "draft"
        | "published"
        | "confirmed"
        | "active"
        | "completed"
        | "cancelled"
      cue_department:
        | "lighting"
        | "audio"
        | "video"
        | "pyro"
        | "sfx"
        | "rigging"
        | "staging"
      cue_type: "go" | "standby" | "warning" | "hold" | "cut"
      deal_type: "new_business" | "expansion" | "renewal" | "other"
      dependency_type:
        | "finish_to_start"
        | "start_to_start"
        | "finish_to_finish"
        | "start_to_finish"
      depreciation_method: "straight_line" | "declining_balance" | "none"
      discussion_status: "open" | "closed" | "archived"
      document_status: "draft" | "published" | "archived"
      document_type: "document" | "template" | "wiki" | "note"
      email_status: "draft" | "scheduled" | "sending" | "sent" | "failed"
      email_template_type:
        | "transactional"
        | "marketing"
        | "notification"
        | "system"
      event_phase:
        | "concept"
        | "planning"
        | "pre_production"
        | "setup"
        | "active"
        | "live"
        | "teardown"
        | "post_mortem"
        | "archived"
      event_type:
        | "festival"
        | "conference"
        | "concert"
        | "activation"
        | "corporate"
        | "wedding"
        | "private"
        | "tour"
        | "production"
      expense_status:
        | "draft"
        | "submitted"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "reimbursed"
      fee_type:
        | "flat"
        | "guarantee"
        | "vs_percentage"
        | "guarantee_plus_percentage"
      finding_severity: "critical" | "major" | "minor" | "observation"
      forecast_period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
      forecast_type: "revenue" | "cost" | "resource" | "capacity"
      form_field_type:
        | "text"
        | "textarea"
        | "number"
        | "email"
        | "phone"
        | "date"
        | "time"
        | "datetime"
        | "select"
        | "multiselect"
        | "checkbox"
        | "radio"
        | "file"
        | "signature"
        | "rating"
        | "hidden"
      form_status: "draft" | "active" | "closed" | "archived"
      guest_entry_status: "pending" | "confirmed" | "checked_in" | "no_show"
      guest_list_status: "draft" | "active" | "closed"
      guest_list_type: "vip" | "artist" | "media" | "sponsor" | "staff" | "comp"
      hospitality_request_type:
        | "accommodation"
        | "transportation"
        | "catering"
        | "greenroom"
        | "security"
        | "other"
      hospitality_status: "pending" | "approved" | "fulfilled" | "cancelled"
      import_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
      insight_type: "trend" | "anomaly" | "prediction" | "recommendation"
      inventory_transaction_type:
        | "receipt"
        | "issue"
        | "adjustment"
        | "transfer"
        | "return"
        | "waste"
      invoice_direction: "receivable" | "payable"
      invoice_status:
        | "draft"
        | "sent"
        | "viewed"
        | "partially_paid"
        | "paid"
        | "overdue"
        | "cancelled"
        | "disputed"
      invoice_type: "standard" | "credit" | "proforma" | "recurring"
      location_type:
        | "warehouse"
        | "venue"
        | "vehicle"
        | "office"
        | "external"
        | "virtual"
      maintenance_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
      maintenance_type:
        | "preventive"
        | "corrective"
        | "inspection"
        | "calibration"
      marketplace_listing_status:
        | "draft"
        | "active"
        | "sold"
        | "expired"
        | "cancelled"
      material_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "published"
        | "archived"
      material_type:
        | "flyer"
        | "poster"
        | "banner"
        | "social_post"
        | "email"
        | "video"
        | "brochure"
        | "presentation"
        | "press_release"
      media_status: "processing" | "active" | "archived"
      member_status: "active" | "invited" | "suspended" | "deactivated"
      message_status: "sent" | "delivered" | "read"
      opportunity_status:
        | "open"
        | "in_progress"
        | "filled"
        | "closed"
        | "cancelled"
      payment_method:
        | "bank_transfer"
        | "credit_card"
        | "check"
        | "cash"
        | "paypal"
        | "stripe"
        | "other"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
      performance_type:
        | "headliner"
        | "support"
        | "opener"
        | "special_guest"
        | "resident"
      po_status:
        | "draft"
        | "sent"
        | "acknowledged"
        | "partially_received"
        | "received"
        | "invoiced"
        | "paid"
        | "cancelled"
      policy_status: "draft" | "active" | "archived" | "superseded"
      post_type: "text" | "image" | "video" | "poll" | "event" | "article"
      post_visibility: "public" | "followers" | "private"
      priority_level: "critical" | "high" | "medium" | "low"
      program_status:
        | "draft"
        | "planning"
        | "active"
        | "on_hold"
        | "completed"
        | "cancelled"
        | "archived"
      project_status:
        | "draft"
        | "planning"
        | "active"
        | "on_hold"
        | "completed"
        | "cancelled"
        | "archived"
      proposal_status:
        | "draft"
        | "sent"
        | "viewed"
        | "accepted"
        | "rejected"
        | "expired"
      rate_type: "hourly" | "daily" | "flat"
      renewal_type: "none" | "auto" | "manual"
      report_format: "pdf" | "excel" | "csv" | "json" | "html"
      report_status:
        | "draft"
        | "scheduled"
        | "generating"
        | "completed"
        | "failed"
      requisition_priority: "urgent" | "high" | "normal" | "low"
      requisition_status:
        | "draft"
        | "submitted"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "ordered"
        | "received"
        | "cancelled"
      rider_item_category:
        | "audio"
        | "lighting"
        | "video"
        | "backline"
        | "staging"
        | "hospitality"
        | "catering"
        | "accommodation"
        | "transportation"
        | "security"
        | "other"
      rider_item_provider: "artist" | "venue" | "promoter"
      rider_item_status:
        | "pending"
        | "confirmed"
        | "substituted"
        | "not_available"
      rider_status: "draft" | "submitted" | "approved" | "signed"
      rider_type: "technical" | "hospitality" | "combined"
      risk_level: "critical" | "high" | "medium" | "low" | "negligible"
      risk_status:
        | "identified"
        | "assessed"
        | "mitigating"
        | "accepted"
        | "closed"
      runsheet_item_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "skipped"
        | "delayed"
      runsheet_item_type:
        | "performance"
        | "transition"
        | "break"
        | "announcement"
        | "technical"
        | "ceremony"
        | "speech"
        | "other"
      runsheet_status: "draft" | "approved" | "active" | "locked"
      scan_method: "qr" | "barcode" | "rfid" | "nfc" | "manual"
      scenario_type: "baseline" | "optimistic" | "pessimistic" | "custom"
      schedule_status: "draft" | "published" | "locked"
      setlist_status: "draft" | "submitted" | "approved" | "performed"
      shift_status:
        | "scheduled"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      show_call_status: "draft" | "published" | "active" | "completed"
      sms_status:
        | "draft"
        | "scheduled"
        | "sending"
        | "sent"
        | "delivered"
        | "failed"
      social_platform:
        | "instagram"
        | "facebook"
        | "twitter"
        | "linkedin"
        | "tiktok"
        | "youtube"
        | "pinterest"
        | "threads"
      social_post_status:
        | "draft"
        | "scheduled"
        | "published"
        | "failed"
        | "deleted"
      subscription_status: "active" | "past_due" | "cancelled" | "trialing"
      subscription_tier: "core" | "pro" | "enterprise"
      support_ticket_status:
        | "new"
        | "open"
        | "pending"
        | "on_hold"
        | "solved"
        | "closed"
      talent_booking_status:
        | "inquiry"
        | "negotiating"
        | "confirmed"
        | "contracted"
        | "cancelled"
        | "completed"
      talent_payment_method: "wire" | "check" | "paypal" | "cash" | "crypto"
      talent_payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
      talent_payment_type: "deposit" | "balance" | "bonus" | "reimbursement"
      talent_type:
        | "dj"
        | "band"
        | "solo_artist"
        | "speaker"
        | "mc"
        | "performer"
        | "comedian"
        | "other"
      task_priority: "urgent" | "high" | "medium" | "low" | "none"
      task_status:
        | "backlog"
        | "todo"
        | "in_progress"
        | "in_review"
        | "blocked"
        | "done"
        | "cancelled"
      task_type: "task" | "bug" | "feature" | "epic" | "story" | "milestone"
      ticket_order_status:
        | "pending"
        | "completed"
        | "cancelled"
        | "refunded"
        | "partially_refunded"
      ticket_priority: "low" | "normal" | "high" | "urgent"
      ticket_status:
        | "reserved"
        | "purchased"
        | "checked_in"
        | "cancelled"
        | "refunded"
        | "transferred"
      ticket_tier:
        | "general"
        | "vip"
        | "premium"
        | "backstage"
        | "artist"
        | "media"
        | "staff"
        | "comp"
      timesheet_status: "draft" | "submitted" | "approved" | "rejected" | "paid"
      transport_status:
        | "booked"
        | "confirmed"
        | "in_transit"
        | "completed"
        | "cancelled"
      transport_type:
        | "flight"
        | "ground"
        | "shuttle"
        | "rideshare"
        | "rental"
        | "private"
      trigger_type: "manual" | "timecode" | "midi" | "osc" | "follow"
      usage_metric_type:
        | "api_calls"
        | "storage"
        | "bandwidth"
        | "users"
        | "projects"
        | "events"
      venue_type: "indoor" | "outdoor" | "hybrid" | "virtual"
      visibility_type: "private" | "team" | "organization" | "public"
      webhook_status: "active" | "paused" | "failed"
      workflow_run_status:
        | "pending"
        | "running"
        | "completed"
        | "failed"
        | "cancelled"
      workflow_trigger_type:
        | "entity_created"
        | "entity_updated"
        | "entity_deleted"
        | "field_changed"
        | "status_changed"
        | "schedule"
        | "webhook"
        | "manual"
        | "api_call"
        | "form_submitted"
        | "approval_decision"
        | "scan_event"
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
      accommodation_status: [
        "booked",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
      ],
      activity_type: [
        "call",
        "email",
        "meeting",
        "note",
        "task",
        "demo",
        "proposal",
      ],
      alert_severity: ["critical", "warning", "info"],
      api_key_status: ["active", "revoked", "expired"],
      approval_request_status: [
        "pending",
        "approved",
        "rejected",
        "escalated",
        "cancelled",
      ],
      approval_status: [
        "pending",
        "approved",
        "rejected",
        "revision_requested",
      ],
      approval_workflow_type: [
        "single_approver",
        "any_of_list",
        "all_of_list",
        "sequential_chain",
        "parallel_chain",
        "manager_hierarchy",
        "role_based",
      ],
      article_status: ["draft", "published", "archived"],
      asset_condition: ["excellent", "good", "fair", "poor", "broken"],
      asset_status: [
        "available",
        "in_use",
        "maintenance",
        "reserved",
        "retired",
        "lost",
        "damaged",
      ],
      assignment_status: [
        "invited",
        "confirmed",
        "declined",
        "checked_in",
        "checked_out",
        "no_show",
      ],
      audit_status: ["scheduled", "in_progress", "completed", "cancelled"],
      availability_type: ["available", "unavailable", "tentative", "preferred"],
      billing_cycle: ["monthly", "quarterly", "annual"],
      booking_status: ["available", "limited", "unavailable"],
      brand_guideline_status: ["draft", "active", "archived"],
      budget_category_type: ["income", "expense", "capital"],
      budget_period_type: [
        "annual",
        "quarterly",
        "monthly",
        "project",
        "event",
      ],
      budget_status: [
        "draft",
        "pending_approval",
        "approved",
        "active",
        "closed",
      ],
      campaign_status: [
        "planning",
        "active",
        "paused",
        "completed",
        "cancelled",
      ],
      campaign_type: [
        "launch",
        "awareness",
        "engagement",
        "conversion",
        "retention",
        "event",
        "seasonal",
      ],
      catering_order_type: [
        "greenroom",
        "crew_meal",
        "vip",
        "hospitality",
        "concession",
      ],
      catering_status: ["pending", "confirmed", "delivered", "cancelled"],
      certification_status: ["pending", "active", "expired", "revoked"],
      challenge_status: ["draft", "active", "voting", "completed", "cancelled"],
      check_action_type: [
        "check_out",
        "check_in",
        "transfer",
        "reserve",
        "release",
      ],
      checklist_status: ["not_started", "in_progress", "completed"],
      community_member_type: [
        "fan",
        "artist",
        "creator",
        "influencer",
        "brand",
      ],
      company_type: ["prospect", "client", "partner", "vendor", "competitor"],
      connection_status: ["pending", "accepted", "declined", "blocked"],
      contract_status: [
        "draft",
        "pending_review",
        "pending_signature",
        "active",
        "expired",
        "terminated",
        "renewed",
      ],
      contract_type: [
        "vendor",
        "client",
        "employment",
        "nda",
        "service",
        "licensing",
        "rental",
        "sponsorship",
      ],
      counterparty_type: ["company", "contact", "vendor", "user"],
      crew_call_status: [
        "draft",
        "published",
        "confirmed",
        "active",
        "completed",
        "cancelled",
      ],
      cue_department: [
        "lighting",
        "audio",
        "video",
        "pyro",
        "sfx",
        "rigging",
        "staging",
      ],
      cue_type: ["go", "standby", "warning", "hold", "cut"],
      deal_type: ["new_business", "expansion", "renewal", "other"],
      dependency_type: [
        "finish_to_start",
        "start_to_start",
        "finish_to_finish",
        "start_to_finish",
      ],
      depreciation_method: ["straight_line", "declining_balance", "none"],
      discussion_status: ["open", "closed", "archived"],
      document_status: ["draft", "published", "archived"],
      document_type: ["document", "template", "wiki", "note"],
      email_status: ["draft", "scheduled", "sending", "sent", "failed"],
      email_template_type: [
        "transactional",
        "marketing",
        "notification",
        "system",
      ],
      event_phase: [
        "concept",
        "planning",
        "pre_production",
        "setup",
        "active",
        "live",
        "teardown",
        "post_mortem",
        "archived",
      ],
      event_type: [
        "festival",
        "conference",
        "concert",
        "activation",
        "corporate",
        "wedding",
        "private",
        "tour",
        "production",
      ],
      expense_status: [
        "draft",
        "submitted",
        "pending_approval",
        "approved",
        "rejected",
        "reimbursed",
      ],
      fee_type: [
        "flat",
        "guarantee",
        "vs_percentage",
        "guarantee_plus_percentage",
      ],
      finding_severity: ["critical", "major", "minor", "observation"],
      forecast_period: ["daily", "weekly", "monthly", "quarterly", "yearly"],
      forecast_type: ["revenue", "cost", "resource", "capacity"],
      form_field_type: [
        "text",
        "textarea",
        "number",
        "email",
        "phone",
        "date",
        "time",
        "datetime",
        "select",
        "multiselect",
        "checkbox",
        "radio",
        "file",
        "signature",
        "rating",
        "hidden",
      ],
      form_status: ["draft", "active", "closed", "archived"],
      guest_entry_status: ["pending", "confirmed", "checked_in", "no_show"],
      guest_list_status: ["draft", "active", "closed"],
      guest_list_type: ["vip", "artist", "media", "sponsor", "staff", "comp"],
      hospitality_request_type: [
        "accommodation",
        "transportation",
        "catering",
        "greenroom",
        "security",
        "other",
      ],
      hospitality_status: ["pending", "approved", "fulfilled", "cancelled"],
      import_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
      ],
      insight_type: ["trend", "anomaly", "prediction", "recommendation"],
      inventory_transaction_type: [
        "receipt",
        "issue",
        "adjustment",
        "transfer",
        "return",
        "waste",
      ],
      invoice_direction: ["receivable", "payable"],
      invoice_status: [
        "draft",
        "sent",
        "viewed",
        "partially_paid",
        "paid",
        "overdue",
        "cancelled",
        "disputed",
      ],
      invoice_type: ["standard", "credit", "proforma", "recurring"],
      location_type: [
        "warehouse",
        "venue",
        "vehicle",
        "office",
        "external",
        "virtual",
      ],
      maintenance_status: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
      ],
      maintenance_type: [
        "preventive",
        "corrective",
        "inspection",
        "calibration",
      ],
      marketplace_listing_status: [
        "draft",
        "active",
        "sold",
        "expired",
        "cancelled",
      ],
      material_status: [
        "draft",
        "pending_review",
        "approved",
        "published",
        "archived",
      ],
      material_type: [
        "flyer",
        "poster",
        "banner",
        "social_post",
        "email",
        "video",
        "brochure",
        "presentation",
        "press_release",
      ],
      media_status: ["processing", "active", "archived"],
      member_status: ["active", "invited", "suspended", "deactivated"],
      message_status: ["sent", "delivered", "read"],
      opportunity_status: [
        "open",
        "in_progress",
        "filled",
        "closed",
        "cancelled",
      ],
      payment_method: [
        "bank_transfer",
        "credit_card",
        "check",
        "cash",
        "paypal",
        "stripe",
        "other",
      ],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
      ],
      performance_type: [
        "headliner",
        "support",
        "opener",
        "special_guest",
        "resident",
      ],
      po_status: [
        "draft",
        "sent",
        "acknowledged",
        "partially_received",
        "received",
        "invoiced",
        "paid",
        "cancelled",
      ],
      policy_status: ["draft", "active", "archived", "superseded"],
      post_type: ["text", "image", "video", "poll", "event", "article"],
      post_visibility: ["public", "followers", "private"],
      priority_level: ["critical", "high", "medium", "low"],
      program_status: [
        "draft",
        "planning",
        "active",
        "on_hold",
        "completed",
        "cancelled",
        "archived",
      ],
      project_status: [
        "draft",
        "planning",
        "active",
        "on_hold",
        "completed",
        "cancelled",
        "archived",
      ],
      proposal_status: [
        "draft",
        "sent",
        "viewed",
        "accepted",
        "rejected",
        "expired",
      ],
      rate_type: ["hourly", "daily", "flat"],
      renewal_type: ["none", "auto", "manual"],
      report_format: ["pdf", "excel", "csv", "json", "html"],
      report_status: [
        "draft",
        "scheduled",
        "generating",
        "completed",
        "failed",
      ],
      requisition_priority: ["urgent", "high", "normal", "low"],
      requisition_status: [
        "draft",
        "submitted",
        "pending_approval",
        "approved",
        "rejected",
        "ordered",
        "received",
        "cancelled",
      ],
      rider_item_category: [
        "audio",
        "lighting",
        "video",
        "backline",
        "staging",
        "hospitality",
        "catering",
        "accommodation",
        "transportation",
        "security",
        "other",
      ],
      rider_item_provider: ["artist", "venue", "promoter"],
      rider_item_status: [
        "pending",
        "confirmed",
        "substituted",
        "not_available",
      ],
      rider_status: ["draft", "submitted", "approved", "signed"],
      rider_type: ["technical", "hospitality", "combined"],
      risk_level: ["critical", "high", "medium", "low", "negligible"],
      risk_status: [
        "identified",
        "assessed",
        "mitigating",
        "accepted",
        "closed",
      ],
      runsheet_item_status: [
        "pending",
        "in_progress",
        "completed",
        "skipped",
        "delayed",
      ],
      runsheet_item_type: [
        "performance",
        "transition",
        "break",
        "announcement",
        "technical",
        "ceremony",
        "speech",
        "other",
      ],
      runsheet_status: ["draft", "approved", "active", "locked"],
      scan_method: ["qr", "barcode", "rfid", "nfc", "manual"],
      scenario_type: ["baseline", "optimistic", "pessimistic", "custom"],
      schedule_status: ["draft", "published", "locked"],
      setlist_status: ["draft", "submitted", "approved", "performed"],
      shift_status: [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      show_call_status: ["draft", "published", "active", "completed"],
      sms_status: [
        "draft",
        "scheduled",
        "sending",
        "sent",
        "delivered",
        "failed",
      ],
      social_platform: [
        "instagram",
        "facebook",
        "twitter",
        "linkedin",
        "tiktok",
        "youtube",
        "pinterest",
        "threads",
      ],
      social_post_status: [
        "draft",
        "scheduled",
        "published",
        "failed",
        "deleted",
      ],
      subscription_status: ["active", "past_due", "cancelled", "trialing"],
      subscription_tier: ["core", "pro", "enterprise"],
      support_ticket_status: [
        "new",
        "open",
        "pending",
        "on_hold",
        "solved",
        "closed",
      ],
      talent_booking_status: [
        "inquiry",
        "negotiating",
        "confirmed",
        "contracted",
        "cancelled",
        "completed",
      ],
      talent_payment_method: ["wire", "check", "paypal", "cash", "crypto"],
      talent_payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
      ],
      talent_payment_type: ["deposit", "balance", "bonus", "reimbursement"],
      talent_type: [
        "dj",
        "band",
        "solo_artist",
        "speaker",
        "mc",
        "performer",
        "comedian",
        "other",
      ],
      task_priority: ["urgent", "high", "medium", "low", "none"],
      task_status: [
        "backlog",
        "todo",
        "in_progress",
        "in_review",
        "blocked",
        "done",
        "cancelled",
      ],
      task_type: ["task", "bug", "feature", "epic", "story", "milestone"],
      ticket_order_status: [
        "pending",
        "completed",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],
      ticket_priority: ["low", "normal", "high", "urgent"],
      ticket_status: [
        "reserved",
        "purchased",
        "checked_in",
        "cancelled",
        "refunded",
        "transferred",
      ],
      ticket_tier: [
        "general",
        "vip",
        "premium",
        "backstage",
        "artist",
        "media",
        "staff",
        "comp",
      ],
      timesheet_status: ["draft", "submitted", "approved", "rejected", "paid"],
      transport_status: [
        "booked",
        "confirmed",
        "in_transit",
        "completed",
        "cancelled",
      ],
      transport_type: [
        "flight",
        "ground",
        "shuttle",
        "rideshare",
        "rental",
        "private",
      ],
      trigger_type: ["manual", "timecode", "midi", "osc", "follow"],
      usage_metric_type: [
        "api_calls",
        "storage",
        "bandwidth",
        "users",
        "projects",
        "events",
      ],
      venue_type: ["indoor", "outdoor", "hybrid", "virtual"],
      visibility_type: ["private", "team", "organization", "public"],
      webhook_status: ["active", "paused", "failed"],
      workflow_run_status: [
        "pending",
        "running",
        "completed",
        "failed",
        "cancelled",
      ],
      workflow_trigger_type: [
        "entity_created",
        "entity_updated",
        "entity_deleted",
        "field_changed",
        "status_changed",
        "schedule",
        "webhook",
        "manual",
        "api_call",
        "form_submitted",
        "approval_decision",
        "scan_event",
      ],
    },
  },
} as const

