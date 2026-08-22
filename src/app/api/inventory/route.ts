import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Inventory } from "@/lib/models/Inventory";
import { StockMovement } from "@/lib/models/StockMovement";
import { Product } from "@/lib/models/Product";
import { Warehouse } from "@/lib/models/Warehouse";
import { getAuthFromCookie, logAudit, createNotification } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const warehouse = searchParams.get("warehouse");

    const filter: any = {};
    if (status && status !== "all") filter.status = status;
    if (warehouse) filter.warehouse = warehouse;
    if (search) {
      filter.$or = [
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total, warehouses] = await Promise.all([
      Inventory.find(filter)
        .populate("product", "name slug img category brand price")
        .populate("warehouse", "name location")
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Inventory.countDocuments(filter),
      Warehouse.find({ isActive: true }).lean(),
    ]);

    // Compute aggregated stats
    const allInventory = await Inventory.find().lean();
    const stats = {
      totalSKUs: allInventory.length,
      inStock: allInventory.filter((i) => i.status === "In Stock").length,
      lowStock: allInventory.filter((i) => i.status === "Low Stock").length,
      outOfStock: allInventory.filter((i) => i.status === "Out of Stock").length,
      totalValue: allInventory.reduce((s, i) => s + i.stock * i.costPrice, 0),
    };

    return NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats,
      warehouses,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthFromCookie();
    const body = await req.json();
    const { productId, sku, quantity, costPrice, warehouseId, lowThreshold, barcode } = body;

    // Check if inventory entry already exists for this product
    let inventory = await Inventory.findOne({ product: productId });

    if (inventory) {
      // Add stock
      const prevStock = inventory.stock;
      inventory.stock += quantity;
      inventory.costPrice = costPrice || inventory.costPrice;
      inventory.lastRestocked = new Date();
      if (barcode) inventory.barcode = barcode;
      if (lowThreshold) inventory.lowThreshold = lowThreshold;
      await inventory.save();

      // Record stock movement
      await StockMovement.create({
        product: productId,
        type: "Stock In",
        quantity,
        previousStock: prevStock,
        newStock: inventory.stock,
        reason: "Manual stock addition",
        performedBy: user?.staffId || undefined,
      });

      // Sync product stock
      await Product.findByIdAndUpdate(productId, { stock: inventory.stock });
    } else {
      // Create new inventory entry
      inventory = await Inventory.create({
        product: productId,
        sku: sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
        barcode: barcode || "",
        stock: quantity,
        lowThreshold: lowThreshold || 10,
        costPrice: costPrice || 0,
        warehouse: warehouseId || undefined,
      });

      // Record stock movement
      await StockMovement.create({
        product: productId,
        type: "Stock In",
        quantity,
        previousStock: 0,
        newStock: quantity,
        reason: "Initial stock entry",
        performedBy: user?.staffId || undefined,
      });

      // Sync product stock and SKU
      await Product.findByIdAndUpdate(productId, { stock: quantity, sku: inventory.sku });
    }

    await logAudit("stock_add", "Inventory", inventory._id.toString(), user, `Added ${quantity} units`);

    return NextResponse.json(inventory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
