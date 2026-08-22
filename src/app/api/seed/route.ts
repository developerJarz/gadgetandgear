import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Category } from "@/lib/models/Category";
import { Brand } from "@/lib/models/Brand";
import { Order } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import { Staff } from "@/lib/models/Staff";
import { Coupon } from "@/lib/models/Coupon";
import { Settings } from "@/lib/models/Settings";
import { Inventory } from "@/lib/models/Inventory";
import { StockMovement } from "@/lib/models/StockMovement";
import { Warehouse } from "@/lib/models/Warehouse";
import { Transaction } from "@/lib/models/Transaction";
import { CourierConfig } from "@/lib/models/CourierConfig";
import { PaymentConfig } from "@/lib/models/PaymentConfig";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    const productCount = await Product.countDocuments();
    if (productCount > 0 && !force) {
      // Ensure inventory and warehouses exist if products already exist
      const whCount = await Warehouse.countDocuments();
      if (whCount === 0) {
        const wh = await Warehouse.create({
          name: "Central Hub Dhaka",
          location: "Tejgaon Industrial Area, Dhaka",
          address: "Plot 14, Road 3, Tejgaon I/A",
          phone: "+8801700112233",
          capacity: 5000,
          isActive: true,
        });

        const allProds = await Product.find();
        for (const p of allProds) {
          const invExists = await Inventory.findOne({ product: p._id });
          if (!invExists) {
            const stock = Math.floor(Math.random() * 40) + 10;
            const cost = Math.round(p.price * 0.7);
            const sku = `SKU-${p.slug.toUpperCase().slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`;
            await Inventory.create({
              product: p._id,
              sku,
              stock,
              lowThreshold: 10,
              costPrice: cost,
              warehouse: wh._id,
              status: stock > 10 ? "In Stock" : "Low Stock",
            });
            p.stock = stock;
            p.costPrice = cost;
            p.sku = sku;
            await p.save();
          }
        }
      }
      return NextResponse.json({ message: "Database already seeded (verified inventory sync)", seeded: false });
    }

    if (force) {
      await Promise.all([
        Product.deleteMany({}),
        Category.deleteMany({}),
        Brand.deleteMany({}),
        Order.deleteMany({}),
        User.deleteMany({}),
        Staff.deleteMany({}),
        Coupon.deleteMany({}),
        Settings.deleteMany({}),
        Inventory.deleteMany({}),
        StockMovement.deleteMany({}),
        Warehouse.deleteMany({}),
        Transaction.deleteMany({}),
        CourierConfig.deleteMany({}),
        PaymentConfig.deleteMany({}),
      ]);
    }

    // 1. Seed Categories
    const categories = [
      { name: "Smartphones", slug: "smartphones", img: "/gh-phone.jpg", count: "128 models", description: "Latest smartphones from top brands" },
      { name: "Laptops", slug: "laptops", img: "/gh-laptop.jpg", count: "86 models", description: "Ultrabooks, gaming and creator laptops" },
      { name: "Earbuds", slug: "earbuds", img: "/gh-earbuds.jpg", count: "54 models", description: "Wireless and wired earbuds" },
      { name: "Smart Watches", slug: "smartwatches", img: "/gh-watch.jpg", count: "42 models", description: "Fitness and smart watches" },
      { name: "Headphones", slug: "headphones", img: "/gh-headphones.jpg", count: "38 models", description: "Over-ear and on-ear headphones" },
      { name: "Monitors", slug: "monitors", img: "/gh-monitor.jpg", count: "31 models", description: "Gaming and productivity monitors" },
      { name: "Keyboards", slug: "keyboards", img: "/gh-keyboard.jpg", count: "47 models", description: "Mechanical and membrane keyboards" },
      { name: "Tablets", slug: "tablets", img: "/gh-tablet.jpg", count: "28 models", description: "Android and iPad tablets" },
      { name: "Speakers", slug: "speakers", img: "/gh-speaker.jpg", count: "22 models", description: "Bluetooth and smart speakers" },
      { name: "Drones", slug: "drones", img: "/gh-drone.jpg", count: "14 models", description: "Camera and racing drones" },
      { name: "Power Banks", slug: "power", img: "/gh-powerbank.jpg", count: "36 models", description: "Fast-charging power banks" },
    ];
    await Category.insertMany(categories);

    // 2. Seed Brands
    const brands = [
      { name: "Apple", slug: "apple" },
      { name: "Samsung", slug: "samsung" },
      { name: "ASUS", slug: "asus" },
      { name: "Sony", slug: "sony" },
      { name: "Xiaomi", slug: "xiaomi" },
      { name: "Nothing", slug: "nothing" },
      { name: "Dell", slug: "dell" },
      { name: "HP", slug: "hp" },
      { name: "Lenovo", slug: "lenovo" },
      { name: "Logitech", slug: "logitech" },
    ];
    await Brand.insertMany(brands);

    // 3. Seed Warehouses
    const dhakaWH = await Warehouse.create({
      name: "Central Hub Dhaka",
      location: "Tejgaon, Dhaka",
      address: "Plot 14, Road 3, Tejgaon Industrial Area",
      phone: "+8801700112233",
      capacity: 5000,
      isActive: true,
    });
    const ctgWH = await Warehouse.create({
      name: "Port Hub Chattogram",
      location: "Agrabad, Chattogram",
      address: "Commercial Area, Agrabad C/A",
      phone: "+8801800112233",
      capacity: 2000,
      isActive: true,
    });

    // 4. Seed Products
    const productsData = [
      { slug: "galaxy-flagship-pro", name: "Galaxy Flagship Pro 5G 256GB", brand: "Samsung", category: "smartphones", price: 129900, was: 139900, costPrice: 95000, img: "/gh-phone.jpg", rating: 4.9, reviews: 421, tag: "Bestseller", warranty: "1 Year Official", stock: 35, sku: "SAM-S24-256" },
      { slug: "aurora-ultrabook-14", name: "Aurora Ultrabook 14 (i7 / 16GB)", brand: "ASUS", category: "laptops", price: 145900, was: null, costPrice: 110000, img: "/gh-laptop.jpg", rating: 4.8, reviews: 187, tag: "New", warranty: "2 Years Official", stock: 20, sku: "ASU-AU14-I7" },
      { slug: "pods-pro-anc", name: "Pods Pro ANC Wireless Earbuds", brand: "Apple", category: "earbuds", price: 18990, was: 22990, costPrice: 13500, img: "/gh-earbuds.jpg", rating: 4.9, reviews: 812, tag: "Flash Deal", warranty: "1 Year Official", stock: 65, sku: "APP-PPRO-ANC" },
      { slug: "pulse-smartwatch-s3", name: "Pulse Smartwatch S3 (AMOLED)", brand: "Xiaomi", category: "smartwatches", price: 12500, was: 15900, costPrice: 8500, img: "/gh-watch.jpg", rating: 4.7, reviews: 356, tag: "Bestseller", warranty: "1 Year Official", stock: 45, sku: "XIA-PLS-S3" },
      { slug: "wave-anc-headphones", name: "Wave ANC Over-Ear Headphones", brand: "Sony", category: "headphones", price: 34900, was: 38900, costPrice: 24500, img: "/gh-headphones.jpg", rating: 4.8, reviews: 291, tag: "Official", warranty: "1 Year Official", stock: 18, sku: "SNY-WAV-ANC" },
      { slug: "ultra-curved-34-oled", name: 'Ultra Curved 34" OLED Monitor', brand: "Samsung", category: "monitors", price: 89900, was: null, costPrice: 65000, img: "/gh-monitor.jpg", rating: 4.9, reviews: 74, tag: "New", warranty: "3 Years", stock: 12, sku: "SAM-UC34-OLED" },
      { slug: "mech-rgb-keyboard-tkl", name: "Mechanical RGB Keyboard TKL", brand: "Logitech", category: "keyboards", price: 9990, was: 12990, costPrice: 6500, img: "/gh-keyboard.jpg", rating: 4.6, reviews: 512, tag: "Flash Deal", warranty: "2 Years", stock: 40, sku: "LOG-MECH-TKL" },
      { slug: "sky-drone-4k", name: "Sky Drone 4K Camera Combo", brand: "Xiaomi", category: "drones", price: 62900, was: 69900, costPrice: 45000, img: "/gh-drone.jpg", rating: 4.7, reviews: 98, tag: "New", warranty: "1 Year", stock: 8, sku: "XIA-SKY-4K" },
      { slug: "boom-portable-speaker", name: "Boom Portable Bluetooth Speaker", brand: "Sony", category: "speakers", price: 7990, was: 9990, costPrice: 5200, img: "/gh-speaker.jpg", rating: 4.6, reviews: 264, tag: "Flash Deal", warranty: "1 Year", stock: 30, sku: "SNY-BOOM-BT" },
      { slug: "slate-tab-pro-11", name: "Slate Tab Pro 11 (128GB, Wi-Fi)", brand: "Samsung", category: "tablets", price: 54900, was: 59900, costPrice: 38000, img: "/gh-tablet.jpg", rating: 4.8, reviews: 143, tag: "Bestseller", warranty: "1 Year Official", stock: 22, sku: "SAM-STP-11" },
      { slug: "watt-20k-power-bank", name: "Watt 20000mAh PD Power Bank", brand: "Xiaomi", category: "power", price: 3490, was: 4290, costPrice: 2200, img: "/gh-powerbank.jpg", rating: 4.7, reviews: 902, tag: "Bestseller", warranty: "6 Months", stock: 80, sku: "XIA-WATT-20K" },
      { slug: "neo-mini-phone", name: "Neo Mini 5G 128GB", brand: "Nothing", category: "smartphones", price: 49900, was: 54900, costPrice: 35000, img: "/gh-phone.jpg", rating: 4.7, reviews: 218, tag: "New", warranty: "1 Year Official", stock: 25, sku: "NOT-NEO-128" },
      { slug: "creator-laptop-16", name: "Creator Laptop 16 (RTX / 32GB)", brand: "Dell", category: "laptops", price: 239900, was: null, costPrice: 185000, img: "/gh-laptop.jpg", rating: 4.9, reviews: 62, tag: "Pre-order", warranty: "2 Years Official", stock: 5, sku: "DEL-CRT-16" },
    ];
    const createdProducts = await Product.insertMany(productsData);

    // 5. Seed Inventory & Stock Movements for each product
    for (const p of createdProducts) {
      const inv = await Inventory.create({
        product: p._id,
        sku: p.sku,
        stock: p.stock,
        lowThreshold: 10,
        costPrice: p.costPrice,
        warehouse: dhakaWH._id,
        status: p.stock > 10 ? "In Stock" : "Low Stock",
      });

      await StockMovement.create({
        product: p._id,
        type: "Stock In",
        quantity: p.stock,
        previousStock: 0,
        newStock: p.stock,
        reason: "Initial seed stock",
      });
    }

    // 6. Seed Orders
    const orders = [
      { orderId: "ORD-1001", customerName: "Tanvir Ahmed", customerEmail: "tanvir@example.com", customerPhone: "+8801712345678", address: "Dhanmondi, Dhaka", division: "Dhaka", paymentMethod: "bKash", paymentStatus: "Paid", items: [{ productSlug: "galaxy-flagship-pro", productName: "Galaxy Flagship Pro 5G 256GB", qty: 1, price: 129900 }], total: 129900, status: "Delivered", createdAt: new Date("2026-07-28T10:30:00Z") },
      { orderId: "ORD-1002", customerName: "Sadia Khatun", customerEmail: "sadia@example.com", customerPhone: "+8801812345678", address: "Agrabad, Chattogram", division: "Chattogram", paymentMethod: "SSLCommerz", paymentStatus: "Paid", items: [{ productSlug: "pods-pro-anc", productName: "Pods Pro ANC Wireless Earbuds", qty: 2, price: 18990 }], total: 37980, status: "Shipped", createdAt: new Date("2026-07-29T14:15:00Z") },
      { orderId: "ORD-1003", customerName: "Rakib Hossain", customerEmail: "rakib@example.com", customerPhone: "+8801912345678", address: "Zindabazar, Sylhet", division: "Sylhet", paymentMethod: "Nagad", paymentStatus: "Paid", items: [{ productSlug: "aurora-ultrabook-14", productName: "Aurora Ultrabook 14 (i7 / 16GB)", qty: 1, price: 145900 }, { productSlug: "mech-rgb-keyboard-tkl", productName: "Mechanical RGB Keyboard TKL", qty: 1, price: 9990 }], total: 155890, status: "Processing", createdAt: new Date("2026-07-30T09:45:00Z") },
      { orderId: "ORD-1004", customerName: "Nusrat Jahan", customerEmail: "nusrat@example.com", customerPhone: "+8801612345678", address: "Uttara, Dhaka", division: "Dhaka", paymentMethod: "COD", paymentStatus: "Pending", items: [{ productSlug: "pulse-smartwatch-s3", productName: "Pulse Smartwatch S3 (AMOLED)", qty: 1, price: 12500 }], total: 12500, status: "Pending", createdAt: new Date("2026-07-30T16:20:00Z") },
      { orderId: "ORD-1005", customerName: "Farhan Iqbal", customerEmail: "farhan@example.com", customerPhone: "+8801512345678", address: "Mirpur, Dhaka", division: "Dhaka", paymentMethod: "bKash", paymentStatus: "Paid", items: [{ productSlug: "wave-anc-headphones", productName: "Wave ANC Over-Ear Headphones", qty: 1, price: 34900 }, { productSlug: "watt-20k-power-bank", productName: "Watt 20000mAh PD Power Bank", qty: 2, price: 3490 }], total: 41880, status: "Pending", createdAt: new Date("2026-07-31T02:10:00Z") },
      { orderId: "ORD-1006", customerName: "Ayesha Rahman", customerEmail: "ayesha@example.com", customerPhone: "+8801312345678", address: "Banani, Dhaka", division: "Dhaka", paymentMethod: "SSLCommerz", paymentStatus: "Paid", items: [{ productSlug: "ultra-curved-34-oled", productName: 'Ultra Curved 34" OLED Monitor', qty: 1, price: 89900 }], total: 89900, status: "Delivered", createdAt: new Date("2026-07-25T11:00:00Z") },
      { orderId: "ORD-1007", customerName: "Imran Khan", customerEmail: "imran@example.com", customerPhone: "+8801412345678", address: "Gulshan, Dhaka", division: "Dhaka", paymentMethod: "Rocket", paymentStatus: "Refunded", items: [{ productSlug: "sky-drone-4k", productName: "Sky Drone 4K Camera Combo", qty: 1, price: 62900 }], total: 62900, status: "Cancelled", createdAt: new Date("2026-07-26T08:30:00Z") },
      { orderId: "ORD-1008", customerName: "Mithila Akter", customerEmail: "mithila@example.com", customerPhone: "+8801112345678", address: "Mohammadpur, Dhaka", division: "Dhaka", paymentMethod: "COD", paymentStatus: "Pending", items: [{ productSlug: "neo-mini-phone", productName: "Neo Mini 5G 128GB", qty: 1, price: 49900 }], total: 49900, status: "Shipped", createdAt: new Date("2026-07-29T20:00:00Z") },
    ];
    const createdOrders = await Order.insertMany(orders);

    // 7. Seed Transactions matching orders
    for (const o of createdOrders) {
      if (o.status !== "Cancelled") {
        await Transaction.create({
          type: "income",
          amount: o.total,
          description: `Order ${o.orderId} - ${o.paymentMethod}`,
          category: "Sales",
          method: o.paymentMethod,
          reference: o.orderId,
          order: o._id,
          date: o.createdAt,
        });
      }
    }

    // Add some sample expenses
    await Transaction.create([
      { type: "expense", amount: -45000, description: "Warehouse rent Tejgaon - August", category: "Rent & Utilities", method: "Bank Transfer", date: new Date("2026-08-01") },
      { type: "expense", amount: -25000, description: "Facebook & Google Ad spend", category: "Marketing & Ads", method: "Bank Transfer", date: new Date("2026-08-05") },
      { type: "expense", amount: -18500, description: "Pathao courier delivery charges", category: "Shipping & Courier", method: "Bank Transfer", date: new Date("2026-08-10") },
    ]);

    // 8. Seed Users
    const users = [
      { name: "Tanvir Ahmed", email: "tanvir@example.com", phone: "+8801712345678", status: "Active", division: "Dhaka", ordersCount: 5, totalSpent: 289700, segment: "VIP", joinedAt: new Date("2025-12-01") },
      { name: "Sadia Khatun", email: "sadia@example.com", phone: "+8801812345678", status: "Active", division: "Chattogram", ordersCount: 3, totalSpent: 87960, segment: "Regular", joinedAt: new Date("2026-01-15") },
      { name: "Rakib Hossain", email: "rakib@example.com", phone: "+8801912345678", status: "Active", division: "Sylhet", ordersCount: 8, totalSpent: 456200, segment: "VIP", joinedAt: new Date("2025-11-20") },
      { name: "Nusrat Jahan", email: "nusrat@example.com", phone: "+8801612345678", status: "Active", division: "Dhaka", ordersCount: 2, totalSpent: 42500, segment: "Regular", joinedAt: new Date("2026-03-10") },
      { name: "Farhan Iqbal", email: "farhan@example.com", phone: "+8801512345678", status: "Active", division: "Dhaka", ordersCount: 6, totalSpent: 198400, segment: "Regular", joinedAt: new Date("2026-02-05") },
      { name: "Ayesha Rahman", email: "ayesha@example.com", phone: "+8801312345678", status: "Banned", division: "Dhaka", ordersCount: 1, totalSpent: 89900, segment: "At-Risk", joinedAt: new Date("2026-04-22") },
      { name: "Imran Khan", email: "imran@example.com", phone: "+8801412345678", status: "Active", division: "Dhaka", ordersCount: 4, totalSpent: 312600, segment: "Regular", joinedAt: new Date("2025-10-08") },
      { name: "Mithila Akter", email: "mithila@example.com", phone: "+8801112345678", status: "Active", division: "Dhaka", ordersCount: 2, totalSpent: 99800, segment: "New", joinedAt: new Date("2026-05-15") },
    ];
    await User.insertMany(users);

    // 9. Seed Staff with hashed passwords
    const adminPassHash = await hashPassword("admin123");
    const managerPassHash = await hashPassword("manager123");
    const staffPassHash = await hashPassword("staff123");

    const staffList = [
      { name: "Admin", email: "admin@gadgethub.bd", password: adminPassHash, role: "Super Admin", permissions: ["*"], joinedAt: new Date("2025-01-01"), lastActive: new Date() },
      { name: "Karim Rahman", email: "karim@gadgethub.bd", password: managerPassHash, role: "Manager", permissions: ["dashboard", "products", "orders", "inventory", "analytics", "finance"], joinedAt: new Date("2025-06-15"), lastActive: new Date() },
      { name: "Fatima Begum", email: "fatima@gadgethub.bd", password: staffPassHash, role: "Staff", permissions: ["dashboard", "products", "orders"], joinedAt: new Date("2026-01-10"), lastActive: new Date() },
    ];
    await Staff.insertMany(staffList);

    // 10. Seed Coupons
    const coupons = [
      { code: "WELCOME10", discountType: "percentage", discountValue: 10, minOrder: 5000, maxUses: 100, usedCount: 34, validFrom: new Date("2026-07-01"), validUntil: new Date("2026-12-31"), isActive: true },
      { code: "FLASH500", discountType: "fixed", discountValue: 500, minOrder: 3000, maxUses: 50, usedCount: 12, validFrom: new Date("2026-07-15"), validUntil: new Date("2026-08-15"), isActive: true },
      { code: "SUMMER20", discountType: "percentage", discountValue: 20, minOrder: 10000, maxUses: 200, usedCount: 87, validFrom: new Date("2026-06-01"), validUntil: new Date("2026-08-31"), isActive: true },
      { code: "GADGET1000", discountType: "fixed", discountValue: 1000, minOrder: 15000, maxUses: 0, usedCount: 156, validFrom: new Date("2026-01-01"), validUntil: new Date("2026-06-30"), isActive: false },
    ];
    await Coupon.insertMany(coupons);

    // 11. Seed Bangladesh Courier Configurations
    await CourierConfig.create([
      { name: "Pathao Courier", slug: "pathao", isActive: true, defaultCost: 60, baseUrl: "https://api-hermes.pathao.com" },
      { name: "Steadfast Courier", slug: "steadfast", isActive: true, defaultCost: 70, baseUrl: "https://portal.steadfast.com.bd/api/v1" },
      { name: "RedX Delivery", slug: "redx", isActive: false, defaultCost: 60, baseUrl: "https://openapi.redx.com.bd/v1.0.0-beta" },
    ]);

    // 12. Seed Bangladesh Payment Gateway Configurations
    await PaymentConfig.create([
      { name: "bKash Direct Gateway", slug: "bkash", isActive: true, sandboxMode: true, baseUrl: "https://tokenized.sandbox.bka.sh/v1.2.0-beta" },
      { name: "Nagad Gateway", slug: "nagad", isActive: true, sandboxMode: true, baseUrl: "http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0" },
      { name: "SSLCommerz", slug: "sslcommerz", isActive: true, sandboxMode: true, baseUrl: "https://sandbox.sslcommerz.com" },
      { name: "Cash on Delivery", slug: "cod", isActive: true, sandboxMode: false, baseUrl: "" },
    ]);

    // 13. Seed Settings
    await Settings.create({
      storeName: "GadgetHub BD",
      tagline: "Premium Electronics & Gadgets in Bangladesh",
      announcementText: "⚡ Flash deals up to 40% off — today only | 🚚 Free delivery inside Dhaka on orders above ৳3,000",
      socialLinks: { instagram: "#", facebook: "#", youtube: "#", twitter: "#", tiktok: "#" },
      paymentMethods: { bkash: true, nagad: true, rocket: true, sslcommerz: true, cod: true, card: true },
      deliveryZones: ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh"],
      vatRate: 15,
      currency: "BDT",
      timezone: "Asia/Dhaka",
    });

    return NextResponse.json({ message: "Database seeded successfully with all models & relationships!", seeded: true });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
