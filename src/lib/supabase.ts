import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          location: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          location?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          location?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          price: number | null;
          category_id: string | null;
          condition: string | null;
          condition_score: number | null;
          location: string | null;
          listing_type: 'for_sale' | 'wanted';
          images: string[];
          disc_speed: number | null;
          status: 'active' | 'sold' | 'deleted';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          price?: number | null;
          category_id?: string | null;
          condition?: string | null;
          condition_score?: number | null;
          location?: string | null;
          listing_type?: 'for_sale' | 'wanted';
          images?: string[];
          disc_speed?: number | null;
          status?: 'active' | 'sold' | 'deleted';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          price?: number | null;
          category_id?: string | null;
          condition?: string | null;
          condition_score?: number | null;
          location?: string | null;
          listing_type?: 'for_sale' | 'wanted';
          images?: string[];
          disc_speed?: number | null;
          status?: 'active' | 'sold' | 'deleted';
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          last_message_at: string;
          created_at: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          read?: boolean;
          created_at?: string;
        };
      };
      ratings: {
        Row: {
          id: string;
          rated_user_id: string;
          rater_user_id: string;
          listing_id: string | null;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          rated_user_id: string;
          rater_user_id: string;
          listing_id?: string | null;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
