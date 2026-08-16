"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/site-data";

export interface CartItem {
  product: Product;
  qty: number;
}

export interface AppliedCoupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrder: number;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: Product[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (slug: string) => void;
  updateQty: (slug: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (slug: string) => boolean;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  cartTotal: number;
  discountAmount: number;
  finalTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "gh_cart";
const WISHLIST_KEY = "gh_wishlist";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      if (savedCart) setCart(JSON.parse(savedCart));
      const savedWishlist = localStorage.getItem(WISHLIST_KEY);
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, mounted]);

  // Save wishlist to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, mounted]);

  const addToCart = (product: Product, qty = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.slug === product.slug);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].qty += qty;
        return next;
      }
      return [...prev, { product, qty }];
    });
    toast.success(`Added "${product.name}" to cart`);
    setIsCartOpen(true);
  };

  const removeFromCart = (slug: string) => {
    setCart((prev) => prev.filter((item) => item.product.slug !== slug));
    toast.info("Item removed from cart");
  };

  const updateQty = (slug: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(slug);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.slug === slug ? { ...item, qty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.slug === product.slug);
      if (exists) {
        toast.info(`Removed "${product.name}" from wishlist`);
        return prev.filter((p) => p.slug !== product.slug);
      } else {
        toast.success(`Added "${product.name}" to wishlist`);
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (slug: string) => {
    return wishlist.some((p) => p.slug === slug);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/coupons");
      const coupons = await res.json();
      const found = coupons.find(
        (c: any) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
      );

      if (!found) {
        toast.error("Invalid or expired coupon code");
        return false;
      }

      const now = new Date();
      if (new Date(found.validUntil) < now) {
        toast.error("This coupon has expired");
        return false;
      }

      if (found.minOrder > 0 && cartTotal < found.minOrder) {
        toast.error(`Minimum order amount for this coupon is ৳${found.minOrder.toLocaleString()}`);
        return false;
      }

      setAppliedCoupon({
        code: found.code,
        discountType: found.discountType,
        discountValue: found.discountValue,
        minOrder: found.minOrder,
      });
      toast.success(`Coupon "${found.code}" applied successfully!`);
      return true;
    } catch {
      toast.error("Failed to apply coupon");
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon removed");
  };

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = Math.round((cartTotal * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const finalTotal = Math.max(0, cartTotal - discountAmount);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        toggleWishlist,
        isInWishlist,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        cartTotal,
        discountAmount,
        finalTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
