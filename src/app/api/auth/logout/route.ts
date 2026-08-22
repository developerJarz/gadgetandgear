import { NextResponse } from "next/server";
import { clearAuthCookie, getAuthFromCookie, logAudit } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getAuthFromCookie();
    await clearAuthCookie();
    if (user) {
      await logAudit("logout", "Staff", user.staffId, user);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
