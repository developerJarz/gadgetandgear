"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Store user info in localStorage for UI (auth is in httpOnly cookie)
        localStorage.setItem("gh_auth", JSON.stringify({
          loggedIn: true,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          loginAt: new Date().toISOString(),
        }));
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Invalid email or password.");
      }
    } catch {
      setError("Connection error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4 py-12">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,oklch(0.85_0.08_250/.5),transparent_50%),radial-gradient(circle_at_70%_80%,oklch(0.88_0.09_260/.4),transparent_50%)]" />
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-pulse-glow" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center shadow-lg shadow-primary/25">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl">
            Gadget &amp; Gear<span className="text-primary">BD</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Admin Control Center</p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl shadow-primary/10 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="font-display font-semibold text-xl mb-1">Welcome back</h2>
          <p className="text-sm text-muted-foreground mb-6">Sign in with your admin credentials</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gadgethub.bd"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/80 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-border bg-background/80 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          Server-side authentication with JWT &amp; httpOnly cookies
        </p>
      </div>
    </div>
  );
}
