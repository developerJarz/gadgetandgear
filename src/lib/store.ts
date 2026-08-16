// localStorage-backed CRUD store for GadgetHub BD admin panel
// Seeds with site-data.ts on first load, then persists all changes

import { PRODUCTS as SEED_PRODUCTS, CATEGORIES as SEED_CATEGORIES, BRANDS as SEED_BRANDS } from "./site-data";
import type { Product, Category } from "./site-data";

/* ──────────────────────────────── Types ──────────────────────────────── */

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  items: { productSlug: string; productName: string; qty: number; price: number }[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export type UserRole = "Customer";
export type UserStatus = "Active" | "Banned";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  ordersCount: number;
  totalSpent: number;
  joinedAt: string;
}

export type StaffRole = "Admin" | "Manager" | "Staff";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  avatar?: string;
  joinedAt: string;
  lastActive: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  announcementText: string;
  socialLinks: { instagram: string; facebook: string; youtube: string };
  paymentMethods: {
    bkash: boolean;
    nagad: boolean;
    rocket: boolean;
    sslcommerz: boolean;
    cod: boolean;
  };
  deliveryZones: string[];
}

/* ──────────────────────────── Helpers ──────────────────────────── */

const KEYS = {
  products: "gh_products",
  categories: "gh_categories",
  brands: "gh_brands",
  orders: "gh_orders",
  users: "gh_users",
  staff: "gh_staff",
  settings: "gh_settings",
  seeded: "gh_seeded",
  auth: "gh_auth",
};

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function get<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

/* ──────────────────────────── Seed ──────────────────────────── */

function seedIfNeeded(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEYS.seeded)) return;

  set(KEYS.products, SEED_PRODUCTS);
  set(KEYS.categories, SEED_CATEGORIES);
  set(KEYS.brands, SEED_BRANDS);

  // Seed demo orders
  const demoOrders: Order[] = [
    { id: "ORD-1001", customerName: "Tanvir Ahmed", customerEmail: "tanvir@example.com", customerPhone: "+8801712345678", address: "Dhanmondi, Dhaka", items: [{ productSlug: "galaxy-flagship-pro", productName: "Galaxy Flagship Pro 5G 256GB", qty: 1, price: 129900 }], total: 129900, status: "Delivered", createdAt: "2026-07-28T10:30:00Z" },
    { id: "ORD-1002", customerName: "Sadia Khatun", customerEmail: "sadia@example.com", customerPhone: "+8801812345678", address: "Agrabad, Chattogram", items: [{ productSlug: "pods-pro-anc", productName: "Pods Pro ANC Wireless Earbuds", qty: 2, price: 18990 }], total: 37980, status: "Shipped", createdAt: "2026-07-29T14:15:00Z" },
    { id: "ORD-1003", customerName: "Rakib Hossain", customerEmail: "rakib@example.com", customerPhone: "+8801912345678", address: "Zindabazar, Sylhet", items: [{ productSlug: "aurora-ultrabook-14", productName: "Aurora Ultrabook 14 (i7 / 16GB)", qty: 1, price: 145900 }, { productSlug: "mech-rgb-keyboard-tkl", productName: "Mechanical RGB Keyboard TKL", qty: 1, price: 9990 }], total: 155890, status: "Processing", createdAt: "2026-07-30T09:45:00Z" },
    { id: "ORD-1004", customerName: "Nusrat Jahan", customerEmail: "nusrat@example.com", customerPhone: "+8801612345678", address: "Uttara, Dhaka", items: [{ productSlug: "pulse-smartwatch-s3", productName: "Pulse Smartwatch S3 (AMOLED)", qty: 1, price: 12500 }], total: 12500, status: "Pending", createdAt: "2026-07-30T16:20:00Z" },
    { id: "ORD-1005", customerName: "Farhan Iqbal", customerEmail: "farhan@example.com", customerPhone: "+8801512345678", address: "Mirpur, Dhaka", items: [{ productSlug: "wave-anc-headphones", productName: "Wave ANC Over-Ear Headphones", qty: 1, price: 34900 }, { productSlug: "watt-20k-power-bank", productName: "Watt 20000mAh PD Power Bank", qty: 2, price: 3490 }], total: 41880, status: "Pending", createdAt: "2026-07-31T02:10:00Z" },
    { id: "ORD-1006", customerName: "Ayesha Rahman", customerEmail: "ayesha@example.com", customerPhone: "+8801312345678", address: "Banani, Dhaka", items: [{ productSlug: "ultra-curved-34-oled", productName: "Ultra Curved 34\" OLED Monitor", qty: 1, price: 89900 }], total: 89900, status: "Delivered", createdAt: "2026-07-25T11:00:00Z" },
    { id: "ORD-1007", customerName: "Imran Khan", customerEmail: "imran@example.com", customerPhone: "+8801412345678", address: "Gulshan, Dhaka", items: [{ productSlug: "sky-drone-4k", productName: "Sky Drone 4K Camera Combo", qty: 1, price: 62900 }], total: 62900, status: "Cancelled", createdAt: "2026-07-26T08:30:00Z" },
    { id: "ORD-1008", customerName: "Mithila Akter", customerEmail: "mithila@example.com", customerPhone: "+8801112345678", address: "Mohammadpur, Dhaka", items: [{ productSlug: "neo-mini-phone", productName: "Neo Mini 5G 128GB", qty: 1, price: 49900 }], total: 49900, status: "Shipped", createdAt: "2026-07-29T20:00:00Z" },
  ];
  set(KEYS.orders, demoOrders);

  // Seed demo users
  const demoUsers: AppUser[] = [
    { id: "USR-001", name: "Tanvir Ahmed", email: "tanvir@example.com", phone: "+8801712345678", role: "Customer", status: "Active", ordersCount: 5, totalSpent: 289700, joinedAt: "2025-12-01T00:00:00Z" },
    { id: "USR-002", name: "Sadia Khatun", email: "sadia@example.com", phone: "+8801812345678", role: "Customer", status: "Active", ordersCount: 3, totalSpent: 87960, joinedAt: "2026-01-15T00:00:00Z" },
    { id: "USR-003", name: "Rakib Hossain", email: "rakib@example.com", phone: "+8801912345678", role: "Customer", status: "Active", ordersCount: 8, totalSpent: 456200, joinedAt: "2025-11-20T00:00:00Z" },
    { id: "USR-004", name: "Nusrat Jahan", email: "nusrat@example.com", phone: "+8801612345678", role: "Customer", status: "Active", ordersCount: 2, totalSpent: 42500, joinedAt: "2026-03-10T00:00:00Z" },
    { id: "USR-005", name: "Farhan Iqbal", email: "farhan@example.com", phone: "+8801512345678", role: "Customer", status: "Active", ordersCount: 6, totalSpent: 198400, joinedAt: "2026-02-05T00:00:00Z" },
    { id: "USR-006", name: "Ayesha Rahman", email: "ayesha@example.com", phone: "+8801312345678", role: "Customer", status: "Banned", ordersCount: 1, totalSpent: 89900, joinedAt: "2026-04-22T00:00:00Z" },
    { id: "USR-007", name: "Imran Khan", email: "imran@example.com", phone: "+8801412345678", role: "Customer", status: "Active", ordersCount: 4, totalSpent: 312600, joinedAt: "2025-10-08T00:00:00Z" },
    { id: "USR-008", name: "Mithila Akter", email: "mithila@example.com", phone: "+8801112345678", role: "Customer", status: "Active", ordersCount: 2, totalSpent: 99800, joinedAt: "2026-05-15T00:00:00Z" },
  ];
  set(KEYS.users, demoUsers);

  // Seed staff
  const demoStaff: StaffMember[] = [
    { id: "STF-001", name: "Admin", email: "admin@gadgethub.bd", role: "Admin", joinedAt: "2025-01-01T00:00:00Z", lastActive: new Date().toISOString() },
    { id: "STF-002", name: "Karim Rahman", email: "karim@gadgethub.bd", role: "Manager", joinedAt: "2025-06-15T00:00:00Z", lastActive: "2026-07-30T10:00:00Z" },
    { id: "STF-003", name: "Fatima Begum", email: "fatima@gadgethub.bd", role: "Staff", joinedAt: "2026-01-10T00:00:00Z", lastActive: "2026-07-29T18:30:00Z" },
  ];
  set(KEYS.staff, demoStaff);

  // Seed settings
  const defaultSettings: StoreSettings = {
    storeName: "Gadget & Gear BD",
    tagline: "Premium Electronics & Gadgets in Bangladesh",
    announcementText: "⚡ Flash deals up to 40% off — today only | 🚚 Free delivery inside Dhaka on orders above ৳3,000",
    socialLinks: { instagram: "#", facebook: "#", youtube: "#" },
    paymentMethods: { bkash: true, nagad: true, rocket: true, sslcommerz: true, cod: true },
    deliveryZones: ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh"],
  };
  set(KEYS.settings, defaultSettings);

  localStorage.setItem(KEYS.seeded, "1");
}

/* ──────────────────────────── Products ──────────────────────────── */

export function getProducts(): Product[] {
  seedIfNeeded();
  return get<Product[]>(KEYS.products, SEED_PRODUCTS);
}

export function addProduct(p: Omit<Product, "slug">): Product {
  const products = getProducts();
  const product: Product = { ...p, slug: p.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + genId() };
  products.push(product);
  set(KEYS.products, products);
  return product;
}

export function updateProduct(slug: string, data: Partial<Product>): Product | null {
  const products = getProducts();
  const idx = products.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...data };
  set(KEYS.products, products);
  return products[idx];
}

export function deleteProduct(slug: string): boolean {
  const products = getProducts();
  const filtered = products.filter((p) => p.slug !== slug);
  if (filtered.length === products.length) return false;
  set(KEYS.products, filtered);
  return true;
}

/* ──────────────────────────── Categories ──────────────────────────── */

export function getCategories(): Category[] {
  seedIfNeeded();
  return get<Category[]>(KEYS.categories, SEED_CATEGORIES);
}

/* ──────────────────────────── Brands ──────────────────────────── */

export function getBrands(): string[] {
  seedIfNeeded();
  return get<string[]>(KEYS.brands, SEED_BRANDS);
}

/* ──────────────────────────── Orders ──────────────────────────── */

export function getOrders(): Order[] {
  seedIfNeeded();
  return get<Order[]>(KEYS.orders, []);
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | null {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx].status = status;
  set(KEYS.orders, orders);
  return orders[idx];
}

/* ──────────────────────────── Users ──────────────────────────── */

export function getUsers(): AppUser[] {
  seedIfNeeded();
  return get<AppUser[]>(KEYS.users, []);
}

export function toggleUserBan(id: string): AppUser | null {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx].status = users[idx].status === "Active" ? "Banned" : "Active";
  set(KEYS.users, users);
  return users[idx];
}

/* ──────────────────────────── Staff ──────────────────────────── */

export function getStaff(): StaffMember[] {
  seedIfNeeded();
  return get<StaffMember[]>(KEYS.staff, []);
}

export function addStaffMember(data: { name: string; email: string; role: StaffRole }): StaffMember {
  const staff = getStaff();
  const member: StaffMember = {
    id: "STF-" + genId(),
    name: data.name,
    email: data.email,
    role: data.role,
    joinedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };
  staff.push(member);
  set(KEYS.staff, staff);
  return member;
}

export function updateStaffRole(id: string, role: StaffRole): StaffMember | null {
  const staff = getStaff();
  const idx = staff.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  staff[idx].role = role;
  set(KEYS.staff, staff);
  return staff[idx];
}

export function removeStaffMember(id: string): boolean {
  const staff = getStaff();
  const filtered = staff.filter((s) => s.id !== id);
  if (filtered.length === staff.length) return false;
  set(KEYS.staff, filtered);
  return true;
}

/* ──────────────────────────── Settings ──────────────────────────── */

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Gadget & Gear BD",
  tagline: "Premium Electronics & Gadgets in Bangladesh",
  announcementText: "⚡ Flash deals up to 40% off — today only",
  socialLinks: { instagram: "#", facebook: "#", youtube: "#" },
  paymentMethods: { bkash: true, nagad: true, rocket: true, sslcommerz: true, cod: true },
  deliveryZones: ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh"],
};

export function getSettings(): StoreSettings {
  seedIfNeeded();
  return get<StoreSettings>(KEYS.settings, DEFAULT_SETTINGS);
}

export function updateSettings(data: Partial<StoreSettings>): StoreSettings {
  const current = getSettings();
  const updated = { ...current, ...data };
  set(KEYS.settings, updated);
  return updated;
}

/* ──────────────────────────── Auth ──────────────────────────── */

export interface AuthUser {
  loggedIn: boolean;
  email: string;
  name: string;
  role: "Admin" | "Manager" | "Staff" | "Customer";
  loginAt: string;
}

export function roleLogin(email: string, password: string): AuthUser | null {
  const credentials: Record<string, { pass: string; name: string; role: AuthUser["role"] }> = {
    "admin@gadgethub.bd": { pass: "admin123", name: "System Admin", role: "Admin" },
    "manager@gadgethub.bd": { pass: "manager123", name: "Store Manager", role: "Manager" },
    "staff@gadgethub.bd": { pass: "staff123", name: "Operations Staff", role: "Staff" },
    "customer@gadgethub.bd": { pass: "customer123", name: "Tanvir Ahmed", role: "Customer" },
  };

  const match = credentials[email.toLowerCase().trim()];
  if (match && match.pass === password) {
    const auth: AuthUser = {
      loggedIn: true,
      email,
      name: match.name,
      role: match.role,
      loginAt: new Date().toISOString(),
    };
    set(KEYS.auth, auth);
    return auth;
  }
  return null;
}

export function adminLogin(email: string, password: string): boolean {
  const user = roleLogin(email, password);
  return user !== null && user.role !== "Customer";
}

export function getAuthUser(): AuthUser | null {
  return get<AuthUser | null>(KEYS.auth, null);
}

export function isAdminLoggedIn(): boolean {
  const auth = getAuthUser();
  return auth !== null && auth.loggedIn && auth.role !== "Customer";
}

export function adminLogout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEYS.auth);
  }
}

/* ──────────────────────────── Dashboard Stats ──────────────────────────── */

export function getDashboardStats() {
  const orders = getOrders();
  const users = getUsers();
  const products = getProducts();

  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const todayStr = new Date().toISOString().slice(0, 10);
  const ordersToday = orders.filter((o) => o.createdAt.slice(0, 10) === todayStr).length;

  const activeUsers = users.filter((u) => u.status === "Active").length;

  // Mock chart data for last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === d.toISOString().slice(0, 10) && o.status !== "Cancelled");
    return {
      date: d.toLocaleDateString("en-US", { weekday: "short" }),
      revenue: dayOrders.reduce((s, o) => s + o.total, 0) || Math.floor(Math.random() * 80000) + 20000,
      orders: dayOrders.length || Math.floor(Math.random() * 5) + 1,
    };
  });

  return {
    totalRevenue,
    ordersToday,
    activeUsers,
    totalProducts: products.length,
    recentOrders: [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10),
    chartData,
  };
}
