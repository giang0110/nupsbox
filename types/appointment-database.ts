import type {Database, Json} from './database';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type AppointmentSource = 'customer' | 'staff';

export type LeadAppointmentRow = {
  id: string;
  lead_id: string;
  location_id: string | null;
  unit_type_id: string | null;
  assigned_to: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  source: AppointmentSource;
  customer_note: string | null;
  internal_note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadAppointmentInsert = {
  id?: string;
  lead_id: string;
  location_id?: string | null;
  unit_type_id?: string | null;
  assigned_to?: string | null;
  scheduled_at: string;
  duration_minutes?: number;
  status?: AppointmentStatus;
  source: AppointmentSource;
  customer_note?: string | null;
  internal_note?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type LeadAppointmentUpdate = Partial<Omit<LeadAppointmentRow, 'id' | 'lead_id' | 'source' | 'created_by' | 'created_at'>>;

export type LeadAppointmentHistoryRow = {
  id: string;
  appointment_id: string;
  lead_id: string;
  changed_by: string | null;
  event_type: 'created' | 'rescheduled' | 'location_changed' | 'unit_type_changed' | 'assignee_changed' | 'status_changed' | 'details_changed';
  before_state: Json | null;
  after_state: Json;
  created_at: string;
};

export type DatabaseWithAppointments = Omit<Database, 'public'> & {
  public: Omit<Database['public'], 'Tables' | 'Functions' | 'Enums'> & {
    Tables: Database['public']['Tables'] & {
      lead_appointments: {
        Row: LeadAppointmentRow;
        Insert: LeadAppointmentInsert;
        Update: LeadAppointmentUpdate;
        Relationships: [
          {foreignKeyName: 'lead_appointments_lead_id_fkey'; columns: ['lead_id']; isOneToOne: false; referencedRelation: 'leads'; referencedColumns: ['id']},
          {foreignKeyName: 'lead_appointments_location_id_fkey'; columns: ['location_id']; isOneToOne: false; referencedRelation: 'locations'; referencedColumns: ['id']},
          {foreignKeyName: 'lead_appointments_unit_type_id_fkey'; columns: ['unit_type_id']; isOneToOne: false; referencedRelation: 'unit_types'; referencedColumns: ['id']},
          {foreignKeyName: 'lead_appointments_assigned_to_fkey'; columns: ['assigned_to']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id']},
          {foreignKeyName: 'lead_appointments_created_by_fkey'; columns: ['created_by']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id']}
        ];
      };
      lead_appointment_history: {
        Row: LeadAppointmentHistoryRow;
        Insert: {
          id?: string;
          appointment_id: string;
          lead_id: string;
          changed_by?: string | null;
          event_type: LeadAppointmentHistoryRow['event_type'];
          before_state?: Json | null;
          after_state: Json;
          created_at?: string;
        };
        Update: never;
        Relationships: [
          {foreignKeyName: 'lead_appointment_history_appointment_id_fkey'; columns: ['appointment_id']; isOneToOne: false; referencedRelation: 'lead_appointments'; referencedColumns: ['id']},
          {foreignKeyName: 'lead_appointment_history_lead_id_fkey'; columns: ['lead_id']; isOneToOne: false; referencedRelation: 'leads'; referencedColumns: ['id']},
          {foreignKeyName: 'lead_appointment_history_changed_by_fkey'; columns: ['changed_by']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id']}
        ];
      };
    };
    Functions: Database['public']['Functions'] & {
      submit_public_lead_request: {
        Args: {p_lead: Json; p_appointment?: Json | null};
        Returns: Json;
      };
    };
    Enums: Database['public']['Enums'] & {
      appointment_status: AppointmentStatus;
      appointment_source: AppointmentSource;
    };
  };
};
