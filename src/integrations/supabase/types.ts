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
  public: {
    Tables: {
      guests: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          id_document: string | null
          nationality: string | null
          notes: string | null
          phone: string | null
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          id_document?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          id_document?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferences: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          preferences?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferences?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          check_in: string
          check_out: string
          confirmed_at: string | null
          created_at: string
          discount_percent: number | null
          guest_id: string | null
          guests_count: number
          id: string
          nights: number
          notes: string | null
          paid_at: string | null
          payment_amount: number | null
          payment_method: string | null
          profile_id: string | null
          promo_code: string | null
          reference: string
          room_id: string
          special_requests: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          total_price: number
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          check_in: string
          check_out: string
          confirmed_at?: string | null
          created_at?: string
          discount_percent?: number | null
          guest_id?: string | null
          guests_count?: number
          id?: string
          nights: number
          notes?: string | null
          paid_at?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          profile_id?: string | null
          promo_code?: string | null
          reference?: string
          room_id: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          total_price: number
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          check_in?: string
          check_out?: string
          confirmed_at?: string | null
          created_at?: string
          discount_percent?: number | null
          guest_id?: string | null
          guests_count?: number
          id?: string
          nights?: number
          notes?: string | null
          paid_at?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          profile_id?: string | null
          promo_code?: string | null
          reference?: string
          room_id?: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_photos: {
        Row: {
          created_at: string
          id: string
          is_cover: boolean
          room_id: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_cover?: boolean
          room_id: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_cover?: boolean
          room_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_photos_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          amenities: string[]
          capacity: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          number: string
          price_per_night: number
          size_sqm: number | null
          status: Database["public"]["Enums"]["room_status"]
          type: Database["public"]["Enums"]["room_type"]
          updated_at: string
        }
        Insert: {
          amenities?: string[]
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          number: string
          price_per_night: number
          size_sqm?: number | null
          status?: Database["public"]["Enums"]["room_status"]
          type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Update: {
          amenities?: string[]
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          number?: string
          price_per_night?: number
          size_sqm?: number | null
          status?: Database["public"]["Enums"]["room_status"]
          type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name: string
          price: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          menu_item_id: string | null
          name: string
          notes: string | null
          order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total: number
          menu_item_id?: string | null
          name: string
          notes?: string | null
          order_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          menu_item_id?: string | null
          name?: string
          notes?: string | null
          order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "restaurant_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_orders: {
        Row: {
          created_at: string
          created_by: string | null
          guests_count: number
          id: string
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          reference: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          table_id: string | null
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          guests_count?: number
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          reference?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          table_id?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          guests_count?: number
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          reference?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          table_id?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_tables: {
        Row: {
          capacity: number
          created_at: string
          id: string
          is_active: boolean
          location: string | null
          number: string
          status: Database["public"]["Enums"]["table_status"]
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string | null
          number: string
          status?: Database["public"]["Enums"]["table_status"]
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string | null
          number?: string
          status?: Database["public"]["Enums"]["table_status"]
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          phone: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          phone?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string | null
          subject?: string
        }
        Relationships: []
      }
      financial_records: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          record_date: string
          source: string | null
          type: Database["public"]["Enums"]["finance_type"]
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          record_date?: string
          source?: string | null
          type: Database["public"]["Enums"]["finance_type"]
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          record_date?: string
          source?: string | null
          type?: Database["public"]["Enums"]["finance_type"]
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string | null
          created_at: string
          id: string
          min_threshold: number
          name: string
          quantity: number
          unit: string
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          min_threshold?: number
          name: string
          quantity?: number
          unit?: string
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          min_threshold?: number
          name?: string
          quantity?: number
          unit?: string
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          discount_percent: number
          id: string
          is_active: boolean
          title: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_percent: number
          id?: string
          is_active?: boolean
          title: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_percent?: number
          id?: string
          is_active?: boolean
          title?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      table_reservations: {
        Row: {
          created_at: string
          email: string
          full_name: string
          guests_count: number
          id: string
          notes: string | null
          phone: string | null
          reference: string
          reservation_date: string
          reservation_time: string
          status: Database["public"]["Enums"]["table_reservation_status"]
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          guests_count?: number
          id?: string
          notes?: string | null
          phone?: string | null
          reference?: string
          reservation_date: string
          reservation_time: string
          status?: Database["public"]["Enums"]["table_reservation_status"]
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          guests_count?: number
          id?: string
          notes?: string | null
          phone?: string | null
          reference?: string
          reservation_date?: string
          reservation_time?: string
          status?: Database["public"]["Enums"]["table_reservation_status"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_available_room: {
        Args: {
          _capacity: number
          _check_in: string
          _check_out: string
          _type?: string
        }
        Returns: string
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
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
      is_room_available: {
        Args: {
          _check_in: string
          _check_out: string
          _exclude_id?: string
          _room_id: string
        }
        Returns: boolean
      }
      recalc_order_total: {
        Args: { _order_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "manager"
        | "reception"
        | "restaurant_staff"
        | "accountant"
        | "cleaning_staff"
        | "customer"
      finance_type: "income" | "expense"
      order_status:
        | "new"
        | "preparing"
        | "ready"
        | "served"
        | "paid"
        | "cancelled"
      reservation_status:
        | "pending"
        | "confirmed"
        | "checked_in"
        | "checked_out"
        | "cancelled"
      room_status:
        | "available"
        | "occupied"
        | "cleaning"
        | "maintenance"
        | "reserved"
      table_status:
        | "available"
        | "occupied"
        | "reserved"
        | "cleaning"
      table_reservation_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
      room_type: "standard" | "superior" | "deluxe" | "suite" | "family"
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
      app_role: [
        "super_admin",
        "manager",
        "reception",
        "restaurant_staff",
        "accountant",
        "cleaning_staff",
        "customer",
      ],
      finance_type: ["income", "expense"],
      order_status: [
        "new",
        "preparing",
        "ready",
        "served",
        "paid",
        "cancelled",
      ],
      reservation_status: [
        "pending",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
      ],
      room_status: [
        "available",
        "occupied",
        "cleaning",
        "maintenance",
        "reserved",
      ],
      table_status: [
        "available",
        "occupied",
        "reserved",
        "cleaning",
      ],
      table_reservation_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
      ],
      room_type: ["standard", "superior", "deluxe", "suite", "family"],
    },
  },
} as const
