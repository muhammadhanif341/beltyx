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
```

Without these, the app still builds and runs — data-dependent pages simply
show empty states until Supabase is connected.

### 4. Run the database migrations

In the Supabase Dashboard, open the **SQL Editor** and run, in order:

1. `supabase/migrations/0001_init.sql` — tables, indexes, and RLS policies
2. `supabase/migrations/0002_seed.sql` — sample categories/products for local development (optional but recommended)
3. `supabase/migrations/0003_guest_checkout_verified_reviews.sql` — guest checkout policies, purchase-verified reviews, newsletter signups, and best-selling sort support

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

- **Payments:** Checkout currently supports Cash on Delivery and Bank Transfer
  only — no live payment gateway keys were provided. The checkout flow is
  structured so a card processor (e.g. Stripe) can be added later.
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
