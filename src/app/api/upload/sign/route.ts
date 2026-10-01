import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getCloudinaryConfig, resolveFolder, signParams } from "@/lib/cloudinary";

/*
 * Returns a short-lived signature so the browser can upload straight to
 * Cloudinary (with real progress) without ever seeing the API secret.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const { folder: sub } = await req.json().catch(() => ({ folder: undefined }));
    const { cloudName, apiKey } = getCloudinaryConfig();
    const folder = resolveFolder(sub);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = signParams({ folder, timestamp });

    return NextResponse.json({
      cloudName,
      apiKey,
      folder,
      timestamp,
      signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
