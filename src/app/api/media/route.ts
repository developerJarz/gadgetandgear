import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { MediaAsset } from "@/lib/models/MediaAsset";
import { requireAuth, logAudit, requestMeta } from "@/lib/auth";
import {
  uploadFromUrl,
  verifyUploadSignature,
  isOwnCloudinaryUrl,
  type CloudinaryUploadResult,
} from "@/lib/cloudinary";

function toAssetDoc(r: CloudinaryUploadResult, source: "upload" | "link", sourceUrl = "") {
  return {
    publicId: r.public_id,
    url: r.secure_url,
    resourceType: r.resource_type,
    format: r.format || "",
    bytes: r.bytes || 0,
    width: r.width || 0,
    height: r.height || 0,
    originalFilename: r.original_filename || r.public_id.split("/").pop() || "",
    folder: r.folder || r.public_id.split("/").slice(0, -1).join("/"),
    source,
    sourceUrl,
  };
}

/* GET /api/media?search=&type=image|video&folder=&page=&limit= */
export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "40")));
    const search = searchParams.get("search")?.trim();
    const type = searchParams.get("type");
    const folder = searchParams.get("folder");

    const filter: Record<string, unknown> = {};
    if (type && type !== "all") filter.resourceType = type;
    if (folder && folder !== "all") filter.folder = { $regex: `/${folder.replace(/[^a-z0-9_-]/gi, "")}$` };
    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { originalFilename: { $regex: safe, $options: "i" } },
        { tags: { $regex: safe, $options: "i" } },
      ];
    }

    const [items, total, usage] = await Promise.all([
      MediaAsset.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      MediaAsset.countDocuments(filter),
      MediaAsset.aggregate([{ $group: { _id: null, bytes: { $sum: "$bytes" }, count: { $sum: 1 } } }]),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      usage: { bytes: usage[0]?.bytes || 0, count: usage[0]?.count || 0 },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/*
 * POST /api/media
 *   { kind: "direct", result }       register a browser upload (signature verified)
 *   { kind: "link", url, folder }    import a remote image into Cloudinary
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { ip, userAgent } = requestMeta(req);

  try {
    await connectDB();
    const body = await req.json();

    if (body.kind === "direct") {
      const result = body.result as CloudinaryUploadResult;
      if (!verifyUploadSignature(result) || !isOwnCloudinaryUrl(result.secure_url)) {
        return NextResponse.json({ error: "Upload could not be verified. Try uploading again." }, { status: 400 });
      }
      const asset = await MediaAsset.findOneAndUpdate(
        { publicId: result.public_id },
        { ...toAssetDoc(result, "upload"), uploadedBy: auth.user.staffId, uploadedByName: auth.user.name },
        { upsert: true, new: true }
      ).lean();
      await logAudit("upload", "Media", String(asset!._id), auth.user, `Uploaded ${asset!.originalFilename}.${asset!.format}`, ip, {
        entityName: asset!.originalFilename,
        userAgent,
      });
      return NextResponse.json(asset, { status: 201 });
    }

    if (body.kind === "link") {
      const url = String(body.url || "").trim();
      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch {
        return NextResponse.json({ error: "That isn't a valid link. Paste a full URL starting with https://" }, { status: 400 });
      }
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return NextResponse.json({ error: "Only http and https links can be imported." }, { status: 400 });
      }

      // Already on our Cloudinary account: nothing to import.
      if (isOwnCloudinaryUrl(url)) {
        return NextResponse.json({ url, alreadyHosted: true });
      }

      let result: CloudinaryUploadResult;
      try {
        result = await uploadFromUrl(url, { folder: body.folder, tags: ["imported"] });
      } catch (err: any) {
        return NextResponse.json(
          {
            error: `Cloudinary couldn't fetch that link (${err.message}). The site may block downloads. You can still use the link as-is.`,
            allowRaw: true,
          },
          { status: 422 }
        );
      }

      const asset = await MediaAsset.findOneAndUpdate(
        { publicId: result.public_id },
        {
          ...toAssetDoc(result, "link", url),
          originalFilename: decodeURIComponent(parsed.pathname.split("/").pop() || "") || result.public_id,
          uploadedBy: auth.user.staffId,
          uploadedByName: auth.user.name,
        },
        { upsert: true, new: true }
      ).lean();
      await logAudit("upload", "Media", String(asset!._id), auth.user, `Imported image from ${parsed.hostname}`, ip, {
        entityName: asset!.originalFilename,
        userAgent,
      });
      return NextResponse.json(asset, { status: 201 });
    }

    return NextResponse.json({ error: "Unknown upload kind." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
