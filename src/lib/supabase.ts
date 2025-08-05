import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Typy bazy danych
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          updated_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          user_id: string | null;
          brand: string;
          model: string;
          plate: string;
          type: 'motor' | 'auto-osobowe' | 'dostawcze' | 'inne';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          brand: string;
          model: string;
          plate: string;
          type: 'motor' | 'auto-osobowe' | 'dostawcze' | 'inne';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          brand?: string;
          model?: string;
          plate?: string;
          type?: 'motor' | 'auto-osobowe' | 'dostawcze' | 'inne';
          updated_at?: string;
        };
      };
      parking_spaces: {
        Row: {
          id: string;
          number: string;
          type: 'motor' | 'auto-osobowe' | 'dostawcze' | 'inne';
          is_occupied: boolean;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          number: string;
          type: 'motor' | 'auto-osobowe' | 'dostawcze' | 'inne';
          is_occupied?: boolean;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          number?: string;
          type?: 'motor' | 'auto-osobowe' | 'dostawcze' | 'inne';
          is_occupied?: boolean;
          user_id?: string | null;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string | null;
          amount: number;
          date: string;
          status: 'paid' | 'pending' | 'overdue';
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          amount: number;
          date?: string;
          status?: 'paid' | 'pending' | 'overdue';
          description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          amount?: number;
          date?: string;
          status?: 'paid' | 'pending' | 'overdue';
          description?: string;
          updated_at?: string;
        };
      };
    };
  };
}