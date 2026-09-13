# BELTYX

Premium leather wallets & belts — a full-stack e-commerce storefront and admin
dashboard built with Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui,
and Supabase.

## Stack

- **Frontend:** Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS v4, shadcn/ui (Base UI), Lucide icons, Framer Motion
- **State:** Zustand (cart & wishlist, persisted to `localStorage`)
- **Backend:** Supabase (Postgres, Auth, Storage, Row Level Security)
- **Forms:** react-hook-form + Zod

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Create a free project at [supabase.com](https://supabase.com), then from
**Project Settings → API** copy your project URL and anon key.

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional — WhatsApp click-to-chat button (digits only, with country code)
NEXT_PUBLIC_WHATSAPP_NUMBER=

# Optional — payment gateways beyond COD/Bank Transfer/mock card. A gateway
# only appears at checkout once its variables below are set; see
# src/lib/payments/ to wire up the real API calls when credentials arrive.
STRIPE_SECRET_KEY=
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_INTEGRITY_SALT=
EASYPAISA_STORE_ID=
EASYPAISA_HASH_KEY=
```

Without these, the app still builds and runs — data-dependent pages simply
show empty states until Supabase is connected.

### 4. Run the database migrations

In the Supabase Dashboard, open the **SQL Editor** and run, in order:

1. `supabase/migrations/0001_init.sql` — tables, indexes, and RLS policies
2. `supabase/migrations/0002_seed.sql` — sample categories/products for local development (optional but recommended)
3. `supabase/migrations/0003_guest_checkout_verified_reviews.sql` — guest checkout policies, purchase-verified reviews, newsletter signups, and best-selling sort support
4. `supabase/migrations/0004_checkout_orders_admin.sql` — full order status lifecycle + tracking timeline, atomic inventory decrement/overselling guard, coupon usage tracking + product/category restrictions, low-stock threshold, product specifications, and review photos

(If you have the Supabase CLI linked to your project, `supabase db push` works too.)

### 5. Create a Storage bucket for product images

In **Storage**, create a new **public** bucket named `product-images`. Then
add a policy allowing authenticated admins to upload:

```sql
create policy "product-images: admin upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

create policy "product-images: public read"
on storage.objects for select
using (bucket_id = 'product-images');
```

Then create a second **public** bucket named `review-images` (for optional
customer review photos), with a policy allowing any signed-in shopper to
upload:

```sql
create policy "review-images: authenticated upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'review-images');

create policy "review-images: public read"
on storage.objects for select
using (bucket_id = 'review-images');
```

### 6. Create your first admin user

Sign up a normal account from `/signup`, then in the Supabase SQL Editor run:

```sql
update public.profiles set is_admin = true where email = 'you@example.com';
```

You can now sign in at `/admin/login`.

### 7. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Notes

- **Payments:** Checkout supports Cash on Delivery, Bank Transfer, and a
  mock/test card flow out of the box via a `PaymentProvider` abstraction
  (`src/lib/payments/`). Stripe, JazzCash, and Easypaisa are registered but
  stay hidden from checkout until their credentials are set as env vars —
  see `.env.example`. No fake credentials are hard-coded anywhere.
- **WhatsApp support widget:** set `NEXT_PUBLIC_WHATSAPP_NUMBER` to show the
  floating WhatsApp button (`src/components/site/whatsapp-widget.tsx`). It
  uses wa.me click-to-chat links today; swap in the WhatsApp Business API
  behind a server route once credentials are available.
- **Product imagery:** Seed data uses neutral placeholder swatches
  (`placehold.co`). Replace with real product photography from the admin
  Products page before launch.
- **Type safety:** `src/lib/types.ts` is a hand-written mirror of the SQL
  schema. Once your Supabase project is linked via the CLI, you can replace it
  with generated types: `supabase gen types typescript --linked`.

## Project Structure

```
src/
  app/
    (site)/        Public storefront (shared header/footer)
    (auth)/         Login, signup, forgot password
    admin/          Admin dashboard (guarded, separate layout)
  components/
    ui/             shadcn/ui primitives
    site/           Storefront components
    admin/          Admin dashboard components
  lib/
    supabase/       Client/server/middleware Supabase helpers
    store/          Zustand cart & wishlist stores
    validations/    Zod schemas
    actions/        Server actions (checkout, contact)
    queries.ts      Server-side data fetching
supabase/
  migrations/       SQL schema + seed data
```
