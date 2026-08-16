import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://gadgetandgear.bd"),
  title: "Gadget & Gear BD — Bangladesh's Premium Tech Store",
  description:
    "Shop the latest smartphones, laptops, audio and smart tech at Gadget & Gear BD (gadgetandgear.bd). Official warranty, 0% EMI, and express nationwide delivery across Bangladesh.",
  authors: [{ name: "Gadget & Gear BD" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Gadget & Gear BD — Premium Electronics & Devices",
    description: "Latest gadgets with official warranty and EMI across Bangladesh.",
    url: "http://gadgetandgear.bd",
    siteName: "Gadget & Gear BD",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#2563EB" />
      </head>
      <body>{children}</body>
    </html>
  );
}
