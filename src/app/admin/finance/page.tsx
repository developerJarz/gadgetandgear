"use client";

import { useEffect, useState } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, Receipt,
  PieChart as PieChartIcon, Download, Plus, Calendar, Filter,
  ArrowUpRight, ArrowDownRight, Loader2, X,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/export-utils";

interface MonthlyItem {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ExpenseCategoryItem {
  name: string;
  value: number;
  amount: number;
  color: string;
}

interface TransactionItem {
  _id?: string;
  id?: string;
  type: "income" | "expense" | "refund";
  description: string;
  amount: number;
  date: string;
  method: string;
  category?: string;
}

interface FinanceData {
  monthlyData: MonthlyItem[];
  expenseCategories: ExpenseCategoryItem[];
  recentTransactions: TransactionItem[];
  totals: {
    revenue: number;
    expenses: number;
    refunds: number;
    profit: number;
    profitMargin: number;
  };
  taxSummary: {
    vatCollected: number;
    vatPayable: number;
    incomeTaxProvision: number;
    totalTaxLiability: number;
  };
}

export default function FinancePage() {
  const [period, setPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: "Product Cost (COGS)",
    amount: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    method: "Bank Transfer",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchFinance = async () => {
    try {
      const res = await fetch(`/api/finance?period=${period}`);
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Failed to load finance data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFinance();
  }, [period]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.description) {
      toast.error("Please fill in amount and description");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "expense",
          amount: -Math.abs(Number(expenseForm.amount)),
          category: expenseForm.category,
          description: expenseForm.description,
          method: expenseForm.method,
          date: new Date(expenseForm.date),
        }),
      });

      if (res.ok) {
        toast.success("Expense recorded successfully!");
        setShowAddExpense(false);
        setExpenseForm({
          category: "Product Cost (COGS)",
          amount: "",
          description: "",
          date: new Date().toISOString().slice(0, 10),
          method: "Bank Transfer",
        });
        fetchFinance();
      } else {
        toast.error("Failed to add expense");
      }
    } catch {
      toast.error("Failed to submit expense");
    }
    setSubmitting(false);
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Loading financial metrics from MongoDB...</p>
        </div>
      </div>
    );
  }

  const { monthlyData, expenseCategories, recentTransactions, totals, taxSummary } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Finance</h1>
          <p className="text-sm text-muted-foreground mt-1">Revenue, expenses, profit & tax management (MongoDB-backed)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              exportToCSV(monthlyData, "financial_report");
              toast.success("Financial report exported!");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-accent transition"
          >
            <Download className="w-3.5 h-3.5" /> Export Report
          </button>
          <button
            onClick={() => setShowAddExpense(true)}
            className="inline-flex items-center gap-1.5 gradient-brand text-primary-foreground px-4 py-2 rounded-xl text-xs font-medium hover:opacity-90 transition shadow-lg shadow-primary/25"
          >
            <Plus className="w-3.5 h-3.5" /> Add Expense
          </button>
        </div>
      </div>

      {/* Finance KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `৳${(totals.revenue / 100000).toFixed(1)}L`, icon: DollarSign, trend: "+22.4%", up: true, color: "gradient-brand" },
          { label: "Total Expenses", value: `৳${(totals.expenses / 100000).toFixed(1)}L`, icon: Receipt, trend: "+8.1%", up: false, color: "bg-destructive" },
          { label: "Net Profit", value: `৳${(totals.profit / 100000).toFixed(1)}L`, icon: TrendingUp, trend: "+31.2%", up: true, color: "bg-success" },
          { label: "Profit Margin", value: `${totals.profitMargin}%`, icon: PieChartIcon, trend: "+3.2%", up: true, color: "bg-warning" },
        ].map((kpi, i) => (
          <div key={kpi.label} className="bg-card border border-border rounded-2xl p-5 animate-count-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center text-primary-foreground`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-medium ${kpi.up ? "text-success" : "text-destructive"}`}>
                {kpi.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {kpi.trend}
              </div>
            </div>
            <p className="font-display font-bold text-2xl">{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue vs Expenses Chart */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-semibold text-lg">Profit & Loss Statement</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Real revenue vs expenses vs profit</p>
          </div>
          <div className="flex gap-1">
            {(["monthly", "quarterly", "yearly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${
                  period === p ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[300px]">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" fontSize={11} stroke="var(--color-muted-foreground)" />
                <YAxis fontSize={10} stroke="var(--color-muted-foreground)" tickFormatter={(v) => `৳${(v / 100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(value: number, name: string) => [`৳${value.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expenses" />
                <Bar dataKey="profit" fill="#22c55e" radius={[4, 4, 0, 0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">No financial data available</div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Expense Breakdown</h2>
          {expenseCategories.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-36 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseCategories} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2}>
                      {expenseCategories.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, "Share"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {expenseCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                    <span className="text-xs flex-1 truncate">{cat.name}</span>
                    <span className="text-xs font-medium">৳{(cat.amount / 1000).toFixed(0)}k</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">No expenses recorded yet.</div>
          )}
        </div>

        {/* Tax Summary */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Tax Summary (Bangladesh)</h2>
          <div className="space-y-4">
            {[
              { label: "VAT Collected (15%)", value: taxSummary.vatCollected, color: "text-primary" },
              { label: "VAT Payable", value: taxSummary.vatPayable, color: "text-warning" },
              { label: "Income Tax Provision", value: taxSummary.incomeTaxProvision, color: "text-destructive" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm">{item.label}</span>
                <span className={`font-display font-semibold ${item.color}`}>৳{item.value.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm font-semibold">Total Tax Liability</span>
              <span className="font-display font-bold text-lg text-destructive">৳{taxSummary.totalTaxLiability.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Method</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((txn, idx) => (
                <tr key={txn._id || txn.id || idx} className="border-b border-border/50 hover:bg-accent/30 transition">
                  <td className="py-2.5 px-3 font-medium text-xs">{txn.description}</td>
                  <td className="py-2.5 px-3 hidden sm:table-cell text-muted-foreground text-xs">{txn.method || "—"}</td>
                  <td className="py-2.5 px-3 hidden md:table-cell text-muted-foreground text-xs">
                    {new Date(txn.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className={`py-2.5 px-3 text-right font-display font-semibold ${txn.amount >= 0 ? "text-success" : "text-destructive"}`}>
                    {txn.amount >= 0 ? "+" : ""}৳{Math.abs(txn.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No recent transactions.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-xl">Add Expense</h2>
              <button onClick={() => setShowAddExpense(false)} className="p-1 hover:bg-accent rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>Product Cost (COGS)</option>
                  <option>Shipping & Courier</option>
                  <option>Marketing & Ads</option>
                  <option>Staff Salaries</option>
                  <option>Rent & Utilities</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount (৳)</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office rent for August"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Payment Method</label>
                  <select
                    value={expenseForm.method}
                    onChange={(e) => setExpenseForm({ ...expenseForm, method: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option>Bank Transfer</option>
                    <option>bKash</option>
                    <option>Nagad</option>
                    <option>Cash</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddExpense(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25 disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
