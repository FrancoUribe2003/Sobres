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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          archived: boolean
          color: string | null
          created_at: string
          icon: string | null
          id: string
          limit_currency: Database["public"]["Enums"]["currency_code"]
          monthly_limit: number | null
          name: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          limit_currency?: Database["public"]["Enums"]["currency_code"]
          monthly_limit?: number | null
          name: string
          user_id?: string
        }
        Update: {
          archived?: boolean
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          limit_currency?: Database["public"]["Enums"]["currency_code"]
          monthly_limit?: number | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          buy: number
          sell: number
          source: string
          type: Database["public"]["Enums"]["rate_type"]
          updated_at: string
        }
        Insert: {
          buy: number
          sell: number
          source: string
          type: Database["public"]["Enums"]["rate_type"]
          updated_at?: string
        }
        Update: {
          buy?: number
          sell?: number
          source?: string
          type?: Database["public"]["Enums"]["rate_type"]
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          date: string
          description: string | null
          fixed_expense_id: string | null
          id: string
          period: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          date: string
          description?: string | null
          fixed_expense_id?: string | null
          id?: string
          period?: string | null
          user_id?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          date?: string
          description?: string | null
          fixed_expense_id?: string | null
          id?: string
          period?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "expenses_fixed_expense_id_user_id_fkey"
            columns: ["fixed_expense_id", "user_id"]
            isOneToOne: false
            referencedRelation: "fixed_expenses"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      fixed_expenses: {
        Row: {
          active: boolean
          amount: number
          category_id: string | null
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          day_of_month: number
          id: string
          is_subscription: boolean
          name: string
          trial_ends_on: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          amount: number
          category_id?: string | null
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          day_of_month: number
          id?: string
          is_subscription?: boolean
          name: string
          trial_ends_on?: string | null
          user_id?: string
        }
        Update: {
          active?: boolean
          amount?: number
          category_id?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          day_of_month?: number
          id?: string
          is_subscription?: boolean
          name?: string
          trial_ends_on?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixed_expenses_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      incomes: {
        Row: {
          amount: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          date: string
          description: string
          id: string
          period: string | null
          recurring_income_id: string | null
          status: Database["public"]["Enums"]["income_status"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          date: string
          description: string
          id?: string
          period?: string | null
          recurring_income_id?: string | null
          status?: Database["public"]["Enums"]["income_status"]
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          date?: string
          description?: string
          id?: string
          period?: string | null
          recurring_income_id?: string | null
          status?: Database["public"]["Enums"]["income_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incomes_recurring_income_id_user_id_fkey"
            columns: ["recurring_income_id", "user_id"]
            isOneToOne: false
            referencedRelation: "recurring_incomes"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_currency: Database["public"]["Enums"]["currency_code"]
          display_name: string | null
          hourly_rate: number | null
          id: string
          income_currency: Database["public"]["Enums"]["currency_code"]
          monthly_income: number | null
          preferred_rate: Database["public"]["Enums"]["rate_type"]
          weekly_hours: number | null
          work_mode: Database["public"]["Enums"]["work_mode"] | null
        }
        Insert: {
          created_at?: string
          display_currency?: Database["public"]["Enums"]["currency_code"]
          display_name?: string | null
          hourly_rate?: number | null
          id: string
          income_currency?: Database["public"]["Enums"]["currency_code"]
          monthly_income?: number | null
          preferred_rate?: Database["public"]["Enums"]["rate_type"]
          weekly_hours?: number | null
          work_mode?: Database["public"]["Enums"]["work_mode"] | null
        }
        Update: {
          created_at?: string
          display_currency?: Database["public"]["Enums"]["currency_code"]
          display_name?: string | null
          hourly_rate?: number | null
          id?: string
          income_currency?: Database["public"]["Enums"]["currency_code"]
          monthly_income?: number | null
          preferred_rate?: Database["public"]["Enums"]["rate_type"]
          weekly_hours?: number | null
          work_mode?: Database["public"]["Enums"]["work_mode"] | null
        }
        Relationships: []
      }
      recurring_incomes: {
        Row: {
          active: boolean
          amount: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          day_of_month: number
          description: string
          id: string
          user_id: string
        }
        Insert: {
          active?: boolean
          amount: number
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          day_of_month: number
          description: string
          id?: string
          user_id?: string
        }
        Update: {
          active?: boolean
          amount?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          day_of_month?: number
          description?: string
          id?: string
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
      currency_code: "ARS" | "USD"
      income_status: "received" | "expected" | "not_received"
      rate_type: "blue" | "oficial" | "mep" | "ccl" | "tarjeta" | "cripto"
      work_mode: "hourly" | "full_time" | "part_time"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      currency_code: ["ARS", "USD"],
      income_status: ["received", "expected", "not_received"],
      rate_type: ["blue", "oficial", "mep", "ccl", "tarjeta", "cripto"],
      work_mode: ["hourly", "full_time", "part_time"],
    },
  },
} as const
