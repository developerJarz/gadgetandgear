import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { Inventory } from "@/lib/models/Inventory";
import { StockMovement } from "@/lib/models/StockMovement";
import { Transaction } from "@/lib/models/Transaction";
import { User } from "@/lib/models/User";
import { Product } from "@/lib/models/Product";
import { getAuthFromCookie, logAudit, createNotification } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id).lean();
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await getAuthFromCookie();
    const body = await req.json();

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const prevStatus = order.status;
    const newStatus = body.status || order.status;

    // Add to status timeline
    if (body.status && body.status !== prevStatus) {
      order.statusTimeline.push({
        status: body.status,
        timestamp: new Date(),
        note: body.note || "",
        by: user?.name || "System",
      });
    }

    // Apply updates
    Object.keys(body).forEach((key) => {
      if (key !== "statusTimeline") {
        (order as any)[key] = body[key];
      }
    });

    await order.save();

    // === SYNC FLOWS ON STATUS CHANGE ===

    if (newStatus !== prevStatus) {
      // Cancellation: restore inventory, reverse customer stats
      if (newStatus === "Cancelled" && prevStatus !== "Cancelled") {
        for (const item of order.items) {
          const product = await Product.findOne({ slug: item.productSlug });
          if (product) {
            const inv = await Inventory.findOne({ product: product._id });
            if (inv) {
              const prevStock = inv.stock;
              inv.stock += item.qty;
              await inv.save();

              await StockMovement.create({
                product: product._id,
                type: "Return",
                quantity: item.qty,
                previousStock: prevStock,
                newStock: inv.stock,
                reason: `Order ${order.orderId} cancelled`,
                reference: order.orderId,
                performedBy: user?.staffId || undefined,
              });

              product.stock = inv.stock;
              await product.save();
            }
          }
        }

        // Reverse customer stats
        if (order.customerEmail) {
          await User.findOneAndUpdate(
            { email: order.customerEmail },
            { $inc: { ordersCount: -1, totalSpent: -order.total } }
          );
        }

        // Refund transaction
        await Transaction.create({
          type: "refund",
          amount: -order.total,
          description: `Cancellation refund for ${order.orderId}`,
          category: "Refund",
          method: order.paymentMethod || "Original",
          reference: order.orderId,
          order: order._id,
        });

        await createNotification(
          "order",
          "Order Cancelled",
          `Order ${order.orderId} has been cancelled. ৳${order.total.toLocaleString()} refund initiated.`,
          "/admin/orders",
        );
      }

      // Delivered: update payment status
      if (newStatus === "Delivered") {
        if (order.paymentMethod === "COD") {
          order.paymentStatus = "Paid";
          await order.save();
        }
        await createNotification(
          "order",
          "Order Delivered",
          `Order ${order.orderId} delivered to ${order.customerName}`,
          "/admin/orders",
        );
      }

      // Shipped: notification
      if (newStatus === "Shipped") {
        await createNotification(
          "order",
          "Order Shipped",
          `Order ${order.orderId} shipped via ${order.courier || "courier"}`,
          "/admin/orders",
        );
      }
    }

    await logAudit("update", "Order", id, user, `Status: ${prevStatus} → ${newStatus}`);

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await Order.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
