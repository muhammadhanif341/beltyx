import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InventoryStockInput } from "@/components/admin/inventory-row";
import { createClient } from "@/lib/supabase/server";
import type { ProductWithRelations } from "@/lib/types";

export const metadata: Metadata = { title: "Inventory" };

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminInventoryPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, variants:product_variants(*)")
    .order("name");

  const products = (data ?? []) as unknown as ProductWithRelations[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage stock levels across products and variants</p>
      </div>

      <div className="rounded-2xl bg-card p-2 ring-1 ring-border sm:p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.flatMap((product) => {
              const variants = product.variants ?? [];
              if (variants.length === 0) {
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-muted-foreground">—</TableCell>
                    <TableCell className="text-muted-foreground">{product.sku ?? "—"}</TableCell>
                    <TableCell>
                      <InventoryStockInput table="products" id={product.id} initialStock={product.stock} />
                    </TableCell>
                    <TableCell>
                      <StockBadge stock={product.stock} />
                    </TableCell>
                  </TableRow>
                );
              }
              return variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {[variant.size, variant.color].filter(Boolean).join(" / ") || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{variant.sku ?? "—"}</TableCell>
                  <TableCell>
                    <InventoryStockInput table="product_variants" id={variant.id} initialStock={variant.stock} />
                  </TableCell>
                  <TableCell>
                    <StockBadge stock={variant.stock} />
                  </TableCell>
                </TableRow>
              ));
            })}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No products yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return <Badge variant="destructive">Out of stock</Badge>;
  if (stock <= LOW_STOCK_THRESHOLD) return <Badge variant="secondary">Low stock</Badge>;
  return <Badge variant="default">In stock</Badge>;
}
