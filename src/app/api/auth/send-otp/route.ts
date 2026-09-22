import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { OTP } from "@/lib/models/OTP";
import { sendOTPEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, name, purpose } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Check if email already registered for new registrations
    if (purpose === "registration" || !purpose) {
      const existingUser = await User.findOne({ email: emailLower });
      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in." },
          { status: 409 }
        );
      }
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Upsert OTP in MongoDB
    await OTP.findOneAndUpdate(
      { email: emailLower, purpose: purpose || "registration" },
      {
        $set: {
          otp,
          expiresAt,
        },
      },
      { upsert: true, new: true }
    );

    // Send OTP email via Resend
    const emailResult = await sendOTPEmail(emailLower, otp, name);

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email address",
      email: emailLower,
      // For development/testing ease, we also send preview if Resend unverified domain limitation occurs
      devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
      emailSent: emailResult.success,
    });
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
