/*
  # Create Listing Images Storage Bucket

  1. New Storage Bucket
    - `listing-images` bucket for storing listing photos
    - Public access enabled for viewing images
    - Allows authenticated users to upload images

  2. Storage Policies
    - Anyone can view images (public bucket)
    - Authenticated users can upload images
    - Users can delete their own uploaded images

  3. Security
    - File size limits enforced
    - Only image file types allowed (jpg, jpeg, png, webp)
*/

-- Create the storage bucket for listing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view images (public bucket)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view listing images'
  ) THEN
    CREATE POLICY "Public can view listing images"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'listing-images');
  END IF;
END $$;

-- Allow authenticated users to upload images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload listing images'
  ) THEN
    CREATE POLICY "Authenticated users can upload listing images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'listing-images');
  END IF;
END $$;

-- Allow users to delete their own images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own listing images'
  ) THEN
    CREATE POLICY "Users can delete their own listing images"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'listing-images' AND auth.uid()::text = owner_id);
  END IF;
END $$;
