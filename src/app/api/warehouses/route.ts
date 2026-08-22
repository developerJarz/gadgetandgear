import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Warehouse } from "@/lib/models/Warehouse";
import { Inventory } from "@/lib/models/Inventory";

export async function GET() {
  try {
    await connectDB();
    const warehouses = await Warehouse.find().sort({ createdAt: -1 }).lean();

    // Enrich with inventory stats
    const enriched = await Promise.all(
      warehouses.map(async (wh) => {
        const inventoryItems = await Inventory.find({ warehouse: wh._id }).lean();
        const totalStock = inventoryItems.reduce((s, i) => s + i.stock, 0);
        return {
          ...wh,
          productsCount: inventoryItems.length,
          totalStock,
          usedCapacity: wh.capacity > 0 ? Math.round((inventoryItems.length / wh.capacity) * 100) : 0,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const warehouse = await Warehouse.create(body);
    return NextResponse.json(warehouse, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
