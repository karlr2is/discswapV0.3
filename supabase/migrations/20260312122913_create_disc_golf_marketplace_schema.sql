/*
  # Disc Golf Marketplace Database Schema

  ## Overview
  Complete database schema for a disc golf marketplace platform where users can list
  items for sale or wanted, browse listings, message sellers, and rate each other.

  ## New Tables

  ### 1. profiles
  Extended user profile information linked to auth.users
  - `id` (uuid, primary key, references auth.users)
  - `username` (text, unique, required)
  - `avatar_url` (text, optional)
  - `location` (text, optional - city name)
  - `bio` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. categories
  Disc golf gear categories for organizing listings
  - `id` (uuid, primary key)
  - `name` (text, unique)
  - `slug` (text, unique)
  - `created_at` (timestamptz)

  ### 3. listings
  Items for sale or wanted listings
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text, required)
  - `description` (text)
  - `price` (decimal)
  - `category_id` (uuid, references categories)
  - `condition` (text - New/Like New/Used/Heavily Used)
  - `condition_score` (integer 1-10)
  - `location` (text - city)
  - `listing_type` (text - for_sale or wanted)
  - `images` (text array - image URLs)
  - `disc_speed` (integer, optional - for disc categorization)
  - `status` (text - active/sold/deleted)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. conversations
  Message threads between buyers and sellers
  - `id` (uuid, primary key)
  - `listing_id` (uuid, references listings)
  - `buyer_id` (uuid, references profiles)
  - `seller_id` (uuid, references profiles)
  - `last_message_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 5. messages
  Individual messages within conversations
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, references conversations)
  - `sender_id` (uuid, references profiles)
  - `content` (text)
  - `read` (boolean)
  - `created_at` (timestamptz)

  ### 6. ratings
  User ratings and reviews
  - `id` (uuid, primary key)
  - `rated_user_id` (uuid, references profiles)
  - `rater_user_id` (uuid, references profiles)
  - `listing_id` (uuid, optional, references listings)
  - `rating` (integer 1-5)
  - `comment` (text, optional)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Authenticated users can read most data
  - Users can only modify their own data
  - Specific policies for each table based on ownership and access patterns
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  location text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price decimal(10, 2),
  category_id uuid REFERENCES categories(id),
  condition text,
  condition_score integer CHECK (condition_score >= 1 AND condition_score <= 10),
  location text,
  listing_type text NOT NULL DEFAULT 'for_sale' CHECK (listing_type IN ('for_sale', 'wanted')),
  images text[] DEFAULT '{}',
  disc_speed integer CHECK (disc_speed >= 1 AND disc_speed <= 14),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'deleted')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(listing_id, buyer_id, seller_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rated_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rater_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(rated_user_id, rater_user_id, listing_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rated_user_id ON ratings(rated_user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Categories policies (read-only for users)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Listings policies
CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT
  TO authenticated
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can create their own listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

-- Ratings policies
CREATE POLICY "Anyone can view ratings"
  ON ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create ratings"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = rater_user_id AND rater_user_id != rated_user_id);

CREATE POLICY "Users can update their own ratings"
  ON ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = rater_user_id)
  WITH CHECK (auth.uid() = rater_user_id);

-- Insert default categories
INSERT INTO categories (name, slug) VALUES
  ('Drivers', 'drivers'),
  ('Midrange', 'midrange'),
  ('Putters', 'putters'),
  ('Bags', 'bags'),
  ('Carts', 'carts'),
  ('Accessories', 'accessories'),
  ('Apparel', 'apparel'),
  ('Other', 'other')
ON CONFLICT (slug) DO NOTHING;

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, created_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp on new message
DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();