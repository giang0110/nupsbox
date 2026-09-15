// Synced from the NupsBox Supabase schema.
// Enum aliases are intentionally kept because application modules import them directly.
export type Json =
  | string
  | number
  | boolean
  | null
  | {[key: string]: Json | undefined}
  | Json[];

export type AppRole = 'admin' | 'staff' | 'viewer';
export type LocationStatus = 'active' | 'inactive' | 'coming_soon';
export type AvailabilityStatus = 'available' | 'limited' | 'sold_out' | 'contact';
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'viewing'
  | 'negotiating'
  | 'visit_scheduled'
  | 'visited'
  | 'won'
  | 'lost';
export type NeedType = 'shop_online' | 'sme' | 'inventory' | 'personal' | 'documents' | 'other';
export type EstimatedVolume = 'under_20_boxes' | 'boxes_20_50' | 'over_50_boxes' | 'unknown';
export type MediaCategory = 'hero' | 'location' | 'unit' | 'security' | 'exterior' | 'lifestyle' | 'blog';

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          id: number;
          metadata: Json;
          row_id: string | null;
          table_name: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          id?: never;
          metadata?: Json;
          row_id?: string | null;
          table_name: string;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          id?: never;
          metadata?: Json;
          row_id?: string | null;
          table_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_log_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      blog_posts: {
        Row: {
          author_id: string | null;
          cover_media_id: string | null;
          created_at: string;
          id: string;
          published_at: string | null;
          slug: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          cover_media_id?: string | null;
          created_at?: string;
          id?: string;
          published_at?: string | null;
          slug: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          cover_media_id?: string | null;
          created_at?: string;
          id?: string;
          published_at?: string | null;
          slug?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'blog_posts_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'blog_posts_cover_media_id_fkey';
            columns: ['cover_media_id'];
            isOneToOne: false;
            referencedRelation: 'media_assets';
            referencedColumns: ['id'];
          }
        ];
      };
      blog_translations: {
        Row: {
          blog_post_id: string;
          body: Json;
          created_at: string;
          excerpt: string | null;
          id: string;
          locale: string;
          seo_description: string | null;
          seo_title: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          blog_post_id: string;
          body?: Json;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          locale: string;
          seo_description?: string | null;
          seo_title?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          blog_post_id?: string;
          body?: Json;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          locale?: string;
          seo_description?: string | null;
          seo_title?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'blog_translations_blog_post_id_fkey';
            columns: ['blog_post_id'];
            isOneToOne: false;
            referencedRelation: 'blog_posts';
            referencedColumns: ['id'];
          }
        ];
      };
      content_blocks: {
        Row: {
          active: boolean;
          block_key: string;
          content_en: Json;
          content_vi: Json;
          created_at: string;
          id: string;
          page_key: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          block_key: string;
          content_en?: Json;
          content_vi?: Json;
          created_at?: string;
          id?: string;
          page_key: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          block_key?: string;
          content_en?: Json;
          content_vi?: Json;
          created_at?: string;
          id?: string;
          page_key?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          active: boolean;
          answer_en: string;
          answer_vi: string;
          created_at: string;
          id: string;
          question_en: string;
          question_vi: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          answer_en: string;
          answer_vi: string;
          created_at?: string;
          id?: string;
          question_en: string;
          question_vi: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          answer_en?: string;
          answer_vi?: string;
          created_at?: string;
          id?: string;
          question_en?: string;
          question_vi?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      lead_notes: {
        Row: {
          author_id: string | null;
          created_at: string;
          id: string;
          lead_id: string;
          note: string;
        };
        Insert: {
          author_id?: string | null;
          created_at?: string;
          id?: string;
          lead_id: string;
          note: string;
        };
        Update: {
          author_id?: string | null;
          created_at?: string;
          id?: string;
          lead_id?: string;
          note?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lead_notes_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lead_notes_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          }
        ];
      };
      lead_rate_limits: {
        Row: {
          fingerprint: string;
          request_count: number;
          updated_at: string;
          window_start: string;
        };
        Insert: {
          fingerprint: string;
          request_count?: number;
          updated_at?: string;
          window_start: string;
        };
        Update: {
          fingerprint?: string;
          request_count?: number;
          updated_at?: string;
          window_start?: string;
        };
        Relationships: [];
      };
      lead_status_history: {
        Row: {
          changed_by: string | null;
          created_at: string;
          from_status: LeadStatus | null;
          id: string;
          lead_id: string;
          to_status: LeadStatus;
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: LeadStatus | null;
          id?: string;
          lead_id: string;
          to_status: LeadStatus;
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: LeadStatus | null;
          id?: string;
          lead_id?: string;
          to_status?: LeadStatus;
        };
        Relationships: [
          {
            foreignKeyName: 'lead_status_history_changed_by_fkey';
            columns: ['changed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lead_status_history_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          }
        ];
      };
      leads: {
        Row: {
          assigned_to: string | null;
          created_at: string;
          email: string | null;
          estimated_volume: EstimatedVolume;
          full_name: string;
          id: string;
          landing_page: string | null;
          location_id: string | null;
          message: string | null;
          need_type: NeedType;
          phone: string;
          preferred_language: string;
          referrer: string | null;
          source: string | null;
          status: LeadStatus;
          unit_type_id: string | null;
          updated_at: string;
          utm_campaign: string | null;
          utm_content: string | null;
          utm_medium: string | null;
          utm_source: string | null;
        };
        Insert: {
          assigned_to?: string | null;
          created_at?: string;
          email?: string | null;
          estimated_volume?: EstimatedVolume;
          full_name: string;
          id?: string;
          landing_page?: string | null;
          location_id?: string | null;
          message?: string | null;
          need_type?: NeedType;
          phone: string;
          preferred_language?: string;
          referrer?: string | null;
          source?: string | null;
          status?: LeadStatus;
          unit_type_id?: string | null;
          updated_at?: string;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
        };
        Update: {
          assigned_to?: string | null;
          created_at?: string;
          email?: string | null;
          estimated_volume?: EstimatedVolume;
          full_name?: string;
          id?: string;
          landing_page?: string | null;
          location_id?: string | null;
          message?: string | null;
          need_type?: NeedType;
          phone?: string;
          preferred_language?: string;
          referrer?: string | null;
          source?: string | null;
          status?: LeadStatus;
          unit_type_id?: string | null;
          updated_at?: string;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'leads_assigned_to_fkey';
            columns: ['assigned_to'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leads_location_id_fkey';
            columns: ['location_id'];
            isOneToOne: false;
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leads_unit_type_id_fkey';
            columns: ['unit_type_id'];
            isOneToOne: false;
            referencedRelation: 'unit_types';
            referencedColumns: ['id'];
          }
        ];
      };
      location_unit_types: {
        Row: {
          availability_status: AvailabilityStatus;
          available_count: number | null;
          created_at: string;
          deposit_amount: number | null;
          featured: boolean;
          id: string;
          location_id: string;
          monthly_price: number | null;
          promo_price: number | null;
          unit_type_id: string;
          updated_at: string;
        };
        Insert: {
          availability_status?: AvailabilityStatus;
          available_count?: number | null;
          created_at?: string;
          deposit_amount?: number | null;
          featured?: boolean;
          id?: string;
          location_id: string;
          monthly_price?: number | null;
          promo_price?: number | null;
          unit_type_id: string;
          updated_at?: string;
        };
        Update: {
          availability_status?: AvailabilityStatus;
          available_count?: number | null;
          created_at?: string;
          deposit_amount?: number | null;
          featured?: boolean;
          id?: string;
          location_id?: string;
          monthly_price?: number | null;
          promo_price?: number | null;
          unit_type_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'location_unit_types_location_id_fkey';
            columns: ['location_id'];
            isOneToOne: false;
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'location_unit_types_unit_type_id_fkey';
            columns: ['unit_type_id'];
            isOneToOne: false;
            referencedRelation: 'unit_types';
            referencedColumns: ['id'];
          }
        ];
      };
      locations: {
        Row: {
          address_en: string;
          address_vi: string;
          city: string;
          created_at: string;
          district: string;
          id: string;
          is_featured: boolean;
          latitude: number | null;
          longitude: number | null;
          name_en: string;
          name_vi: string;
          opening_hours: Json;
          phone: string | null;
          slug: string;
          sort_order: number;
          status: LocationStatus;
          updated_at: string;
          zalo_url: string | null;
        };
        Insert: {
          address_en: string;
          address_vi: string;
          city?: string;
          created_at?: string;
          district: string;
          id?: string;
          is_featured?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name_en: string;
          name_vi: string;
          opening_hours?: Json;
          phone?: string | null;
          slug: string;
          sort_order?: number;
          status?: LocationStatus;
          updated_at?: string;
          zalo_url?: string | null;
        };
        Update: {
          address_en?: string;
          address_vi?: string;
          city?: string;
          created_at?: string;
          district?: string;
          id?: string;
          is_featured?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name_en?: string;
          name_vi?: string;
          opening_hours?: Json;
          phone?: string | null;
          slug?: string;
          sort_order?: number;
          status?: LocationStatus;
          updated_at?: string;
          zalo_url?: string | null;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          alt_en: string;
          alt_vi: string;
          category: MediaCategory;
          created_at: string;
          id: string;
          is_public: boolean;
          location_id: string | null;
          sort_order: number;
          storage_path: string;
          unit_type_id: string | null;
          updated_at: string;
        };
        Insert: {
          alt_en?: string;
          alt_vi?: string;
          category: MediaCategory;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          location_id?: string | null;
          sort_order?: number;
          storage_path: string;
          unit_type_id?: string | null;
          updated_at?: string;
        };
        Update: {
          alt_en?: string;
          alt_vi?: string;
          category?: MediaCategory;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          location_id?: string | null;
          sort_order?: number;
          storage_path?: string;
          unit_type_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'media_assets_location_id_fkey';
            columns: ['location_id'];
            isOneToOne: false;
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'media_assets_unit_type_id_fkey';
            columns: ['unit_type_id'];
            isOneToOne: false;
            referencedRelation: 'unit_types';
            referencedColumns: ['id'];
          }
        ];
      };
      profiles: {
        Row: {
          active: boolean;
          created_at: string;
          full_name: string | null;
          id: string;
          role: AppRole;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          full_name?: string | null;
          id: string;
          role?: AppRole;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          role?: AppRole;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          created_at: string;
          is_public: boolean;
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: Json;
        };
        Insert: {
          created_at?: string;
          is_public?: boolean;
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Update: {
          created_at?: string;
          is_public?: boolean;
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'site_settings_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      unit_types: {
        Row: {
          active: boolean;
          area_m2: number;
          capacity_note_en: string | null;
          capacity_note_vi: string | null;
          created_at: string;
          id: string;
          name_en: string;
          name_vi: string;
          recommended_for_en: string | null;
          recommended_for_vi: string | null;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          area_m2: number;
          capacity_note_en?: string | null;
          capacity_note_vi?: string | null;
          created_at?: string;
          id?: string;
          name_en: string;
          name_vi: string;
          recommended_for_en?: string | null;
          recommended_for_vi?: string | null;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          area_m2?: number;
          capacity_note_en?: string | null;
          capacity_note_vi?: string | null;
          created_at?: string;
          id?: string;
          name_en?: string;
          name_vi?: string;
          recommended_for_en?: string | null;
          recommended_for_vi?: string | null;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      consume_lead_rate_limit: {
        Args: {
          p_fingerprint: string;
          p_limit?: number;
          p_window_seconds?: number;
        };
        Returns: boolean;
      };
      current_app_role: {
        Args: never;
        Returns: AppRole;
      };
      is_admin: {
        Args: never;
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
      availability_status: AvailabilityStatus;
      estimated_volume: EstimatedVolume;
      lead_status: LeadStatus;
      location_status: LocationStatus;
      media_category: MediaCategory;
      need_type: NeedType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};