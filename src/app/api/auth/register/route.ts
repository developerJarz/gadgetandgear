import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { OTP } from "@/lib/models/OTP";
import { hashPassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

const COOKIE_NAME = "gh_customer_token";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, phone, whatsapp, address, city, division, password, otp } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Verify OTP if OTP system is enabled
    if (otp) {
      const otpRecord = await OTP.findOne({
        email: emailLower,
        purpose: "registration",
      });

      if (!otpRecord) {
        return NextResponse.json(
          { error: "Verification code expired or not found. Please click Resend Code." },
          { status: 400 }
        );
      }

      // Explicit expiry check (MongoDB TTL can have ~60s delay)
      if (otpRecord.expiresAt && new Date() > new Date(otpRecord.expiresAt)) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return NextResponse.json(
          { error: "Verification code has expired. Please click Resend Code." },
          { status: 400 }
        );
      }

      if (otpRecord.otp !== otp.trim()) {
        return NextResponse.json(
          { error: "Invalid 6-digit verification code. Please check and try again." },
          { status: 400 }
        );
      }

      // Delete used OTP
      await OTP.deleteOne({ _id: otpRecord._id });
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: emailLower,
      phone: phone?.trim() || "",
      whatsapp: whatsapp?.trim() || phone?.trim() || "",
      address: address?.trim() || "",
      city: city?.trim() || "",
      division: division?.trim() || "",
      password: hashedPassword,
      role: "Customer",
      status: "Active",
      segment: "New",
      joinedAt: new Date(),
    });

    // Issue JWT cookie for immediate login
    const token = signToken({
      staffId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: "Customer" as any,
      permissions: ["storefront"],
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: "Customer",
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
