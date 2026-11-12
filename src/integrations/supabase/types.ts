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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          published: boolean
          title: string
        }
        Insert: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          published?: boolean
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          published?: boolean
          title?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          details: Json | null
          entity: string | null
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          id: string
          name: string
          student_count: number
        }
        Insert: {
          id?: string
          name: string
          student_count?: number
        }
        Update: {
          id?: string
          name?: string
          student_count?: number
        }
        Relationships: []
      }
      canteen_seating_status: {
        Row: {
          id: number
          occupied_seats: number
          total_seats: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: number
          occupied_seats?: number
          total_seats?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: number
          occupied_seats?: number
          total_seats?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      donation_requests: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          ngo_id: string
          note: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          ngo_id: string
          note?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          ngo_id?: string
          note?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "surplus_food_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_requests_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngo_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      food_preparation_batches: {
        Row: {
          created_at: string
          created_by: string | null
          discarded_qty: number
          donated_qty: number
          id: string
          lunch_period: string | null
          menu_item_id: string
          prep_date: string
          prepared_qty: number
          sold_qty: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          discarded_qty?: number
          donated_qty?: number
          id?: string
          lunch_period?: string | null
          menu_item_id: string
          prep_date?: string
          prepared_qty: number
          sold_qty?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          discarded_qty?: number
          donated_qty?: number
          id?: string
          lunch_period?: string | null
          menu_item_id?: string
          prep_date?: string
          prepared_qty?: number
          sold_qty?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_preparation_batches_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_items: {
        Row: {
          created_at: string
          id: string
          min_stock: number
          name: string
          unit: string
        }
        Insert: {
          created_at?: string
          id?: string
          min_stock?: number
          name: string
          unit: string
        }
        Update: {
          created_at?: string
          id?: string
          min_stock?: number
          name?: string
          unit?: string
        }
        Relationships: []
      }
      inventory_transactions: {
        Row: {
          batch_id: string | null
          cost: number | null
          created_at: string
          created_by: string | null
          expiry_date: string | null
          grocery_item_id: string
          id: string
          note: string | null
          quantity: number
          supplier: string | null
          txn_date: string
          txn_type: string
        }
        Insert: {
          batch_id?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          grocery_item_id: string
          id?: string
          note?: string | null
          quantity: number
          supplier?: string | null
          txn_date?: string
          txn_type: string
        }
        Update: {
          batch_id?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          grocery_item_id?: string
          id?: string
          note?: string | null
          quantity?: number
          supplier?: string | null
          txn_date?: string
          txn_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_grocery_item_id_fkey"
            columns: ["grocery_item_id"]
            isOneToOne: false
            referencedRelation: "grocery_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_grocery_item_id_fkey"
            columns: ["grocery_item_id"]
            isOneToOne: false
            referencedRelation: "ingredient_stock"
            referencedColumns: ["id"]
          },
        ]
      }
      lunch_break_schedules: {
        Row: {
          academic_year: number
          branch: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
        }
        Insert: {
          academic_year: number
          branch: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
        }
        Update: {
          academic_year?: number
          branch?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category: string
          created_at: string
          id: string
          is_available: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_available?: boolean
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_available?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      ngo_posts: {
        Row: {
          activity_date: string | null
          beneficiaries: number | null
          body: string
          created_at: string
          id: string
          image_url: string | null
          location: string | null
          ngo_id: string
          status: string
          title: string
        }
        Insert: {
          activity_date?: string | null
          beneficiaries?: number | null
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          location?: string | null
          ngo_id: string
          status?: string
          title: string
        }
        Update: {
          activity_date?: string | null
          beneficiaries?: number | null
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          location?: string | null
          ngo_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ngo_posts_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngo_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ngo_profiles: {
        Row: {
          contact: string | null
          created_at: string
          description: string | null
          org_name: string
          service_area: string | null
          updated_at: string
          user_id: string
          verification_status: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          description?: string | null
          org_name: string
          service_area?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          description?: string | null
          org_name?: string
          service_area?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ngo_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          academic_year: number | null
          branch: string | null
          created_at: string
          display_name: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          academic_year?: number | null
          branch?: string | null
          created_at?: string
          display_name?: string
          id: string
          status?: string
          updated_at?: string
        }
        Update: {
          academic_year?: number | null
          branch?: string | null
          created_at?: string
          display_name?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          grocery_item_id: string
          id: string
          menu_item_id: string
          qty_per_portion: number
        }
        Insert: {
          grocery_item_id: string
          id?: string
          menu_item_id: string
          qty_per_portion: number
        }
        Update: {
          grocery_item_id?: string
          id?: string
          menu_item_id?: string
          qty_per_portion?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_grocery_item_id_fkey"
            columns: ["grocery_item_id"]
            isOneToOne: false
            referencedRelation: "grocery_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_grocery_item_id_fkey"
            columns: ["grocery_item_id"]
            isOneToOne: false
            referencedRelation: "ingredient_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      surplus_food_listings: {
        Row: {
          available_until: string
          batch_id: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          prepared_at: string
          quantity: number
          status: string
          unit: string
        }
        Insert: {
          available_until: string
          batch_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          prepared_at?: string
          quantity: number
          status?: string
          unit?: string
        }
        Update: {
          available_until?: string
          batch_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          prepared_at?: string
          quantity?: number
          status?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "surplus_food_listings_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "food_preparation_batches"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      ingredient_stock: {
        Row: {
          avg_daily_use: number | null
          current_stock: number | null
          id: string | null
          min_stock: number | null
          name: string | null
          next_expiry: string | null
          unit: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _uid: string }; Returns: boolean }
      is_verified_ngo: { Args: { _uid: string }; Returns: boolean }
      notify_role: {
        Args: {
          _body: string
          _role: Database["public"]["Enums"]["app_role"]
          _title: string
        }
        Returns: undefined
      }
      record_preparation: {
        Args: { _menu_item: string; _period: string; _qty: number }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "canteen" | "ngo" | "student"
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
  public: {
    Enums: {
      app_role: ["admin", "canteen", "ngo", "student"],
    },
  },
} as const
