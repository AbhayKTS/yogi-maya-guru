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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      dosha_assessment_responses: {
        Row: {
          answer_option: string
          created_at: string
          dosha_mapping: Database["public"]["Enums"]["dosha_type"]
          id: string
          question_id: number
          user_id: string
        }
        Insert: {
          answer_option: string
          created_at?: string
          dosha_mapping: Database["public"]["Enums"]["dosha_type"]
          id?: string
          question_id: number
          user_id: string
        }
        Update: {
          answer_option?: string
          created_at?: string
          dosha_mapping?: Database["public"]["Enums"]["dosha_type"]
          id?: string
          question_id?: number
          user_id?: string
        }
        Relationships: []
      }
      favorite_shloks: {
        Row: {
          created_at: string
          id: string
          shlok_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          shlok_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          shlok_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_shloks_shlok_id_fkey"
            columns: ["shlok_id"]
            isOneToOne: false
            referencedRelation: "shloks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birth_date: string | null
          birth_place: string | null
          birth_time: string | null
          created_at: string
          current_rank: Database["public"]["Enums"]["rank_type"]
          dominant_dosha: Database["public"]["Enums"]["dosha_type"] | null
          id: string
          last_login_date: string | null
          login_streak: number
          sadhana_points: number
          secondary_dosha: Database["public"]["Enums"]["dosha_type"] | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          birth_date?: string | null
          birth_place?: string | null
          birth_time?: string | null
          created_at?: string
          current_rank?: Database["public"]["Enums"]["rank_type"]
          dominant_dosha?: Database["public"]["Enums"]["dosha_type"] | null
          id?: string
          last_login_date?: string | null
          login_streak?: number
          sadhana_points?: number
          secondary_dosha?: Database["public"]["Enums"]["dosha_type"] | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          birth_date?: string | null
          birth_place?: string | null
          birth_time?: string | null
          created_at?: string
          current_rank?: Database["public"]["Enums"]["rank_type"]
          dominant_dosha?: Database["public"]["Enums"]["dosha_type"] | null
          id?: string
          last_login_date?: string | null
          login_streak?: number
          sadhana_points?: number
          secondary_dosha?: Database["public"]["Enums"]["dosha_type"] | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      shloks: {
        Row: {
          audio_url: string | null
          chapter_context: string | null
          created_at: string
          id: string
          sanskrit_text: string
          source: string
          translation: string
          transliteration: string
        }
        Insert: {
          audio_url?: string | null
          chapter_context?: string | null
          created_at?: string
          id?: string
          sanskrit_text: string
          source: string
          translation: string
          transliteration: string
        }
        Update: {
          audio_url?: string | null
          chapter_context?: string | null
          created_at?: string
          id?: string
          sanskrit_text?: string
          source?: string
          translation?: string
          transliteration?: string
        }
        Relationships: []
      }
      yoga_sessions: {
        Row: {
          accuracy_score: number | null
          completed_at: string
          duration_minutes: number
          id: string
          sadhana_points_earned: number
          session_type: string
          user_id: string
        }
        Insert: {
          accuracy_score?: number | null
          completed_at?: string
          duration_minutes: number
          id?: string
          sadhana_points_earned?: number
          session_type: string
          user_id: string
        }
        Update: {
          accuracy_score?: number | null
          completed_at?: string
          duration_minutes?: number
          id?: string
          sadhana_points_earned?: number
          session_type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      dosha_type: "vata" | "pitta" | "kapha"
      rank_type:
        | "padatik"
        | "ashvarohi"
        | "gaja"
        | "ardharathi"
        | "rathi"
        | "ati_rathi"
        | "maharathi"
        | "maha_maharathi"
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
      dosha_type: ["vata", "pitta", "kapha"],
      rank_type: [
        "padatik",
        "ashvarohi",
        "gaja",
        "ardharathi",
        "rathi",
        "ati_rathi",
        "maharathi",
        "maha_maharathi",
      ],
    },
  },
} as const
