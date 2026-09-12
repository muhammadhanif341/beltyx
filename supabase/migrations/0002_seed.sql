-- Sample catalog data for local development / design review.
-- Product imagery uses neutral placehold.co swatches in Beltyx tones — replace
-- with real product photography (via the admin Products page) before launch.

insert into public.categories (name, slug, description, icon, sort_order) values
  ('Wallets', 'wallets', 'Slim and bifold leather wallets.', 'wallet', 1),
  ('Belts', 'belts', 'Full-grain leather belts for every occasion.', 'circle-dot', 2),
  ('Card Holders', 'card-holders', 'Minimalist cardholders that fit any pocket.', 'credit-card', 3),
  ('Money Clips', 'money-clips', 'Slim metal-and-leather money clips.', 'banknote', 4),
  ('Gift Sets', 'gift-sets', 'Curated wallet-and-belt gift sets.', 'gift', 5),
  ('Accessories', 'accessories', 'Keychains, luggage tags, and more.', 'sparkles', 6);

with cat as (select id, slug from public.categories)
insert into public.products
  (category_id, name, slug, description, care_instructions, price, compare_at_price, material, sku, is_featured, is_new, stock, rating_avg, rating_count)
values
  ((select id from cat where slug = 'wallets'), 'Heritage Bifold Wallet', 'heritage-bifold-wallet',
    'A timeless bifold crafted from full-grain leather, hand-burnished at the edges and finished to develop a rich patina over time.',
    'Wipe clean with a dry cloth. Condition every 3-6 months with a quality leather balm. Avoid prolonged water exposure.',
    59.00, 79.00, 'Full-grain leather', 'BX-WAL-001', true, false, 24, 4.8, 36),
  ((select id from cat where slug = 'wallets'), 'Slimline Card Wallet', 'slimline-card-wallet',
    'Minimal profile wallet with four card slots and a discreet cash pocket, designed to sit flat in any pocket.',
    'Wipe clean with a dry cloth. Condition every 3-6 months with a quality leather balm.',
    45.00, null, 'Vegetable-tanned leather', 'BX-WAL-002', true, true, 40, 4.6, 21),
  ((select id from cat where slug = 'wallets'), 'Trifold Heritage Wallet', 'trifold-heritage-wallet',
    'Extra storage without the bulk — six card slots, a billfold, and an ID window in supple full-grain leather.',
    'Wipe clean with a dry cloth. Condition every 3-6 months with a quality leather balm.',
    65.00, null, 'Full-grain leather', 'BX-WAL-003', false, false, 18, 4.7, 14),
  ((select id from cat where slug = 'belts'), 'Classic Leather Belt', 'classic-leather-belt',
    'A versatile everyday belt in full-grain leather with a solid brass buckle, built to outlast trends.',
    'Avoid water. Store hanging or flat. Condition twice a year.',
    49.00, null, 'Full-grain leather / solid brass', 'BX-BLT-001', true, false, 50, 4.9, 58),
  ((select id from cat where slug = 'belts'), 'Reversible Formal Belt', 'reversible-formal-belt',
    'Two belts in one — black on one side, chestnut brown on the other, with a rotating buckle.',
    'Avoid water. Store hanging or flat.',
    55.00, 69.00, 'Full-grain leather', 'BX-BLT-002', false, true, 32, 4.5, 19),
  ((select id from cat where slug = 'card-holders'), 'Minimalist Card Sleeve', 'minimalist-card-sleeve',
    'Fits up to six cards in a slim, pull-tab leather sleeve that ages beautifully.',
    'Wipe clean with a dry cloth.',
    29.00, null, 'Full-grain leather', 'BX-CRD-001', true, false, 60, 4.7, 27),
  ((select id from cat where slug = 'money-clips'), 'Slim Money Clip', 'slim-money-clip',
    'A brushed-steel clip wrapped in leather, holding cash and a few cards without the bulk of a wallet.',
    'Wipe clean with a dry cloth.',
    35.00, null, 'Leather / stainless steel', 'BX-CLP-001', false, false, 22, 4.4, 9),
  ((select id from cat where slug = 'gift-sets'), 'Signature Wallet & Belt Set', 'signature-wallet-belt-set',
    'The Heritage Bifold Wallet and Classic Leather Belt, boxed together in a signature Beltyx gift case.',
    'See individual care instructions for wallet and belt.',
    99.00, 128.00, 'Full-grain leather', 'BX-SET-001', true, true, 15, 5.0, 12);

with p as (select id, slug from public.products)
insert into public.product_images (product_id, url, alt, sort_order) values
  ((select id from p where slug = 'heritage-bifold-wallet'), 'https://placehold.co/900x900/2a1f16/e8c77a?text=Heritage+Bifold', 'Heritage Bifold Wallet', 0),
  ((select id from p where slug = 'heritage-bifold-wallet'), 'https://placehold.co/900x900/1c1512/c9a24b?text=Heritage+Bifold+2', 'Heritage Bifold Wallet detail', 1),
  ((select id from p where slug = 'slimline-card-wallet'), 'https://placehold.co/900x900/2a1f16/e8c77a?text=Slimline+Card', 'Slimline Card Wallet', 0),
  ((select id from p where slug = 'trifold-heritage-wallet'), 'https://placehold.co/900x900/2a1f16/e8c77a?text=Trifold+Wallet', 'Trifold Heritage Wallet', 0),
  ((select id from p where slug = 'classic-leather-belt'), 'https://placehold.co/900x900/1c1512/c9a24b?text=Classic+Belt', 'Classic Leather Belt', 0),
  ((select id from p where slug = 'classic-leather-belt'), 'https://placehold.co/900x900/2a1f16/e8c77a?text=Classic+Belt+2', 'Classic Leather Belt buckle', 1),
  ((select id from p where slug = 'reversible-formal-belt'), 'https://placehold.co/900x900/1c1512/c9a24b?text=Reversible+Belt', 'Reversible Formal Belt', 0),
  ((select id from p where slug = 'minimalist-card-sleeve'), 'https://placehold.co/900x900/2a1f16/e8c77a?text=Card+Sleeve', 'Minimalist Card Sleeve', 0),
  ((select id from p where slug = 'slim-money-clip'), 'https://placehold.co/900x900/1c1512/c9a24b?text=Money+Clip', 'Slim Money Clip', 0),
  ((select id from p where slug = 'signature-wallet-belt-set'), 'https://placehold.co/900x900/2a1f16/e8c77a?text=Gift+Set', 'Signature Wallet & Belt Set', 0);

with p as (select id, slug from public.products)
insert into public.product_variants (product_id, size, color, color_hex, stock) values
  ((select id from p where slug = 'heritage-bifold-wallet'), null, 'Chestnut Brown', '#6b3e26', 12),
  ((select id from p where slug = 'heritage-bifold-wallet'), null, 'Black', '#1a1a1a', 12),
  ((select id from p where slug = 'classic-leather-belt'), '32', 'Chestnut Brown', '#6b3e26', 10),
  ((select id from p where slug = 'classic-leather-belt'), '34', 'Chestnut Brown', '#6b3e26', 10),
  ((select id from p where slug = 'classic-leather-belt'), '36', 'Black', '#1a1a1a', 10),
  ((select id from p where slug = 'classic-leather-belt'), '38', 'Black', '#1a1a1a', 10);

insert into public.coupons (code, description, discount_type, discount_value, min_order_amount, is_active) values
  ('WELCOME10', 'Welcome offer — 10% off your first order.', 'percent', 10, 0, true),
  ('FREESHIP', 'Free shipping on orders over $75.', 'fixed', 8, 75, true);
