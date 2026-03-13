/*
  # Create Favorites System

  1. New Tables
    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `listing_id` (uuid, references listings)
      - `created_at` (timestamptz)
      - Unique constraint on (user_id, listing_id)

  2. Security
    - Enable RLS on `favorites` table
    - Users can view their own favorites
    - Users can add their own favorites
    - Users can remove their own favorites

  3. Functions
    - Add function to count favorites per listing
*/

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'favorites' 
    AND policyname = 'Users can view own favorites'
  ) THEN
    CREATE POLICY "Users can view own favorites"
      ON favorites
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can add favorites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'favorites' 
    AND policyname = 'Users can add favorites'
  ) THEN
    CREATE POLICY "Users can add favorites"
      ON favorites
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Users can remove their own favorites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'favorites' 
    AND policyname = 'Users can remove own favorites'
  ) THEN
    CREATE POLICY "Users can remove own favorites"
      ON favorites
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_listing_id_idx ON favorites(listing_id);
