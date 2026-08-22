import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Staff } from "@/lib/models/Staff";
import { hashPassword, comparePassword, setAuthCookie, logAudit, type JWTPayload } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const staff = await Staff.findOne({ email: email.toLowerCase().trim() });

    if (!staff) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!staff.isActive) {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 403 });
    }

    // If staff has no password yet (legacy), allow known demo passwords and set hash
    let passwordValid = false;
    if (staff.password) {
      passwordValid = await comparePassword(password, staff.password);
    } else {
      // Legacy compatibility: check hardcoded demo passwords
      const legacyPasswords: Record<string, string> = {
        "admin@gadgethub.bd": "admin123",
        "manager@gadgethub.bd": "manager123",
        "staff@gadgethub.bd": "staff123",
        "karim@gadgethub.bd": "manager123",
        "fatima@gadgethub.bd": "staff123",
      };
      if (legacyPasswords[staff.email] === password) {
        // Upgrade: hash and store the password
        staff.password = await hashPassword(password);
        await staff.save();
        passwordValid = true;
      }
    }

    if (!passwordValid) {
      // Log failed attempt
      staff.loginHistory.push({
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
        userAgent: req.headers.get("user-agent") || "",
        timestamp: new Date(),
        success: false,
      });
      // Keep only last 50 login records
      if (staff.loginHistory.length > 50) {
        staff.loginHistory = staff.loginHistory.slice(-50);
      }
      await staff.save();
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Log successful login
    staff.loginHistory.push({
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
      userAgent: req.headers.get("user-agent") || "",
      timestamp: new Date(),
      success: true,
    });
    if (staff.loginHistory.length > 50) {
      staff.loginHistory = staff.loginHistory.slice(-50);
    }
    staff.lastActive = new Date();
    await staff.save();

    const payload: JWTPayload = {
      staffId: staff._id.toString(),
      email: staff.email,
      name: staff.name,
      role: staff.role,
      permissions: staff.permissions,
    };

    await setAuthCookie(payload);

    await logAudit(
      "login",
      "Staff",
      staff._id.toString(),
      payload,
      `Login from ${req.headers.get("x-forwarded-for") || "unknown"}`,
      req.headers.get("x-forwarded-for") || ""
    );

    return NextResponse.json({
      success: true,
      user: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        avatar: staff.avatar,
        permissions: staff.permissions,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
