import type { Metadata } from "next";
import { ThemeProvider, ThemeScript } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_DESCRIPTION =
  "Full-grain leather wallets, belts, and accessories crafted for everyday carry. Premium materials, timeless design.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BELTYX — Premium Leather Wallets & Belts",
    template: "%s | BELTYX",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "BELTYX",
    title: "BELTYX — Premium Leather Wallets & Belts",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "BELTYX — Premium Leather Wallets & Belts",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster richColors position="top-center" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
