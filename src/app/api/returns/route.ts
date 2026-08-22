import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Return } from "@/lib/models/Return";
import { Order } from "@/lib/models/Order";
import { Inventory } from "@/lib/models/Inventory";
import { StockMovement } from "@/lib/models/StockMovement";
import { Transaction } from "@/lib/models/Transaction";
import { getAuthFromCookie, logAudit, createNotification } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    const filter: any = {};
    if (status && status !== "all") filter.status = status;

    const [returns, total] = await Promise.all([
      Return.find(filter)
        .populate("order", "orderId customerName customerEmail total")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Return.countDocuments(filter),
    ]);

    const stats = {
      requested: await Return.countDocuments({ status: "Requested" }),
      approved: await Return.countDocuments({ status: "Approved" }),
      received: await Return.countDocuments({ status: "Received" }),
      refunded: await Return.countDocuments({ status: "Refunded" }),
      rejected: await Return.countDocuments({ status: "Rejected" }),
    };

    return NextResponse.json({ returns, total, page, totalPages: Math.ceil(total / limit), stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthFromCookie();
    const body = await req.json();

    const order = await Order.findById(body.orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const returnDoc = await Return.create({
      order: order._id,
      orderId: order.orderId,
      items: body.items,
      reason: body.reason,
      customerNote: body.customerNote || "",
      refundAmount: body.refundAmount || 0,
    });

    // Update order status
    order.refundStatus = "Requested";
    await order.save();

    await createNotification(
      "return",
      "New Return Request",
      `Return request for order ${order.orderId}`,
      `/admin/returns`,
    );

    await logAudit("create", "Return", returnDoc._id.toString(), user, `Return for ${order.orderId}`);

    return NextResponse.json(returnDoc, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
