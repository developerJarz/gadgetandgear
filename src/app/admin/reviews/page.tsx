"use client";

import { useState } from "react";
import { Star, Search, CheckCircle, XCircle, MessageSquare, Flag, ThumbsUp, Eye } from "lucide-react";
import { toast } from "sonner";

interface Review { id: string; customer: string; product: string; rating: number; title: string; content: string; status: "Pending" | "Approved" | "Rejected" | "Flagged"; date: string; helpful: number; }

const demoReviews: Review[] = [
  { id: "R-001", customer: "Tanvir Ahmed", product: "Galaxy Flagship Pro 5G", rating: 5, title: "Best phone I've ever used!", content: "Incredible performance, amazing camera quality. Battery lasts all day. Totally worth the price in Bangladesh market.", status: "Approved", date: "Aug 17, 2026", helpful: 12 },
  { id: "R-002", customer: "Sadia Khatun", product: "Pods Pro ANC Earbuds", rating: 4, title: "Great ANC, could improve bass", content: "Active noise cancellation is superb. Sound quality is good but bass could be deeper. Perfect for commuting in Dhaka traffic.", status: "Approved", date: "Aug 16, 2026", helpful: 8 },
  { id: "R-003", customer: "Rakib Hossain", product: "Aurora Ultrabook 14", rating: 2, title: "Screen flickering issue", content: "The laptop is good but I'm experiencing screen flickering after a week of use. Hoping warranty service is good.", status: "Pending", date: "Aug 18, 2026", helpful: 3 },
  { id: "R-004", customer: "Nusrat Jahan", product: "Pulse Smartwatch S3", rating: 5, title: "Love the AMOLED display!", content: "Beautiful watch face, accurate fitness tracking. The AMOLED display is gorgeous. Best smartwatch under 15k in BD.", status: "Pending", date: "Aug 18, 2026", helpful: 0 },
  { id: "R-005", customer: "Imran Khan", product: "Mech RGB Keyboard", rating: 1, title: "Keys stopped working", content: "Three keys stopped working after 2 weeks. Very disappointed with the quality. Want a refund.", status: "Flagged", date: "Aug 15, 2026", helpful: 5 },
];

const STATUS_COLORS: Record<string, string> = { Pending: "bg-warning/20 text-warning", Approved: "bg-success/20 text-success", Rejected: "bg-destructive/20 text-destructive", Flagged: "bg-destructive/20 text-destructive" };

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(demoReviews);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const pending = reviews.filter((r) => r.status === "Pending").length;
  const filtered = reviews.filter((r) => statusFilter === "all" || r.status === statusFilter).filter((r) => r.product.toLowerCase().includes(search.toLowerCase()) || r.customer.toLowerCase().includes(search.toLowerCase()));

  const updateStatus = (id: string, status: Review["status"]) => {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    toast.success(`Review ${status.toLowerCase()}`);
  };

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: reviews.filter((rv) => rv.rating === r).length, pct: (reviews.filter((rv) => rv.rating === r).length / reviews.length * 100) }));

  return (
    <div className="space-y-6">
      <div><h1 className="font-display font-bold text-3xl">Reviews & Ratings</h1><p className="text-sm text-muted-foreground mt-1">{reviews.length} reviews · {pending} pending moderation</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-1 mb-1">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? "fill-warning text-warning" : "text-muted"}`} />)}</div>
          <p className="font-display font-bold text-2xl">{avgRating}</p><p className="text-[10px] text-muted-foreground">Average Rating</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4"><p className="font-display font-bold text-2xl">{reviews.length}</p><p className="text-[10px] text-muted-foreground">Total Reviews</p></div>
        <div className="bg-card border border-border rounded-2xl p-4"><p className="font-display font-bold text-2xl text-warning">{pending}</p><p className="text-[10px] text-muted-foreground">Pending</p></div>
        <div className="bg-card border border-border rounded-2xl p-4 space-y-1.5">
          {ratingDist.map((d) => (<div key={d.rating} className="flex items-center gap-2"><span className="text-[10px] w-3">{d.rating}★</span><div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-warning" style={{ width: `${d.pct}%` }} /></div><span className="text-[10px] text-muted-foreground w-4">{d.count}</span></div>))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
        <div className="flex gap-1">{["all", "Pending", "Approved", "Rejected", "Flagged"].map((s) => (<button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${statusFilter === s ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"}`}>{s}</button>))}</div>
      </div>

      <div className="space-y-3">
        {filtered.map((review) => (
          <div key={review.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{review.customer}</span>
                  <div className="flex">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-warning text-warning" : "text-muted"}`} />)}</div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${STATUS_COLORS[review.status]}`}>{review.status}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">on <span className="font-medium text-foreground">{review.product}</span> · {review.date}</p>
                <p className="text-sm font-semibold">{review.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{review.content}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{review.helpful} helpful</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                {review.status === "Pending" && (<><button onClick={() => updateStatus(review.id, "Approved")} className="p-1.5 hover:bg-success/10 rounded-lg" title="Approve"><CheckCircle className="w-4 h-4 text-success" /></button><button onClick={() => updateStatus(review.id, "Rejected")} className="p-1.5 hover:bg-destructive/10 rounded-lg" title="Reject"><XCircle className="w-4 h-4 text-destructive" /></button></>)}
                <button onClick={() => updateStatus(review.id, "Flagged")} className="p-1.5 hover:bg-warning/10 rounded-lg" title="Flag"><Flag className="w-4 h-4 text-warning" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
