import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import { Product } from "@/lib/models/Product";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30d";

    // Calculate date range
    const now = new Date();
    let daysBack = 30;
    if (period === "7d") daysBack = 7;
    else if (period === "90d") daysBack = 90;
    else if (period === "1y") daysBack = 365;

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysBack);

    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - daysBack);

    // Revenue trend by day
    const revenueTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
          profit: {
            $sum: {
              $multiply: ["$total", 0.35], // Estimate 35% margin
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days
    const chartData = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayData = revenueTrend.find((r) => r._id === dateStr);
      chartData.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: dayData?.revenue || 0,
        profit: dayData?.profit || 0,
        orders: dayData?.orders || 0,
      });
    }

    // Current period totals
    const currentPeriod = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$total" },
        },
      },
    ]);

    // Previous period totals (for comparison)
    const previousPeriod = await Order.aggregate([
      { $match: { createdAt: { $gte: prevStartDate, $lt: startDate }, status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$total" },
        },
      },
    ]);

    const curr = currentPeriod[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    const prev = previousPeriod[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

    // Calculate trends
    const revenueTrendPct = prev.totalRevenue > 0 ? ((curr.totalRevenue - prev.totalRevenue) / prev.totalRevenue) * 100 : 0;
    const ordersTrendPct = prev.totalOrders > 0 ? ((curr.totalOrders - prev.totalOrders) / prev.totalOrders) * 100 : 0;
    const aovTrendPct = prev.avgOrderValue > 0 ? ((curr.avgOrderValue - prev.avgOrderValue) / prev.avgOrderValue) * 100 : 0;

    // Category breakdown from order items
    const categoryBreakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productSlug",
          foreignField: "slug",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$product.category", "Other"] },
          revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
          count: { $sum: "$items.qty" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    const totalCatRevenue = categoryBreakdown.reduce((s, c) => s + c.revenue, 0);
    const categoryData = categoryBreakdown.map((c) => ({
      name: (c._id as string).charAt(0).toUpperCase() + (c._id as string).slice(1),
      value: totalCatRevenue > 0 ? Math.round((c.revenue / totalCatRevenue) * 100) : 0,
      revenue: c.revenue,
    }));

    // Payment method breakdown
    const paymentBreakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: { $ifNull: ["$paymentMethod", "COD"] },
          amount: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    const totalPaymentAmount = paymentBreakdown.reduce((s, p) => s + p.amount, 0);
    const paymentData = paymentBreakdown.map((p) => ({
      method: p._id || "COD",
      amount: p.amount,
      count: p.count,
      pct: totalPaymentAmount > 0 ? Math.round((p.amount / totalPaymentAmount) * 100) : 0,
    }));

    // Geographic distribution
    const geoBreakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: { $ifNull: ["$division", "Dhaka"] },
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const totalGeoOrders = geoBreakdown.reduce((s, g) => s + g.orders, 0);
    const geoData = geoBreakdown.map((g) => ({
      division: g._id || "Dhaka",
      orders: g.orders,
      revenue: g.revenue,
      pct: totalGeoOrders > 0 ? Math.round((g.orders / totalGeoOrders) * 100) : 0,
    }));

    // Hourly order pattern
    const hourlyBreakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const hourlyData = Array.from({ length: 24 }, (_, h) => ({
      hour: `${h}:00`,
      orders: hourlyBreakdown.find((hb) => hb._id === h)?.orders || 0,
    }));

    // Active customers count
    const activeCustomers = await User.countDocuments({ status: "Active" });

    // Conversion rate estimate (orders / active customers)
    const conversionRate = activeCustomers > 0
      ? parseFloat(((curr.totalOrders / activeCustomers) * 100).toFixed(1))
      : 0;

    return NextResponse.json({
      kpis: {
        totalRevenue: curr.totalRevenue,
        totalProfit: Math.round(curr.totalRevenue * 0.35),
        totalOrders: curr.totalOrders,
        avgOrderValue: Math.round(curr.avgOrderValue || 0),
        conversionRate,
        activeCustomers,
        trends: {
          revenue: parseFloat(revenueTrendPct.toFixed(1)),
          orders: parseFloat(ordersTrendPct.toFixed(1)),
          aov: parseFloat(aovTrendPct.toFixed(1)),
        },
      },
      chartData,
      categoryData,
      paymentData,
      geoData,
      hourlyData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
