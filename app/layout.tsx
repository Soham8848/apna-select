import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import Script from "next/script";

import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { CartSheet } from "@/components/cart/cart-sheet";
import { Footer } from "@/components/layout/footer";
import { FloatingContact } from "@/components/ui/floating-contact";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";

/** Body copy: Inter, for dense product text and long specs. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/**
 * Headlines: Archivo. Slightly condensed with a genuinely heavy 800/900, which
 * is what gives retail headings their punch — Inter's bold flattens out at
 * display sizes and the page stops feeling confident.
 */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://apnaselect.in"),
  title: {
    default: "Apna Select — Gadgets, Home & Lifestyle at Honest Prices",
    template: "%s | Apna Select",
  },
  description:
    "Shop trending gadgets, tools, home and lifestyle picks with free delivery over ₹499, cash on delivery across India, and 7-day easy returns.",
  keywords: [
    "online shopping India",
    "gadgets online",
    "cash on delivery store",
    "home and kitchen",
    "Apna Select",
  ],
  openGraph: {
    type: "website",
    siteName: "Apna Select",
    title: "Apna Select — Gadgets, Home & Lifestyle at Honest Prices",
    description:
      "Free delivery over ₹499 · Cash on delivery · 7-day easy returns.",
    images: ["/images/posters/summerposter.jpeg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apna Select",
    description: "Free delivery over ₹499 · Cash on delivery · 7-day returns.",
    images: ["/images/posters/summerposter.jpeg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Pinch-zoom left enabled on purpose: capping it fails WCAG 1.4.4 and makes
  // small spec text unreadable for a large share of mobile shoppers.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#13141c" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${archivo.variable} flex min-h-screen flex-col font-sans antialiased`}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1PHWYG5001"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1PHWYG5001');
          `}
        </Script>
        <Providers>
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-accent-foreground"
          >
            Skip to content
          </a>
          <AnnouncementBar />
          <Navbar />
          <CartSheet />
          <main id="content" className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster position="bottom-center" richColors />
          <FloatingContact />
        </Providers>
      </body>
    </html>
  );
}
