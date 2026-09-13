import type { Metadata } from "next";
import { NotFoundContent } from "@/components/site/not-found-content";

export const metadata: Metadata = { title: "Page Not Found" };

export default function SiteNotFound() {
  return <NotFoundContent />;
}
