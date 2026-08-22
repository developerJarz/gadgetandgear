"use client";

import { useState } from "react";
import { FileText, Download, Calendar, BarChart3, DollarSign, Package, Users, ShoppingCart, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/export-utils";

const reportTypes = [
  { id: "sales", name: "Sales Report", description: "Revenue, orders, and conversion metrics", icon: ShoppingCart, color: "gradient-brand" },
  { id: "products", name: "Product Performance", description: "Top sellers, slow movers, stock analysis", icon: Package, color: "bg-warning" },
  { id: "customers", name: "Customer Report", description: "Segments, LTV, acquisition channels", icon: Users, color: "bg-success" },
  { id: "financial", name: "Financial Report", description: "P&L, expenses, tax summary", icon: DollarSign, color: "bg-destructive" },
  { id: "inventory", name: "Inventory Report", description: "Stock levels, movement, valuation", icon: Package, color: "bg-accent" },
  { id: "marketing", name: "Marketing Report", description: "Campaign performance, ROI", icon: TrendingUp, color: "bg-primary" },
];

const demoReportData = [
  { Date: "Aug 1", Orders: 23, Revenue: 345000, AvgOrderValue: 15000, Customers: 18 },
  { Date: "Aug 2", Orders: 31, Revenue: 428000, AvgOrderValue: 13806, Customers: 25 },
  { Date: "Aug 3", Orders: 18, Revenue: 245000, AvgOrderValue: 13611, Customers: 14 },
  { Date: "Aug 4", Orders: 42, Revenue: 580000, AvgOrderValue: 13810, Customers: 35 },
  { Date: "Aug 5", Orders: 28, Revenue: 392000, AvgOrderValue: 14000, Customers: 22 },
  { Date: "Aug 6", Orders: 35, Revenue: 485000, AvgOrderValue: 13857, Customers: 28 },
  { Date: "Aug 7", Orders: 19, Revenue: 268000, AvgOrderValue: 14105, Customers: 15 },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ from: "2026-08-01", to: "2026-08-18" });

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const data = demoReportData;
    const name = reportTypes.find(r => r.id === selectedReport)?.name || "Report";
    if (format === "csv") exportToCSV(data, `${name.toLowerCase().replace(/\s+/g, "_")}`);
    else if (format === "excel") exportToExcel(data, `${name.toLowerCase().replace(/\s+/g, "_")}`);
    else exportToPDF(name, data, `${name.toLowerCase().replace(/\s+/g, "_")}`);
    toast.success(`${name} exported as ${format.toUpperCase()}!`);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="font-display font-bold text-3xl">Report Center</h1><p className="text-sm text-muted-foreground mt-1">Generate, view & export business reports</p></div>

      {/* Report Types */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {reportTypes.map((report) => (
          <button key={report.id} onClick={() => setSelectedReport(report.id)} className={`p-5 rounded-2xl border text-left transition hover:shadow-lg ${selectedReport === report.id ? "border-primary/30 bg-primary/5 shadow-sm" : "border-border bg-card"}`}>
            <div className={`w-10 h-10 rounded-xl ${report.color} flex items-center justify-center text-primary-foreground mb-3`}><report.icon className="w-5 h-5" /></div>
            <h3 className="font-display font-semibold">{report.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
          </button>
        ))}
      </div>

      {selectedReport && (
        <>
          {/* Date Range & Export */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
              <span className="text-xs text-muted-foreground">to</span>
              <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleExport("csv")} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent transition"><Download className="w-3 h-3" /> CSV</button>
              <button onClick={() => handleExport("excel")} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent transition"><Download className="w-3 h-3" /> Excel</button>
              <button onClick={() => handleExport("pdf")} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg gradient-brand text-primary-foreground text-xs font-medium hover:opacity-90 transition"><Download className="w-3 h-3" /> PDF</button>
            </div>
          </div>

          {/* Report Data Preview */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border"><h2 className="font-display font-semibold text-lg">{reportTypes.find(r => r.id === selectedReport)?.name} Preview</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/50">{Object.keys(demoReportData[0]).map(key => <th key={key} className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{key}</th>)}</tr></thead>
                <tbody>{demoReportData.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-accent/30 transition">{Object.entries(row).map(([key, val]) => (
                    <td key={key} className={`py-3 px-4 ${key === "Revenue" || key === "AvgOrderValue" ? "font-display font-semibold" : ""}`}>{typeof val === "number" && key !== "Orders" && key !== "Customers" ? `৳${val.toLocaleString()}` : val}</td>
                  ))}</tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
