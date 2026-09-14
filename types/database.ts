// Bootstrap mirror of the Phase 1 schema. Replace with `supabase gen types typescript`
// after the project is linked; field names intentionally match the migrations exactly.
export type Json = string | number | boolean | null | {[key: string]: Json | undefined} | Json[];

export type AppRole = 'admin' | 'staff' | 'viewer';
export type LocationStatus = 'active' | 'inactive' | 'coming_soon';
export type AvailabilityStatus = 'available' | 'limited' | 'sold_out' | 'contact';
export type LeadStatus = 'new' | 'contacted' | 'visit_scheduled' | 'visited' | 'won' | 'lost';
export type NeedType = 'shop_online' | 'sme' | 'inventory' | 'personal' | 'documents' | 'other';
export type EstimatedVolume = 'under_20_boxes' | 'boxes_20_50' | 'over_50_boxes' | 'unknown';
export type MediaCategory = 'hero' | 'location' | 'unit' | 'security' | 'exterior' | 'lifestyle' | 'blog';

type Timestamped = {created_at: string; updated_at: string};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Timestamped & {id: string; full_name: string | null; role: AppRole; active: boolean};
        Insert: {id: string; full_name?: string | null; role?: AppRole; active?: boolean};
        Update: {full_name?: string | null; role?: AppRole; active?: boolean; updated_at?: string};
        Relationships: [];
      };
      locations: {
        Row: Timestamped & {id: string; slug: string; name_vi: string; name_en: string; address_vi: string; address_en: string; district: string; city: string; latitude: number | null; longitude: number | null; phone: string | null; zalo_url: string | null; opening_hours: Json; status: LocationStatus; is_featured: boolean; sort_order: number};
        Insert: {id?: string; slug: string; name_vi: string; name_en: string; address_vi: string; address_en: string; district: string; city?: string; latitude?: number | null; longitude?: number | null; phone?: string | null; zalo_url?: string | null; opening_hours?: Json; status?: LocationStatus; is_featured?: boolean; sort_order?: number};
        Update: Partial<Database['public']['Tables']['locations']['Insert']>;
        Relationships: [];
      };
      unit_types: {
        Row: Timestamped & {id: string; slug: string; name_vi: string; name_en: string; area_m2: number; recommended_for_vi: string | null; recommended_for_en: string | null; capacity_note_vi: string | null; capacity_note_en: string | null; sort_order: number; active: boolean};
        Insert: {id?: string; slug: string; name_vi: string; name_en: string; area_m2: number; recommended_for_vi?: string | null; recommended_for_en?: string | null; capacity_note_vi?: string | null; capacity_note_en?: string | null; sort_order?: number; active?: boolean};
        Update: Partial<Database['public']['Tables']['unit_types']['Insert']>;
        Relationships: [];
      };
      location_unit_types: {
        Row: Timestamped & {id: string; location_id: string; unit_type_id: string; monthly_price: number | null; promo_price: number | null; deposit_amount: number | null; availability_status: AvailabilityStatus; available_count: number | null; featured: boolean};
        Insert: {id?: string; location_id: string; unit_type_id: string; monthly_price?: number | null; promo_price?: number | null; deposit_amount?: number | null; availability_status?: AvailabilityStatus; available_count?: number | null; featured?: boolean};
        Update: Partial<Database['public']['Tables']['location_unit_types']['Insert']>;
        Relationships: [];
      };
      media_assets: GenericTable;
      faqs: GenericTable;
      content_blocks: GenericTable;
      blog_posts: GenericTable;
      blog_translations: GenericTable;
      leads: GenericTable;
      lead_notes: GenericTable;
      lead_status_history: GenericTable;
      audit_log: GenericTable;
      site_settings: GenericTable;
      lead_rate_limits: GenericTable;
    };
    Views: Record<string, never>;
    Functions: {
      consume_lead_rate_limit: {
        Args: {p_fingerprint: string; p_limit?: number; p_window_seconds?: number};
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
      location_status: LocationStatus;
      availability_status: AvailabilityStatus;
      lead_status: LeadStatus;
      need_type: NeedType;
      estimated_volume: EstimatedVolume;
      media_category: MediaCategory;
    };
    CompositeTypes: Record<string, never>;
  };
};

type GenericTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};
