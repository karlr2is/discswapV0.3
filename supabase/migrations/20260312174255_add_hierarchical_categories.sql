/*
  # Add Hierarchical Category Support

  ## Overview
  Adds parent-child relationship support to the categories table to enable
  a two-level category hierarchy (main categories with subcategories).

  ## Changes Made

  ### 1. Schema Updates
  - Add `parent_id` column to categories table (nullable, references categories.id)
  - Add index on parent_id for better query performance

  ### 2. Data Migration
  - Create new parent categories: "Discs", "Bags & Carts", "Other Gear"
  - Reorganize existing categories as subcategories:
    - Under "Discs": Distance Drivers, Fairway Drivers, Midranges, Putters
    - Under "Bags & Carts": Bags, Carts
    - Under "Other Gear": Baskets, Clothing, Accessories
  - Migrate existing listings to new category structure

  ### 3. Important Notes
  - Existing listings are migrated to appropriate new subcategories
  - Parent categories (Discs, Bags & Carts, Other Gear) are display-only
  - Only subcategories can be assigned to listings
*/

-- Add parent_id column to categories table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE categories ADD COLUMN parent_id uuid REFERENCES categories(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for parent_id
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Reorganize categories
DO $$
DECLARE
  old_drivers_id uuid;
  old_midrange_id uuid;
  old_putters_id uuid;
  old_apparel_id uuid;
  old_accessories_id uuid;
  
  parent_discs_id uuid;
  parent_bags_carts_id uuid;
  parent_other_gear_id uuid;
  
  new_distance_drivers_id uuid;
  new_fairway_drivers_id uuid;
  new_midranges_id uuid;
  new_baskets_id uuid;
  new_clothing_id uuid;
BEGIN
  -- Get old category IDs
  SELECT id INTO old_drivers_id FROM categories WHERE slug = 'drivers';
  SELECT id INTO old_midrange_id FROM categories WHERE slug = 'midrange';
  SELECT id INTO old_putters_id FROM categories WHERE slug = 'putters';
  SELECT id INTO old_apparel_id FROM categories WHERE slug = 'apparel';
  SELECT id INTO old_accessories_id FROM categories WHERE slug = 'accessories';

  -- Create parent categories
  INSERT INTO categories (name, slug) VALUES ('Discs', 'discs') ON CONFLICT (slug) DO NOTHING;
  INSERT INTO categories (name, slug) VALUES ('Bags & Carts', 'bags-carts') ON CONFLICT (slug) DO NOTHING;
  INSERT INTO categories (name, slug) VALUES ('Other Gear', 'other-gear') ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO parent_discs_id FROM categories WHERE slug = 'discs';
  SELECT id INTO parent_bags_carts_id FROM categories WHERE slug = 'bags-carts';
  SELECT id INTO parent_other_gear_id FROM categories WHERE slug = 'other-gear';

  -- Create new disc subcategories
  INSERT INTO categories (name, slug, parent_id) VALUES ('Distance Drivers', 'distance-drivers', parent_discs_id) ON CONFLICT (slug) DO NOTHING;
  INSERT INTO categories (name, slug, parent_id) VALUES ('Fairway Drivers', 'fairway-drivers', parent_discs_id) ON CONFLICT (slug) DO NOTHING;
  INSERT INTO categories (name, slug, parent_id) VALUES ('Midranges', 'midranges', parent_discs_id) ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO new_distance_drivers_id FROM categories WHERE slug = 'distance-drivers';
  SELECT id INTO new_fairway_drivers_id FROM categories WHERE slug = 'fairway-drivers';
  SELECT id INTO new_midranges_id FROM categories WHERE slug = 'midranges';

  -- Migrate listings from old Drivers to Distance Drivers
  IF old_drivers_id IS NOT NULL AND new_distance_drivers_id IS NOT NULL THEN
    UPDATE listings SET category_id = new_distance_drivers_id WHERE category_id = old_drivers_id;
  END IF;

  -- Migrate listings from old Midrange to new Midranges
  IF old_midrange_id IS NOT NULL AND new_midranges_id IS NOT NULL THEN
    UPDATE listings SET category_id = new_midranges_id WHERE category_id = old_midrange_id;
  END IF;

  -- Update existing Putters to be a subcategory under Discs
  UPDATE categories SET parent_id = parent_discs_id WHERE slug = 'putters';

  -- Update existing Bags and Carts to be subcategories under Bags & Carts
  UPDATE categories SET parent_id = parent_bags_carts_id WHERE slug = 'bags';
  UPDATE categories SET parent_id = parent_bags_carts_id WHERE slug = 'carts';

  -- Create new Other Gear subcategories
  INSERT INTO categories (name, slug, parent_id) VALUES ('Baskets', 'baskets', parent_other_gear_id) ON CONFLICT (slug) DO NOTHING;
  INSERT INTO categories (name, slug, parent_id) VALUES ('Clothing', 'clothing', parent_other_gear_id) ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO new_baskets_id FROM categories WHERE slug = 'baskets';
  SELECT id INTO new_clothing_id FROM categories WHERE slug = 'clothing';

  -- Migrate listings from old Apparel to Clothing
  IF old_apparel_id IS NOT NULL AND new_clothing_id IS NOT NULL THEN
    UPDATE listings SET category_id = new_clothing_id WHERE category_id = old_apparel_id;
  END IF;

  -- Update existing Accessories to be a subcategory under Other Gear
  UPDATE categories SET parent_id = parent_other_gear_id WHERE slug = 'accessories';

  -- Delete old categories that have been replaced
  DELETE FROM categories WHERE slug IN ('drivers', 'midrange', 'apparel', 'other');
END $$;
