import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { CartSheet } from "@/components/cart/cart-sheet";
import { Footer } from "@/components/layout/footer";
import { FloatingContact } from "@/components/ui/floating-contact";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "APNA.SELECT | India's Premium Tech & Gadget Store",
    template: "%s | APNA.SELECT",
  },
  description: "Shop the world's best tech, gadgets, and lifestyle accessories at unbeatable prices. Fast shipping and premium quality guaranteed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        {/* Google Analytics Tracker */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-1PHWYG5001" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1PHWYG5001');
          `}
        </Script>
        <Providers>
          <Navbar />
          <CartSheet />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster />
          <FloatingContact />
        </Providers>
      </body>
    </html>
  );
}
