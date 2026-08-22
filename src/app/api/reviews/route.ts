import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Review } from "@/lib/models/Review";
import { Product } from "@/lib/models/Product";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const approved = searchParams.get("approved");

    const filter: any = {};
    if (approved === "true") filter.isApproved = true;
    if (approved === "false") filter.isApproved = false;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("product", "name slug img")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    const stats = {
      total: await Review.countDocuments(),
      approved: await Review.countDocuments({ isApproved: true }),
      pending: await Review.countDocuments({ isApproved: false }),
      avgRating: 0,
    };

    const avgResult = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    stats.avgRating = avgResult[0]?.avg ? parseFloat(avgResult[0].avg.toFixed(1)) : 0;

    return NextResponse.json({ reviews, total, page, totalPages: Math.ceil(total / limit), stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, isApproved } = body;

    const review = await Review.findByIdAndUpdate(id, { isApproved }, { new: true });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Update product rating aggregate
    const productReviews = await Review.aggregate([
      { $match: { product: review.product, isApproved: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (productReviews[0]) {
      await Product.findByIdAndUpdate(review.product, {
        rating: parseFloat(productReviews[0].avgRating.toFixed(1)),
        reviews: productReviews[0].count,
      });
    }

    return NextResponse.json(review);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
