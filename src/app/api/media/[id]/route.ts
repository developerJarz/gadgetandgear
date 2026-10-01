import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { MediaAsset } from "@/lib/models/MediaAsset";
import { requirePermission, logAudit, requestMeta } from "@/lib/auth";
import { destroyAsset } from "@/lib/cloudinary";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("media");
  if (auth instanceof NextResponse) return auth;
  const { ip, userAgent } = requestMeta(req);

  try {
    await connectDB();
    const { id } = await params;
    const asset = await MediaAsset.findById(id);
    if (!asset) return NextResponse.json({ error: "File not found" }, { status: 404 });

    const removed = await destroyAsset(asset.publicId, asset.resourceType);
    if (!removed) {
      return NextResponse.json({ error: "Cloudinary didn't delete the file. Try again in a moment." }, { status: 502 });
    }
    await asset.deleteOne();
    await logAudit("delete", "Media", id, auth.user, `Deleted ${asset.originalFilename}.${asset.format} from Cloudinary`, ip, {
      entityName: asset.originalFilename,
      userAgent,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
