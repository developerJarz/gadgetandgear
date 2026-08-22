import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Transaction } from "@/lib/models/Transaction";
import { Order } from "@/lib/models/Order";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "monthly";

    // Monthly P&L from transactions
    const monthlyFinance = await Transaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, { $abs: "$amount" }, 0],
            },
          },
          refunds: {
            $sum: {
              $cond: [{ $eq: ["$type", "refund"] }, { $abs: "$amount" }, 0],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = monthlyFinance.map((m) => ({
      month: months[m._id.month] || "N/A",
      revenue: m.revenue,
      expenses: m.expenses,
      profit: m.revenue - m.expenses - m.refunds,
    }));

    // If no transaction data, compute from orders
    if (monthlyData.length === 0) {
      const orderMonthly = await Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]);

      orderMonthly.forEach((m) => {
        monthlyData.push({
          month: months[m._id.month],
          revenue: m.revenue,
          expenses: Math.round(m.revenue * 0.65),
          profit: Math.round(m.revenue * 0.35),
        });
      });
    }

    // Expense category breakdown
    const expenseBreakdown = await Transaction.aggregate([
      { $match: { type: "expense" } },
      {
        $group: {
          _id: "$category",
          amount: { $sum: { $abs: "$amount" } },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    const totalExpenseAmt = expenseBreakdown.reduce((s, e) => s + e.amount, 0);
    const expenseCategories = expenseBreakdown.map((e, i) => {
      const colors = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];
      return {
        name: e._id || "Other",
        value: totalExpenseAmt > 0 ? Math.round((e.amount / totalExpenseAmt) * 100) : 0,
        amount: e.amount,
        color: colors[i % colors.length],
      };
    });

    // Recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(20)
      .lean();

    // Totals
    const totals = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, { $abs: "$amount" }, 0] },
          },
          totalRefunds: {
            $sum: { $cond: [{ $eq: ["$type", "refund"] }, { $abs: "$amount" }, 0] },
          },
        },
      },
    ]);

    const t = totals[0] || { totalIncome: 0, totalExpenses: 0, totalRefunds: 0 };

    // If no transaction data, compute from orders
    if (t.totalIncome === 0) {
      const orderTotal = await Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]);
      t.totalIncome = orderTotal[0]?.total || 0;
      t.totalExpenses = Math.round(t.totalIncome * 0.65);
    }

    // Tax calculations (Bangladesh VAT = 15%)
    const vatRate = 0.15;
    const taxSummary = {
      vatCollected: Math.round(t.totalIncome * vatRate),
      vatPayable: Math.round(t.totalIncome * vatRate * 0.5),
      incomeTaxProvision: Math.round((t.totalIncome - t.totalExpenses) * 0.25),
      totalTaxLiability: 0,
    };
    taxSummary.totalTaxLiability = taxSummary.vatPayable + taxSummary.incomeTaxProvision;

    return NextResponse.json({
      monthlyData,
      expenseCategories,
      recentTransactions,
      totals: {
        revenue: t.totalIncome,
        expenses: t.totalExpenses,
        refunds: t.totalRefunds,
        profit: t.totalIncome - t.totalExpenses - t.totalRefunds,
        profitMargin: t.totalIncome > 0
          ? parseFloat((((t.totalIncome - t.totalExpenses - t.totalRefunds) / t.totalIncome) * 100).toFixed(1))
          : 0,
      },
      taxSummary,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const transaction = await Transaction.create(body);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
