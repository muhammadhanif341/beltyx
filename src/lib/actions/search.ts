"use server";

import { searchProductSuggestions } from "@/lib/queries";

export async function getSearchSuggestions(term: string) {
  const products = await searchProductSuggestions(term);
  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.images?.[0]?.url ?? null,
  }));
}
