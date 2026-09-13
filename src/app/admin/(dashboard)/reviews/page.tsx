import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReviewActions } from "@/components/admin/review-actions";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Reviews" };

interface ReviewRow {
  id: string;
  rating: number;
  body: string | null;
  is_approved: boolean;
  order_id: string | null;
  created_at: string;
  product: { name: string } | null;
  profile: { full_name: string | null } | null;
}

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, body, is_approved, order_id, created_at, product:products(name), profile:profiles(full_name)")
    .order("created_at", { ascending: false });

  const reviews = (data ?? []) as unknown as ReviewRow[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">{reviews.length} reviews</p>
      </div>

      <div className="rounded-2xl bg-card p-2 ring-1 ring-border sm:p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">{review.product?.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{review.profile?.full_name ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`size-3 ${i < review.rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">{review.body}</TableCell>
                <TableCell>
                  {review.order_id ? (
                    <Badge variant="outline" className="gap-1 text-accent">
                      <ShieldCheck className="size-3" />
                      Verified
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={review.is_approved ? "default" : "secondary"}>
                    {review.is_approved ? "Published" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ReviewActions reviewId={review.id} isApproved={review.is_approved} />
                </TableCell>
              </TableRow>
            ))}
            {reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No reviews yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
