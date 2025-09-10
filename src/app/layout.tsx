import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Shalean Cleaning Services - Professional Home & Office Cleaning",
    template: "%s | Shalean Cleaning Services"
  },
  description: "Professional cleaning services for your home and office. Book online with Shalean Cleaning Services for reliable, affordable, and eco-friendly cleaning solutions. Residential, commercial, deep cleaning, and move-in/move-out services.",
  keywords: [
    "cleaning services",
    "home cleaning",
    "office cleaning", 
    "professional cleaners",
    "house cleaning",
    "residential cleaning",
    "commercial cleaning",
    "deep cleaning",
    "move in move out cleaning",
    "eco friendly cleaning",
    "reliable cleaning service",
    "book cleaning online",
    "cleaning company",
    "maid service",
    "janitorial services"
  ],
  authors: [{ name: "Shalean Cleaning Services" }],
  creator: "Shalean Cleaning Services",
  publisher: "Shalean Cleaning Services",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://shaleancleaning.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shaleancleaning.com",
    siteName: "Shalean Cleaning Services",
    title: "Shalean Cleaning Services - Professional Home & Office Cleaning",
    description: "Professional cleaning services for your home and office. Book online with Shalean Cleaning Services for reliable, affordable, and eco-friendly cleaning solutions.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Shalean Cleaning Services - Professional Cleaning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@shaleancleaning",
    creator: "@shaleancleaning",
    title: "Shalean Cleaning Services - Professional Home & Office Cleaning",
    description: "Professional cleaning services for your home and office. Book online with Shalean Cleaning Services.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster />
        </div>
      </body>
    </html>
  );
}
