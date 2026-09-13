import type { Metadata } from "next";
import Link from "next/link";
import { NotFoundContent } from "@/components/site/not-found-content";

export const metadata: Metadata = { title: "Page Not Found" };

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-2xl font-semibold tracking-wide">
          BELTYX
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <NotFoundContent />
      </main>
    </div>
  );
}
