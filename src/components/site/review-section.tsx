"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/format";
import type { Review } from "@/lib/types";
import { toast } from "sonner";

type Eligibility = "loading" | "signed-out" | "not-eligible" | { orderId: string };

export function ReviewSection({ productId, reviews }: { productId: string; reviews: Review[] }) {
  const supabase = React.useMemo(() => createClient(), []);
  const [eligibility, setEligibility] = React.useState<Eligibility>("loading");
  const [rating, setRating] = React.useState(5);
  const [body, setBody] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setEligibility("signed-out");
        return;
      }
      const { data: orderId } = await supabase.rpc("deliverable_order_for_review", {
        p_product_id: productId,
      });
      if (cancelled) return;
      setEligibility(orderId ? { orderId } : "not-eligible");
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [supabase, productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (typeof eligibility !== "object" || body.trim().length < 10) return;
    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user!.id,
      order_id: eligibility.orderId,
      rating,
      body: body.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't submit your review. Try again.");
      return;
    }
    setBody("");
    toast.success("Thanks! Your review is pending approval.");
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h3 className="font-display text-2xl font-semibold">Customer Reviews</h3>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No reviews yet. Be the first to share your experience.
          </p>
        ) : (
          <div className="mt-4 space-y-5">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${i < review.rating ? "fill-accent text-accent" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                {review.title && <p className="mt-2 text-sm font-semibold">{review.title}</p>}
                <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  {review.profile?.full_name ?? "Beltyx Customer"} &middot; {formatDate(review.created_at)}
                  {review.order_id && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                      <ShieldCheck className="size-3" />
                      Verified Purchase
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-card p-6 ring-1 ring-border">
        <h4 className="font-display text-xl font-semibold">Write a Review</h4>
        {eligibility === "loading" ? null : eligibility === "signed-out" ? (
          <p className="mt-3 text-sm text-muted-foreground">
            <Link href="/login" className="text-accent underline">
              Sign in
            </Link>{" "}
            to write a review.
          </p>
        ) : eligibility === "not-eligible" ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Only customers who have purchased and received this product can leave a review.
            Reviews unlock automatically once your order is marked delivered — see your{" "}
            <Link href="/account/orders" className="text-accent underline">
              orders
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              <ShieldCheck className="size-3.5" />
              Verified Purchase
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} type="button" onClick={() => setRating(i + 1)} aria-label={`${i + 1} stars`}>
                  <Star
                    className={`size-6 transition-colors ${i < rating ? "fill-accent text-accent" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={4}
              required
              minLength={10}
            />
            <Button type="submit" variant="hero" disabled={submitting} className="self-start">
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
