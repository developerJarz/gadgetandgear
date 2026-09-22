import { NextResponse } from "next/server";
import { clearAuthCookie, getAuthFromCookie, logAudit } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const user = await getAuthFromCookie();
    await clearAuthCookie();
    // Also clear customer token
    const cookieStore = await cookies();
    cookieStore.delete("gh_customer_token");
    if (user) {
      await logAudit("logout", "Staff", user.staffId, user);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

