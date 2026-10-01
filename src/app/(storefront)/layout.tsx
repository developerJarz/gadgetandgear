"use client";

import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { SearchModal } from "@/components/SearchModal";
import { MobileTabBar } from "@/components/MobileTabBar";
import { Toaster } from "sonner";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Toaster position="top-right" richColors closeButton />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-primary focus:text-primary-foreground">
        Skip to content
      </a>
      {/* Bottom padding on phones keeps the footer clear of the tab bar. */}
      <div className="min-h-screen flex flex-col bg-background text-foreground pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <SearchModal />
        <MobileTabBar />
      </div>
    </CartProvider>
  );
}
