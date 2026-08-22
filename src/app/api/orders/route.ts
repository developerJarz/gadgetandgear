import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { Inventory } from "@/lib/models/Inventory";
import { StockMovement } from "@/lib/models/StockMovement";
import { Transaction } from "@/lib/models/Transaction";
import { User } from "@/lib/models/User";
import { Product } from "@/lib/models/Product";
import { Coupon } from "@/lib/models/Coupon";
import { getAuthFromCookie, logAudit, createNotification } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const paymentMethod = searchParams.get("paymentMethod");
    const division = searchParams.get("division");

    const filter: any = {};
    if (status && status !== "all") filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (division) filter.division = division;
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
      ];
    }
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
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

    // Generate order ID
    const lastOrder = await Order.findOne().sort({ createdAt: -1 }).lean();
    let nextNum = 1001;
    if (lastOrder?.orderId) {
      const num = parseInt(lastOrder.orderId.replace("ORD-", ""));
      if (!isNaN(num)) nextNum = num + 1;
    }
    const orderId = `ORD-${nextNum}`;

    // Create status timeline
    const statusTimeline = [{
      status: "Pending",
      timestamp: new Date(),
      note: "Order placed",
      by: body.customerName || "Customer",
    }];

    const order = await Order.create({
      ...body,
      orderId,
      statusTimeline,
      subtotal: body.subtotal || body.total,
    });

    // === SYNC FLOWS ===

    // 1. Deduct inventory
    for (const item of order.items) {
      const product = await Product.findOne({ slug: item.productSlug });
      if (product) {
        const inv = await Inventory.findOne({ product: product._id });
        if (inv) {
          const prevStock = inv.stock;
          inv.stock = Math.max(0, inv.stock - item.qty);
          await inv.save();

          await StockMovement.create({
            product: product._id,
            type: "Stock Out",
            quantity: -item.qty,
            previousStock: prevStock,
            newStock: inv.stock,
            reason: `Order ${orderId}`,
            reference: orderId,
            performedBy: user?.staffId || undefined,
          });

          // Sync product stock
          product.stock = inv.stock;
          await product.save();

          // Low stock alert
          if (inv.stock <= inv.lowThreshold && inv.stock > 0) {
            await createNotification(
              "stock_alert",
              "Low Stock Alert",
              `${product.name} has only ${inv.stock} units left`,
              "/admin/inventory",
            );
          }
        }
      }
    }

    // 2. Create income transaction
    await Transaction.create({
      type: "income",
      amount: order.total,
      description: `Order ${orderId} - ${order.paymentMethod || "COD"}`,
      category: "Sales",
      method: order.paymentMethod || "COD",
      reference: orderId,
      order: order._id,
      date: order.createdAt,
    });

    // 3. Update customer stats
    if (order.customerEmail) {
      await User.findOneAndUpdate(
        { email: order.customerEmail },
        {
          $inc: { ordersCount: 1, totalSpent: order.total },
          $set: { lastOrderDate: new Date() },
        },
        { upsert: false }
      );
    }

    // 4. Update coupon usage
    if (order.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: order.couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    // 5. Notification
    await createNotification(
      "order",
      "New Order",
      `${order.customerName} placed order ${orderId} for ৳${order.total.toLocaleString()}`,
      "/admin/orders",
    );

    await logAudit("create", "Order", order._id.toString(), user, `Order ${orderId} created`);

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
