import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { getAnyAuthFromCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await getAnyAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = auth.email.toLowerCase().trim();
    const orders = await Order.find({
      $or: [
        { customerEmail: { $regex: new RegExp(`^${email}$`, "i") } },
        { customerEmail: email },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("Fetch customer orders error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
