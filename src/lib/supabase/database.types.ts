export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      portfolio_items: {
        Row: {
          id: number
          title: string
          style: string
          image_url: string
          description: string | null
          is_featured: boolean
          is_active: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          style: string
          image_url: string
          description?: string | null
          is_featured?: boolean
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          style?: string
          image_url?: string
          description?: string | null
          is_featured?: boolean
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
        Relationships: []
      }
      tattoo_styles: {
        Row: {
          id: number
          name: string
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      flash_designs: {
        Row: {
          id: number
          name: string
          price: number
          image_url: string
          status: "Disponible" | "Reservado" | "Reclamado"
          style: string
          placement: string
          size: string
          is_active: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          price: number
          image_url: string
          status?: "Disponible" | "Reservado" | "Reclamado"
          style: string
          placement: string
          size: string
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          price?: number
          image_url?: string
          status?: "Disponible" | "Reservado" | "Reclamado"
          style?: string
          placement?: string
          size?: string
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          id: number
          name: string
          email: string | null
          phone: string | null
          message: string
          preferred_placement: string | null
          budget: string | null
          status: "Nueva" | "Respondida" | "Archivada"
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          email?: string | null
          phone?: string | null
          message: string
          preferred_placement?: string | null
          budget?: string | null
          status?: "Nueva" | "Respondida" | "Archivada"
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string | null
          phone?: string | null
          message?: string
          preferred_placement?: string | null
          budget?: string | null
          status?: "Nueva" | "Respondida" | "Archivada"
          created_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: number
          brand_name: string | null
          instagram_url: string | null
          whatsapp_url: string | null
          studio_address: string | null
          studio_hours: string | null
          artist_name: string | null
          artist_years: string | null
          updated_at: string
        }
        Insert: {
          id?: number
          brand_name?: string | null
          instagram_url?: string | null
          whatsapp_url?: string | null
          studio_address?: string | null
          studio_hours?: string | null
          artist_name?: string | null
          artist_years?: string | null
          updated_at?: string
        }
        Update: {
          id?: number
          brand_name?: string | null
          instagram_url?: string | null
          whatsapp_url?: string | null
          studio_address?: string | null
          studio_hours?: string | null
          artist_name?: string | null
          artist_years?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_sections: {
        Row: {
          id: number
          page_key: string
          section_key: string
          type: string
          enabled: boolean
          display_order: number
          content: Json
          layout: Json
          style: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          page_key: string
          section_key: string
          type: string
          enabled?: boolean
          display_order?: number
          content?: Json
          layout?: Json
          style?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          page_key?: string
          section_key?: string
          type?: string
          enabled?: boolean
          display_order?: number
          content?: Json
          layout?: Json
          style?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
