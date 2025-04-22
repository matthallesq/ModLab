// This file contains simplified type definitions that were previously from Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          updated_at: string | null;
          user_id: string | null;
          team_id?: string | null;
          model_type?: string | null;
          archived?: boolean | null;
        };
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          name: string | null;
          updated_at: string | null;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          owner_id: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string | null;
          name: string;
          email: string;
          avatar: string;
          role: string;
        };
      };
      experiments: {
        Row: {
          id: string;
          title: string;
          hypothesis: string;
          test_description: string;
          success_criteria: string;
          status: string;
          priority: string;
          results: string | null;
          created_at: string;
          updated_at: string;
          due_date: string | null;
          project_id: string;
        };
      };
      insights: {
        Row: {
          id: string;
          title: string;
          type: string | null;
          hypothesis: string | null;
          observation: string | null;
          insight_text: string;
          next_steps: string | null;
          created_at: string;
          updated_at: string;
          project_id: string;
          experiment_id: string | null;
        };
      };
      timeline_events: {
        Row: {
          id: string;
          type: string;
          title: string;
          description: string | null;
          timestamp: string;
          entity_id: string | null;
          entity_type: string | null;
          user_id: string;
          user_name: string | null;
          project_id: string;
        };
      };
      project_team_members: {
        Row: {
          id: string;
          project_id: string;
          team_member_id: string;
        };
      };
      experiment_team_members: {
        Row: {
          id: string;
          experiment_id: string;
          team_member_id: string;
        };
      };
      insight_team_members: {
        Row: {
          id: string;
          insight_id: string;
          team_member_id: string;
        };
      };
    };
  };
};

// These type definitions are kept for backward compatibility
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
