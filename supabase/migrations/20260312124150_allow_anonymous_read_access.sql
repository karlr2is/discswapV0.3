/*
  # Allow Anonymous Read Access to Public Data

  ## Overview
  This migration updates Row Level Security policies to allow anonymous users
  to browse listings, categories, profiles, and ratings without authentication.
  Write operations still require authentication.

  ## Changes

  ### 1. Listings Table
  - Update SELECT policy to allow anonymous users to view active listings
  - Keep INSERT, UPDATE, DELETE policies requiring authentication

  ### 2. Categories Table
  - Update SELECT policy to allow anonymous users to view all categories

  ### 3. Profiles Table
  - Update SELECT policy to allow anonymous users to view public profiles

  ### 4. Ratings Table
  - Update SELECT policy to allow anonymous users to view ratings

  ## Security Notes
  - Only read operations are opened to anonymous users
  - All write operations (INSERT, UPDATE, DELETE) still require authentication
  - Sensitive data in messages and conversations remains authenticated-only
*/

-- Drop existing policies and recreate with anonymous access

-- Listings policies
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT
  USING (status = 'active' OR (auth.uid() IS NOT NULL AND user_id = auth.uid()));

-- Categories policies
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

-- Profiles policies
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

-- Ratings policies
DROP POLICY IF EXISTS "Anyone can view ratings" ON ratings;
CREATE POLICY "Anyone can view ratings"
  ON ratings FOR SELECT
  USING (true);