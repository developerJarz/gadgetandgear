import { NextResponse } from "next/server";
import { getAuthFromCookie, verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Check admin/staff token first
    const adminUser = await getAuthFromCookie();
    if (adminUser) {
      return NextResponse.json({
        authenticated: true,
        user: adminUser,
      });
    }

    // Check customer token
    const cookieStore = await cookies();
    const customerToken = cookieStore.get("gh_customer_token")?.value;
    if (customerToken) {
      const customerUser = verifyToken(customerToken);
      if (customerUser) {
        return NextResponse.json({
          authenticated: true,
          user: customerUser,
        });
      }
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

