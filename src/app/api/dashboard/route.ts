import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models/Product";
import { Order } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import { Coupon } from "@/lib/models/Coupon";
import { Inventory } from "@/lib/models/Inventory";
import { Transaction } from "@/lib/models/Transaction";
import { Return } from "@/lib/models/Return";

export async function GET() {
  try {
    await connectDB();

    const [totalProducts, totalOrders, totalUsers, activeCoupons] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Coupon.countDocuments({ isActive: true }),
    ]);

    // Revenue from non-cancelled orders
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [ordersToday, revenueToday] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: todayStart }, status: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    const activeUsers = await User.countDocuments({ status: "Active" });

    // Inventory stats
    const inventoryStats = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          lowStock: { $sum: { $cond: [{ $eq: ["$status", "Low Stock"] }, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $eq: ["$status", "Out of Stock"] }, 1, 0] } },
        },
      },
    ]);

    // Pending returns
    const pendingReturns = await Return.countDocuments({ status: "Requested" });

    // Chart data — last 7 days from real orders
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayResult = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: dayStart, $lte: dayEnd },
            status: { $ne: "Cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
      ]);

      chartData.push({
        date: d.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: dayResult[0]?.revenue || 0,
        orders: dayResult[0]?.orders || 0,
      });
    }

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productSlug",
          name: { $first: "$items.productName" },
          totalSold: { $sum: "$items.qty" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
    ]);

    // Revenue comparison vs last week
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 14);
    const lastWeekEnd = new Date();
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

    const thisWeekRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: { $ne: "Cancelled" },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const lastWeekRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: lastWeekStart, $lt: lastWeekEnd },
          status: { $ne: "Cancelled" },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const twRev = thisWeekRevenue[0]?.total || 0;
    const lwRev = lastWeekRevenue[0]?.total || 0;
    const revenueTrend = lwRev > 0 ? parseFloat((((twRev - lwRev) / lwRev) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      totalRevenue,
      ordersToday,
      revenueToday: revenueToday[0]?.total || 0,
      activeUsers,
      totalProducts,
      totalOrders,
      totalUsers,
      activeCoupons,
      recentOrders,
      chartData,
      topProducts,
      revenueTrend,
      inventoryAlerts: {
        lowStock: inventoryStats[0]?.lowStock || 0,
        outOfStock: inventoryStats[0]?.outOfStock || 0,
      },
      pendingReturns,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
