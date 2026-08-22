import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Return } from "@/lib/models/Return";
import { Order } from "@/lib/models/Order";
import { Inventory } from "@/lib/models/Inventory";
import { StockMovement } from "@/lib/models/StockMovement";
import { Transaction } from "@/lib/models/Transaction";
import { User } from "@/lib/models/User";
import { Product } from "@/lib/models/Product";
import { getAuthFromCookie, logAudit, createNotification } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await getAuthFromCookie();
    const body = await req.json();

    const returnDoc = await Return.findById(id);
    if (!returnDoc) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    const prevStatus = returnDoc.status;
    Object.assign(returnDoc, body);

    if (body.processedBy) returnDoc.processedBy = body.processedBy;

    await returnDoc.save();

    // Handle status changes with sync flows
    if (body.status === "Refunded" && prevStatus !== "Refunded") {
      // Restore inventory
      for (const item of returnDoc.items) {
        const product = await Product.findOne({ slug: item.productSlug });
        if (product) {
          const inventory = await Inventory.findOne({ product: product._id });
          if (inventory) {
            const prevStock = inventory.stock;
            inventory.stock += item.qty;
            await inventory.save();

            await StockMovement.create({
              product: product._id,
              type: "Return",
              quantity: item.qty,
              previousStock: prevStock,
              newStock: inventory.stock,
              reason: `Return from order ${returnDoc.orderId}`,
              reference: returnDoc.orderId,
              performedBy: user?.staffId || undefined,
            });

            // Sync product stock
            product.stock = inventory.stock;
            await product.save();
          }
        }
      }

      // Create refund transaction
      if (returnDoc.refundAmount > 0) {
        await Transaction.create({
          type: "refund",
          amount: -returnDoc.refundAmount,
          description: `Refund for return of order ${returnDoc.orderId}`,
          category: "Refund",
          method: returnDoc.refundMethod || "Original",
          reference: returnDoc.orderId,
        });
      }

      // Update order
      const order = await Order.findById(returnDoc.order);
      if (order) {
        order.refundStatus = "Completed";
        order.refundAmount = returnDoc.refundAmount;
        order.status = "Returned";
        await order.save();

        // Update customer stats
        if (order.userId) {
          await User.findByIdAndUpdate(order.userId, {
            $inc: {
              ordersCount: -1,
              totalSpent: -returnDoc.refundAmount,
            },
          });
        }
      }

      await createNotification(
        "return",
        "Return Refunded",
        `Refund of ৳${returnDoc.refundAmount.toLocaleString()} processed for ${returnDoc.orderId}`,
        `/admin/returns`,
      );
    }

    await logAudit("update", "Return", id, user, `Status: ${prevStatus} → ${body.status || returnDoc.status}`);

    return NextResponse.json(returnDoc);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
