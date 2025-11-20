export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      fortune_quotes: {
        Row: {
          feeling: string | null
          id: number
          quote: string | null
        }
        Insert: {
          feeling?: string | null
          id?: number
          quote?: string | null
        }
        Update: {
          feeling?: string | null
          id?: number
          quote?: string | null
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string | null
          feelings_text: string
          id: string
          message: string | null
          mood: string
          theme: string | null
          user_id: string
          weather: string | null
        }
        Insert: {
          created_at?: string | null
          feelings_text: string
          id?: string
          message?: string | null
          mood: string
          theme?: string | null
          user_id: string
          weather?: string | null
        }
        Update: {
          created_at?: string | null
          feelings_text?: string
          id?: string
          message?: string | null
          mood?: string
          theme?: string | null
          user_id?: string
          weather?: string | null
        }
        Relationships: []
      }
       profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          id: string
          last_active_at: string | null
          reminded: boolean | null
          updated_at: string | null
          user_role: string | null
          gender: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_active_at?: string | null
          reminded?: boolean | null
          updated_at?: string | null
          user_role?: string | null
          gender?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_active_at?: string | null
          reminded?: boolean | null
          updated_at?: string | null
          user_role?: string | null
          gender?: string | null
          username?: string | null
        }
        Relationships: []
      }
      quiz_options: {
        Row: {
          id: number
          label: string | null
          mood: string | null
          question_id: number
          value: string | null
        }
        Insert: {
          id?: number
          label?: string | null
          mood?: string | null
          question_id: number
          value?: string | null
        }
        Update: {
          id?: number
          label?: string | null
          mood?: string | null
          question_id?: number
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }

      quiz_questions: {
        Row: {
          id: number
          type: string | null
          question: string | null
          age_range: string | null
          gender: string | null
          user_role: string | null
        }
        Insert: {
          id?: number
          type?: string | null
          question?: string | null
          age_range?: string | null
          gender?: string | null
          user_role?: string | null
        }
        Update: {
          id?: number
          type?: string | null
          question?: string | null
          age_range?: string | null
          gender?: string | null
          user_role?: string | null
        }
        Relationships: []
      }

      mood_track: {
      Row: {
        id: string
        user_id: string | null
        created_at: string | null
        mood: number | null
        sleep_quality: string | null
        weather: string | null
        interaction_with: string[] | null
        note: string | null
      }
      Insert: {
        id?: string
        user_id?: string | null
        created_at?: string | null
        mood?: number | null
        sleep_quality?: string | null
        weather?: string | null
        interaction_with?: string[] | null
        note?: string | null
      }
      Update: {
        id?: string
        user_id?: string | null
        created_at?: string | null
        mood?: number | null
        sleep_quality?: string | null
        weather?: string | null
        interaction_with?: string[] | null
        note?: string | null
      }
      Relationships: []
    }
    goals: {
  Row: {
    id: string;
    user_id: string;
    description: string;
    is_completed: boolean;
    created_at: string;
    completed_at: string | null;
  };
  Insert: {
    id?: string;
    user_id: string;
    description: string;
    is_completed?: boolean;
    created_at?: string;
    completed_at?: string | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    description?: string;
    is_completed?: boolean;
    created_at?: string;
    completed_at?: string | null;
  };
  Relationships: [];
},

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
    Enums: {},
  },
} as const
