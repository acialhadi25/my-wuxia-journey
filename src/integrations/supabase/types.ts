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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      character_items: {
        Row: {
          character_id: string
          created_at: string
          description: string | null
          effects: Json | null
          equipped: boolean | null
          id: string
          name: string
          quantity: number
          rarity: string
          type: string
        }
        Insert: {
          character_id: string
          created_at?: string
          description?: string | null
          effects?: Json | null
          equipped?: boolean | null
          id?: string
          name: string
          quantity?: number
          rarity?: string
          type?: string
        }
        Update: {
          character_id?: string
          created_at?: string
          description?: string | null
          effects?: Json | null
          equipped?: boolean | null
          id?: string
          name?: string
          quantity?: number
          rarity?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_items_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_techniques: {
        Row: {
          character_id: string
          cooldown: string | null
          created_at: string
          description: string | null
          effects: Json | null
          element: string | null
          id: string
          mastery: number
          name: string
          qi_cost: number | null
          rank: string
          type: string
          updated_at: string
        }
        Insert: {
          character_id: string
          cooldown?: string | null
          created_at?: string
          description?: string | null
          effects?: Json | null
          element?: string | null
          id?: string
          mastery?: number
          name: string
          qi_cost?: number | null
          rank?: string
          type?: string
          updated_at?: string
        }
        Update: {
          character_id?: string
          cooldown?: string | null
          created_at?: string
          description?: string | null
          effects?: Json | null
          element?: string | null
          id?: string
          mastery?: number
          name?: string
          qi_cost?: number | null
          rank?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_techniques_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          breakthrough_ready: boolean
          created_at: string
          cultivation_progress: number
          current_chapter: number
          current_location: string
          golden_finger: Json
          health: number
          id: string
          inventory: Json
          is_alive: boolean
          karma: number
          max_health: number
          max_qi: number
          name: string
          origin: string
          qi: number
          realm: string
          spirit_root: string
          stats: Json
          time_elapsed: string
          updated_at: string
          user_id: string | null
          visual_traits: Json
        }
        Insert: {
          breakthrough_ready?: boolean
          created_at?: string
          cultivation_progress?: number
          current_chapter?: number
          current_location?: string
          golden_finger: Json
          health?: number
          id?: string
          inventory?: Json
          is_alive?: boolean
          karma?: number
          max_health?: number
          max_qi?: number
          name: string
          origin: string
          qi?: number
          realm?: string
          spirit_root: string
          stats: Json
          time_elapsed?: string
          updated_at?: string
          user_id?: string | null
          visual_traits?: Json
        }
        Update: {
          breakthrough_ready?: boolean
          created_at?: string
          cultivation_progress?: number
          current_chapter?: number
          current_location?: string
          golden_finger?: Json
          health?: number
          id?: string
          inventory?: Json
          is_alive?: boolean
          karma?: number
          max_health?: number
          max_qi?: number
          name?: string
          origin?: string
          qi?: number
          realm?: string
          spirit_root?: string
          stats?: Json
          time_elapsed?: string
          updated_at?: string
          user_id?: string | null
          visual_traits?: Json
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          character_id: string
          content: string
          created_at: string
          id: string
          message_type: string
          role: string
          speaker: string | null
        }
        Insert: {
          character_id: string
          content: string
          created_at?: string
          id?: string
          message_type?: string
          role: string
          speaker?: string | null
        }
        Update: {
          character_id?: string
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          role?: string
          speaker?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      graveyard: {
        Row: {
          achievements: Json | null
          cause_of_death: string | null
          created_at: string
          final_realm: string
          id: string
          legacy_item: string | null
          name: string
          origin: string
          original_character_id: string | null
          total_karma: number
          user_id: string | null
        }
        Insert: {
          achievements?: Json | null
          cause_of_death?: string | null
          created_at?: string
          final_realm: string
          id?: string
          legacy_item?: string | null
          name: string
          origin: string
          original_character_id?: string | null
          total_karma?: number
          user_id?: string | null
        }
        Update: {
          achievements?: Json | null
          cause_of_death?: string | null
          created_at?: string
          final_realm?: string
          id?: string
          legacy_item?: string | null
          name?: string
          origin?: string
          original_character_id?: string | null
          total_karma?: number
          user_id?: string | null
        }
        Relationships: []
      }
      npc_relationships: {
        Row: {
          character_id: string
          created_at: string
          favor: number
          grudge: number
          id: string
          last_interaction: string | null
          npc_description: string | null
          npc_name: string
          status: string
          updated_at: string
        }
        Insert: {
          character_id: string
          created_at?: string
          favor?: number
          grudge?: number
          id?: string
          last_interaction?: string | null
          npc_description?: string | null
          npc_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          character_id?: string
          created_at?: string
          favor?: number
          grudge?: number
          id?: string
          last_interaction?: string | null
          npc_description?: string | null
          npc_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "npc_relationships_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          highest_realm: string
          id: string
          total_deaths: number
          total_karma: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          highest_realm?: string
          id?: string
          total_deaths?: number
          total_karma?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          highest_realm?: string
          id?: string
          total_deaths?: number
          total_karma?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      story_events: {
        Row: {
          chapter: number
          character_id: string
          created_at: string
          details: Json | null
          event_type: string
          id: string
          importance: number
          summary: string
        }
        Insert: {
          chapter: number
          character_id: string
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          importance?: number
          summary: string
        }
        Update: {
          chapter?: number
          character_id?: string
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          importance?: number
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_events_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
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
