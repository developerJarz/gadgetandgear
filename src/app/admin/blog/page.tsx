"use client";

import { useState } from "react";
import { FileText, Plus, Search, Eye, Pencil, Trash2, Calendar, Globe, Clock, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: "Published" | "Draft" | "Scheduled";
  author: string;
  date: string;
  views: number;
  excerpt: string;
}

const demoPosts: BlogPost[] = [
  { id: "BP-001", title: "Top 10 Smartphones Under ৳30,000 in Bangladesh (2026)", slug: "top-smartphones-under-30k-bd", category: "Guides", status: "Published", author: "Admin", date: "Aug 15, 2026", views: 2450, excerpt: "Looking for the best value smartphones in Bangladesh? Here's our expert picks..." },
  { id: "BP-002", title: "Best Laptop for Students in Bangladesh - Complete Guide", slug: "best-laptop-students-bd", category: "Guides", status: "Published", author: "Admin", date: "Aug 12, 2026", views: 1820, excerpt: "Find the perfect laptop for your studies with our comprehensive buyer's guide..." },
  { id: "BP-003", title: "Eid ul-Adha Tech Gift Ideas 2026", slug: "eid-tech-gifts-2026", category: "Seasonal", status: "Published", author: "Marketing Team", date: "Aug 10, 2026", views: 3240, excerpt: "Make this Eid special with the perfect tech gifts for your loved ones..." },
  { id: "BP-004", title: "How to Check Warranty Status for Your Gadgets", slug: "check-warranty-status", category: "Support", status: "Draft", author: "Admin", date: "Aug 18, 2026", views: 0, excerpt: "Step-by-step guide to checking and claiming warranty on electronics..." },
  { id: "BP-005", title: "Victory Day Special: Bangladesh Tech Industry in 2026", slug: "victory-day-tech-industry", category: "Industry", status: "Scheduled", author: "Admin", date: "Dec 14, 2026", views: 0, excerpt: "A look at how Bangladesh's tech industry has grown..." },
];

const STATUS_COLORS: Record<string, string> = {
  Published: "bg-success/20 text-success",
  Draft: "bg-warning/20 text-warning",
  Scheduled: "bg-primary/20 text-primary",
};

export default function BlogPage() {
  const [posts] = useState(demoPosts);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const published = posts.filter((p) => p.status === "Published").length;
  const totalViews = posts.reduce((s, p) => s + p.views, 0);
  const filtered = posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Blog & CMS</h1>
          <p className="text-sm text-muted-foreground mt-1">{posts.length} posts · {published} published · {totalViews.toLocaleString()} total views</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="space-y-3">
        {filtered.map((post) => (
          <div key={post.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-semibold line-clamp-1">{post.title}</h3>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider shrink-0 ${STATUS_COLORS[post.status]}`}>{post.status}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{post.excerpt}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" />/{post.slug}</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted">{post.category}</span>
                  {post.views > 0 && <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views.toLocaleString()}</span>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button className="p-2 hover:bg-accent rounded-lg"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                <button className="p-2 hover:bg-accent rounded-lg"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                <button className="p-2 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4 text-destructive" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-xl">Create Blog Post</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowCreate(false); toast.success("Post created!"); }} className="space-y-4">
              <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label><input required placeholder="Post title" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">URL Slug</label><input placeholder="post-url-slug" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label><select className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option>Guides</option><option>Seasonal</option><option>Industry</option><option>Support</option><option>News</option></select></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label><select className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option>Draft</option><option>Published</option><option>Scheduled</option></select></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Content</label><textarea rows={8} placeholder="Write your blog post content..." className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-xs font-medium mb-2">SEO Settings</p>
                <div className="space-y-3">
                  <input placeholder="SEO Title" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                  <input placeholder="Meta Description" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">Publish Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
