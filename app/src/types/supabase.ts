/**
 * Supabase Database type definitions
 * Auto-generated shape — keep in sync with your schema.
 *
 * To regenerate automatically:
 *   npx supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Enums ───────────────────────────────────────────────────
export type UserRole       = 'admin' | 'agent';
export type PropertyStatus = 'publicada' | 'borrador' | 'archivada';
export type PropertyOp     = 'venta' | 'alquiler';
export type PropertyType   = 'departamento' | 'casa' | 'oficina' | 'terreno' | 'local';
export type CurrencyType   = 'USD' | 'ARS';
export type LeadStatus     = 'nuevo' | 'contactado' | 'seguimiento' | 'cerrado' | 'descartado';
export type ArticleStatus  = 'publicado' | 'borrador';

// ─── Row types (what comes back from SELECT) ─────────────────
export interface ProfileRow {
  id:          string;
  role:        UserRole;
  full_name:   string;
  phone:       string | null;
  avatar_url:  string | null;
  bio:         string | null;
  created_at:  string;
  updated_at:  string;
}

export interface PropertyRow {
  id:           string;
  agent_id:     string | null;
  title:        string;
  slug:         string;
  description:  string | null;
  price:        number;
  currency:     CurrencyType;
  operation:    PropertyOp;
  type:         PropertyType;
  status:       PropertyStatus;
  featured:     boolean;
  location:     string;
  address:      string | null;
  map_url:      string | null;
  area:         number | null;
  covered_area: number | null;
  bedrooms:     number | null;
  bathrooms:    number | null;
  rooms:        number | null;
  parking:      number | null;
  age:          number | null;
  orientation:  string | null;
  expenses:     string | null;
  disposition:  string | null;
  badge:        string | null;
  badge_color:  string | null;
  meta_title:   string | null;
  meta_desc:    string | null;
  created_at:   string;
  updated_at:   string;
}

export interface PropertyImageRow {
  id:           string;
  property_id:  string;
  url:          string;
  storage_path: string | null;
  is_cover:     boolean;
  sort_order:   number;
  created_at:   string;
}

export interface AmenityRow {
  id:   string;
  name: string;
}

export interface PropertyAmenityRow {
  property_id: string;
  amenity_id:  string;
}

export interface LeadRow {
  id:             string;
  property_id:    string | null;
  assigned_to:    string | null;
  name:           string;
  email:          string;
  phone:          string | null;
  subject:        string | null;
  message:        string | null;
  status:         LeadStatus;
  notes:          string | null;
  source:         string | null;
  property_title: string | null;
  created_at:     string;
  updated_at:     string;
}

export interface BlogArticleRow {
  id:           string;
  author_id:    string | null;
  title:        string;
  slug:         string;
  excerpt:      string | null;
  content:      string | null;
  image:        string | null;
  storage_path: string | null;
  category:     string | null;
  read_time:    string | null;
  status:       ArticleStatus;
  published_at: string | null;
  // Campos desnormalizados (generados por trigger en la BD)
  author_name:  string | null;
  display_date: string | null;
  created_at:   string;
  updated_at:   string;
}

export interface TestimonialRow {
  id:           string;
  name:         string;
  role:         string | null;
  quote:        string;
  avatar_url:   string | null;
  storage_path: string | null;
  active:       boolean;
  sort_order:   number;
  created_at:   string;
  updated_at:   string;
}

export interface SettingRow {
  key:         string;
  value:       Json;
  description: string | null;
  updated_at:  string;
}

// ─── Insert types (what you send on INSERT) ──────────────────
export type ProfileInsert = Omit<ProfileRow, 'created_at' | 'updated_at'>;

export type PropertyInsert = Omit<PropertyRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type PropertyImageInsert = Omit<PropertyImageRow, 'id' | 'created_at'> & {
  id?: string;
};

export type LeadInsert = Omit<LeadRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  status?: LeadStatus;
};

export type BlogArticleInsert = Omit<BlogArticleRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type TestimonialInsert = Omit<TestimonialRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

// ─── Update types (partial, no id/timestamps) ────────────────
export type PropertyUpdate   = Partial<Omit<PropertyRow,   'id' | 'created_at' | 'updated_at'>>;
export type LeadUpdate       = Partial<Omit<LeadRow,       'id' | 'created_at' | 'updated_at'>>;
export type BlogArticleUpdate= Partial<Omit<BlogArticleRow,'id' | 'created_at' | 'updated_at'>>;
export type TestimonialUpdate= Partial<Omit<TestimonialRow,'id' | 'created_at' | 'updated_at'>>;
export type ProfileUpdate    = Partial<Omit<ProfileRow,    'id' | 'created_at' | 'updated_at'>>;

// ─── Rich types (with relations) ─────────────────────────────
export interface PropertyWithRelations extends PropertyRow {
  images:    PropertyImageRow[];
  amenities: string[];           // amenity names
  agent:     ProfileRow | null;
}

export interface LeadWithProperty extends LeadRow {
  property: Pick<PropertyRow, 'id' | 'title' | 'slug'> | null;
  agent:    Pick<ProfileRow, 'id' | 'full_name'> | null;
}

export interface ArticleWithAuthor extends BlogArticleRow {
  author: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url'> | null;
}

// ─── Pagination ───────────────────────────────────────────────
export interface PaginatedResult<T> {
  data:       T[];
  total:      number;
  page:       number;
  pageSize:   number;
  totalPages: number;
}

// ─── Search params ────────────────────────────────────────────
export interface PropertySearchParams {
  query?:      string;
  operation?:  PropertyOp;
  type?:       PropertyType;
  location?:   string;
  minPrice?:   number;
  maxPrice?:   number;
  minArea?:    number;
  maxArea?:    number;
  bedrooms?:   number;
  bathrooms?:  number;
  featured?:   boolean;
  currency?:   CurrencyType;
  page?:       number;
  pageSize?:   number;
}

// ─── Dashboard stats ──────────────────────────────────────────
export interface DashboardStats {
  total_properties:     number;
  published_properties: number;
  draft_properties:     number;
  total_leads:          number;
  new_leads:            number;
  leads_this_month:     number;
  total_articles:       number;
  published_articles:   number;
  total_testimonials:   number;
  leads_by_status:      Record<LeadStatus, number>;
  properties_by_type:   Record<PropertyType, number>;
  properties_by_op:     Record<PropertyOp, number>;
}

// ─── Supabase Database shape (for createClient<Database>) ────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row:    ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      properties: {
        Row:    PropertyRow;
        Insert: PropertyInsert;
        Update: PropertyUpdate;
      };
      property_images: {
        Row:    PropertyImageRow;
        Insert: PropertyImageInsert;
        Update: Partial<PropertyImageInsert>;
      };
      amenities: {
        Row:    AmenityRow;
        Insert: Omit<AmenityRow, 'id'> & { id?: string };
        Update: Partial<AmenityRow>;
      };
      property_amenities: {
        Row:    PropertyAmenityRow;
        Insert: PropertyAmenityRow;
        Update: PropertyAmenityRow;
      };
      leads: {
        Row:    LeadRow;
        Insert: LeadInsert;
        Update: LeadUpdate;
      };
      blog_articles: {
        Row:    BlogArticleRow;
        Insert: BlogArticleInsert;
        Update: BlogArticleUpdate;
      };
      testimonials: {
        Row:    TestimonialRow;
        Insert: TestimonialInsert;
        Update: TestimonialUpdate;
      };
      settings: {
        Row:    SettingRow;
        Insert: Omit<SettingRow, 'updated_at'>;
        Update: Partial<Omit<SettingRow, 'key' | 'updated_at'>>;
      };
    };
    Functions: {
      search_properties:   { Args: Record<string, unknown>; Returns: unknown[] };
      get_property_detail: { Args: { p_slug: string };      Returns: Json };
      get_dashboard_stats: { Args: Record<string, never>;   Returns: Json };
      assign_lead:         { Args: { p_lead_id: string; p_agent_id: string }; Returns: LeadRow };
      update_lead_status:  { Args: { p_lead_id: string; p_status: LeadStatus; p_notes?: string }; Returns: LeadRow };
      get_settings_map:    { Args: Record<string, never>;   Returns: Json };
      upsert_setting:      { Args: { p_key: string; p_value: Json }; Returns: SettingRow };
      is_admin:            { Args: Record<string, never>;   Returns: boolean };
      is_agent_or_admin:   { Args: Record<string, never>;   Returns: boolean };
    };
    Enums: {
      user_role:       UserRole;
      property_status: PropertyStatus;
      property_op:     PropertyOp;
      property_type:   PropertyType;
      currency_type:   CurrencyType;
      lead_status:     LeadStatus;
      article_status:  ArticleStatus;
    };
  };
}
