import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { getCustomerAuthFromCookie, getAnyAuthFromCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await getAnyAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: auth.email.toLowerCase().trim() })
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: user });
  } catch (error: any) {
    console.error("Fetch profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const auth = await getAnyAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, whatsapp, altPhone, address, city, division, postalCode } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: auth.email.toLowerCase().trim() },
      {
        $set: {
          name: name.trim(),
          phone: phone?.trim() || "",
          whatsapp: whatsapp?.trim() || "",
          altPhone: altPhone?.trim() || "",
          address: address?.trim() || "",
          city: city?.trim() || "",
          division: division?.trim() || "",
          postalCode: postalCode?.trim() || "",
        },
      },
      { new: true }
    )
      .select("-password")
      .lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedUser,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
