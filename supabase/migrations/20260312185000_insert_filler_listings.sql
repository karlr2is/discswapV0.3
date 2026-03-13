-- Insert filler listings for the DiscSwap demo
-- All listings are owned by the demo user

DO $$
DECLARE
  demo_user_id uuid;

  -- Disc category IDs
  cat_distance_drivers uuid;
  cat_fairway_drivers   uuid;
  cat_midranges         uuid;
  cat_putters           uuid;

  -- Gear category IDs
  cat_bags              uuid;
  cat_carts             uuid;
  cat_baskets           uuid;
  cat_clothing          uuid;
  cat_accessories       uuid;

BEGIN
  -- Get demo user ID
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@discswap.com' LIMIT 1;

  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'Demo user not found. Please run the create_demo_user migration first.';
  END IF;

  -- Get category IDs
  SELECT id INTO cat_distance_drivers FROM categories WHERE slug = 'distance-drivers' LIMIT 1;
  SELECT id INTO cat_fairway_drivers   FROM categories WHERE slug = 'fairway-drivers'  LIMIT 1;
  SELECT id INTO cat_midranges         FROM categories WHERE slug = 'midranges'        LIMIT 1;
  SELECT id INTO cat_putters           FROM categories WHERE slug = 'putters'          LIMIT 1;
  SELECT id INTO cat_bags              FROM categories WHERE slug = 'bags'             LIMIT 1;
  SELECT id INTO cat_carts             FROM categories WHERE slug = 'carts'            LIMIT 1;
  SELECT id INTO cat_baskets           FROM categories WHERE slug = 'baskets'          LIMIT 1;
  SELECT id INTO cat_clothing          FROM categories WHERE slug = 'clothing'         LIMIT 1;
  SELECT id INTO cat_accessories       FROM categories WHERE slug = 'accessories'      LIMIT 1;

  -- =====================
  -- DISTANCE DRIVERS
  -- =====================
  INSERT INTO listings (user_id, title, description, price, category_id, condition, condition_score, location, listing_type, images, disc_speed, status)
  VALUES
  (
    demo_user_id,
    'Innova Destroyer - Star Plastic (175g, Blue)',
    'Classic overstable distance driver in excellent shape. Lightly used, still has the ink stamp. Great for powerful throwers or into-the-wind shots. Flies true and fades reliably.',
    12.00,
    cat_distance_drivers,
    'Like New',
    9,
    'Tallinn',
    'for_sale',
    ARRAY['https://images.unsplash.com/photo-1655682748734-ef2e63c76c37?auto=format&fit=crop&q=80&w=600'],
    13,
    'active'
  ),
  (
    demo_user_id,
    'Discraft Nuke - Z Line (173g, Red)',
    'A real bomber for big arms. This one is well-seasoned — flew straight for its first 20 rounds and now has a consistent, controllable fade. Grip marks on the rim, flight plate is clean.',
    8.00,
    cat_distance_drivers,
    'Used',
    7,
    'Tartu',
    'for_sale',
    ARRAY['https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?auto=format&fit=crop&q=80&w=600'],
    13,
    'active'
  ),
  (
    demo_user_id,
    'MVP Neutron Catalyst (170g, White)',
    'Understable distance driver, great for hyzer flip lines or long turnover shots. Still has good pop to it. One small scuff from a tree hit, otherwise nearly perfect.',
    14.00,
    cat_distance_drivers,
    'Like New',
    8,
    'Pärnu',
    'for_sale',
    ARRAY['https://images.unsplash.com/photo-1595586964632-b215dfbc064a?auto=format&fit=crop&q=80&w=600'],
    12,
    'active'
  );

  -- =====================
  -- FAIRWAY DRIVERS
  -- =====================
  INSERT INTO listings (user_id, title, description, price, category_id, condition, condition_score, location, listing_type, images, disc_speed, status)
  VALUES
  (
    demo_user_id,
    'Innova Teebird3 - Champion (175g, Orange)',
    'The most versatile fairway driver I have ever thrown. Neutral high-speed, consistent low-speed fade. I switched to a Star version so this Champion is looking for a new home. Minimal wear.',
    13.00,
    cat_fairway_drivers,
    'Like New',
    9,
    'Tallinn',
    'for_sale',
    ARRAY['https://images.unsplash.com/photo-1676310890524-b68bae6ca3d2?auto=format&fit=crop&q=80&w=600'],
    9,
    'active'
  ),
  (
    demo_user_id,
    'Westside Discs Sword (180g, Yellow)',
    'Straight-flying, max-weight fairway driver. Perfect for tight fairways. Shows some typical field use marks but nothing serious. Still very usable.',
    9.00,
    cat_fairway_drivers,
    'Used',
    7,
    'Rakvere',
    'for_sale',
    ARRAY['https://images.unsplash.com/photo-1592772791973-a78b9e72c2bb?auto=format&fit=crop&q=80&w=600'],
    9,
    'active'
  );

  -- =====================
  -- MIDRANGES
  -- =====================
  INSERT INTO listings (user_id, title, description, price, category_id, condition, condition_score, location, listing_type, images, disc_speed, status)
  VALUES
  (
    demo_user_id,
    'Discraft Buzzz - Z Line (177g, Pearl)',
    'The iconic neutral midrange. This one is well broken-in, so it flies dead straight even at lower release angles. Perfect for approach shots. Very light disc marks.',
    10.00,
    cat_midranges,
    'Used',
    8,
    'Tallinn',
    'for_sale',
    ARRAY['https://images.unsplash.com/photo-1643116774075-acc00caa9a7b?auto=format&fit=crop&q=80&w=600'],
    5,
    'active'
  ),
  (
    demo_user_id,
    'Latitude 64 Compass (175g, Pink)',
    'Gentle overstable midrange with a reliable, predictable finish. Very clean condition, only thrown at the field to tune my bag. Comes with a protective sleeve.',
    11.00,
    cat_midranges,
    'Like New',
    9,
    'Viljandi',
    'for_sale',
    ARRAY['https://images.unsplash.com/photo-1604537466573-5e94508fd243?auto=format&fit=crop&q=80&w=600'],
    5,
    'active'
  ),
  (
    demo_user_id,
    'Dynamic Discs Verdict (176g, Green)',
    'Looking for a used Verdict midrange in good condition. Prefer green or yellow. Please no heavily damaged discs.',
    NULL,
    cat_midranges,
    NULL,
    NULL,
    'Tartu',
    'wanted',
    ARRAY[]::text[],
    5,
    'active'
  );

  -- =====================
  -- PUTTERS
  -- =====================
  INSERT INTO listings (user_id, title, description, price, category_id, condition, condition_score, location, listing_type, images, disc_speed, status)
  VALUES
  (
    demo_user_id,
    'Innova Aviar - DX (175g, White) — Classic Field Putter',
    'The OG putter. This one has been my main field disc for a full season. Beautifully flattened out, flies like a dream now. Some scuffs but holds lines perfectly. A collectors piece.',
    6.00,
    cat_putters,
    'Used',
    6,
    'Tallinn',
    'for_sale',
    ARRAY['https://images.unsplash.com/photo-1655682748734-ef2e63c76c37?auto=format&fit=crop&q=80&w=600'],
    2,
    'active'
  ),
  (
    demo_user_id,
    'Kastaplast Berg (176g, Black) — Premium Putter',
    'Brand new run of Swedish plastic. Ultra-gummy feel on the rim. Top shelf putter that holds any line. Never been round-played, only thrown for putts on a pro basket. Pristine condition.',
    18.00,
    cat_putters,
    'New',
    10,
    'Tallinn',
    'for_sale',
    ARRAY['https://images.unsplash.com/photo-1604537466573-5e94508fd243?auto=format&fit=crop&q=80&w=600'],
    1,
    'active'
  );

  -- =====================
  -- BAGS
  -- =====================
  INSERT INTO listings (user_id, title, description, price, category_id, condition, condition_score, location, listing_type, images, disc_speed, status)
  VALUES
  (
    demo_user_id,
    'Latitude 64 Core Bag (Grey/Teal)',
    'Lightweight, compact bag — fits up to 10-12 discs perfectly. Great for casual rounds or practice. One small repair on the zipper pull with a keyring. Fully functional and clean inside.',
    25.00,
    cat_bags,
    'Used',
    7,
    'Tallinn',
    'for_sale',
    ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600'],
    NULL,
    'active'
  ),
  (
    demo_user_id,
    'Discmania Fanatic Backpack (Black)',
    'Great condition backpack with room for 20+ discs. Multiple pockets, built-in rain cover, padded straps. Selling because I upgraded to a cart. Kept clean and dry, minor scuff on back panel.',
    60.00,
    cat_bags,
    'Like New',
    8,
    'Tartu',
    'for_sale',
    ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600'],
    NULL,
    'active'
  );

  -- =====================
  -- CARTS
  -- =====================
  INSERT INTO listings (user_id, title, description, price, category_id, condition, condition_score, location, listing_type, images, disc_speed, status)
  VALUES
  (
    demo_user_id,
    'Zuca All-Terrain Cart (Black/Red) with Bag',
    'Changed my life on hilly courses. Includes full bag insert with built-in stool seat and cup holders. Has been through two seasons, wheels in great shape, only minor rust on underframe. Also includes umbrella mount.',
    140.00,
    cat_carts,
    'Used',
    7,
    'Pärnu',
    'for_sale',
    ARRAY['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600'],
    NULL,
    'active'
  ),
  (
    demo_user_id,
    'Wanted: Disc Golf Cart, any brand',
    'Looking for a good condition disc golf pull cart / trolley. Happy with Zuca, Rovic, Power Hands or similar. Budget around 80-100 EUR. Must be in Estonia.',
    NULL,
    cat_carts,
    NULL,
    NULL,
    'Tallinn',
    'wanted',
    ARRAY[]::text[],
    NULL,
    'active'
  );

  -- =====================
  -- BASKETS
  -- =====================
  INSERT INTO listings (user_id, title, description, price, category_id, condition, condition_score, location, listing_type, images, disc_speed, status)
  VALUES
  (
    demo_user_id,
    'DGA Mach III Practice Basket (Portable)',
    'Folds down for easy transport. Very handy for backyard putting practice. Has some rust on the chains but catches perfectly. Includes carry bag.',
    35.00,
    cat_baskets,
    'Used',
    6,
    'Tallinn',
    'for_sale',
    ARRAY['https://images.unsplash.com/photo-1468436139062-f60851436e90?auto=format&fit=crop&q=80&w=600'],
    NULL,
    'active'
  );

  -- =====================
  -- CLOTHING
  -- =====================
  INSERT INTO listings (user_id, title, description, price, category_id, condition, condition_score, location, listing_type, images, disc_speed, status)
  VALUES
  (
    demo_user_id,
    'Innova Technical Polo Shirt (L, Blue)',
    'Size Large. Worn only 4-5 rounds. Moisture-wicking, lightweight fabric. No stains, no fading. Great shirt for summer rounds.',
    14.00,
    cat_clothing,
    'Like New',
    9,
    'Tallinn',
    'for_sale',
    ARRAY['https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=600'],
    NULL,
    'active'
  ),
  (
    demo_user_id,
    'Discmania Windbreaker Jacket (M, Black)',
    'Very light, packable windbreaker. Fits in its own pocket. Great for early morning or late evening rounds on cool days. Used twice. As new.',
    30.00,
    cat_clothing,
    'Like New',
    9,
    'Tartu',
    'for_sale',
    ARRAY['https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=600'],
    NULL,
    'active'
  );

  -- =====================
  -- ACCESSORIES
  -- =====================
  INSERT INTO listings (user_id, title, description, price, category_id, condition, condition_score, location, listing_type, images, disc_speed, status)
  VALUES
  (
    demo_user_id,
    'Mini Marker Disc Set (5 pcs, Mixed Colors)',
    'Set of 5 different-colored mini marker discs. All in great shape. Various brands. Selling as a bundle.',
    7.00,
    cat_accessories,
    'Used',
    8,
    'Tallinn',
    'for_sale',
    ARRAY['https://images.unsplash.com/photo-1655682748734-ef2e63c76c37?auto=format&fit=crop&q=80&w=600'],
    NULL,
    'active'
  ),
  (
    demo_user_id,
    'Disc Retriever / Water Floating Rope Tool',
    'Brand new, never used. Essential for water hazards. Telescoping pole with hook. Saves you a lot of money on lost discs at water obstacles.',
    15.00,
    cat_accessories,
    'New',
    10,
    'Tallinn',
    'for_sale',
    ARRAY['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600'],
    NULL,
    'active'
  );

END $$;
