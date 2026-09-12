import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SignInPrompt } from "@/components/site/sign-in-prompt";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "My Reviews" };

interface ReviewRow {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_approved: boolean;
  created_at: string;
  product: { name: string; slug: string; images: { url: string }[] } | null;
}

export default async function MyReviewsPage() {
  const user = await getCurrentUser();
  if (!user) return <SignInPrompt next="/account/reviews" />;

  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, title, body, is_approved, created_at, product:products(name, slug, images:product_images(url))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const reviews = (data ?? []) as unknown as ReviewRow[];

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl bg-card p-12 text-center ring-1 ring-border">
        <Star className="size-10 text-muted-foreground" />
        <h2 className="mt-5 font-display text-2xl font-semibold">No reviews yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Reviews you write on products will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => (
        <div key={review.id} className="flex gap-4 rounded-2xl bg-card p-5 ring-1 ring-border">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
            {review.product?.images?.[0]?.url && (
              <Image src={review.product.images[0].url} alt={review.product.name} fill sizes="64px" className="object-cover" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {review.product && (
                <Link href={`/product/${review.product.slug}`} className="font-medium hover:text-accent">
                  {review.product.name}
                </Link>
              )}
              <Badge variant={review.is_approved ? "default" : "secondary"}>
                {review.is_approved ? "Published" : "Pending approval"}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`size-3.5 ${i < review.rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
              ))}
            </div>
            {review.body && <p className="mt-2 text-sm text-muted-foreground">{review.body}</p>}
            <p className="mt-2 text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
