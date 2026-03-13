-- Create demo user if they don't exist
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT 
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'demo@discswap.com',
  crypt('demo123', gen_salt('bf')),
  current_timestamp,
  current_timestamp,
  current_timestamp,
  '{"provider":"email","providers":["email"]}',
  '{}',
  current_timestamp,
  current_timestamp,
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'demo@discswap.com'
);

-- Insert a public profile for the demo user
INSERT INTO public.profiles (
  id,
  username,
  avatar_url,
  location,
  bio,
  created_at,
  updated_at
)
SELECT
  id,
  'DemoUser',
  'https://images.unsplash.com/photo-1593081821815-a2f0739e8d35?auto=format&fit=crop&q=80&w=200&h=200',
  'Tallinn',
  'This is a demo account for testing out the DiscSwap platform! Feel free to browse around.',
  current_timestamp,
  current_timestamp
FROM auth.users
WHERE email = 'demo@discswap.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'demo@discswap.com' LIMIT 1)
);
