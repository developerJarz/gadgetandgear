"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Instagram, Facebook } from "lucide-react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <section className="container-x py-16 lg:py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_30%,oklch(0.88_0.09_260/.45),transparent_60%)]" />
        <p className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Support</p>
        <h1 className="font-display font-bold text-5xl lg:text-6xl mt-3">How can we <span className="text-gradient-brand">help?</span></h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Questions about an order, warranty, EMI or a specific product? Our team replies within an hour, seven days a week.
        </p>
      </section>

      <section className="container-x pb-16 lg:pb-24 grid lg:grid-cols-3 gap-6">
        {[
          { icon: MessageCircle, t: "WhatsApp Support", s: "+880 1677-248045", u: "https://wa.me/8801677248045" },
          { icon: Mail,          t: "Email Us",         s: "support@gadgetandgear.bd", u: "mailto:support@gadgetandgear.bd" },
          { icon: Phone,         t: "Hotline Phone",    s: "+880 1677-248045", u: "tel:+8801677248045" },
        ].map((c) => (
          <a key={c.t} href={c.u} className="group p-8 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition">
            <div className="w-11 h-11 rounded-xl gradient-brand flex items-center justify-center text-primary-foreground">
              <c.icon className="w-5 h-5" />
            </div>
            <p className="mt-5 font-display font-semibold">{c.t}</p>
            <p className="mt-1 text-sm text-muted-foreground group-hover:text-primary transition">{c.s}</p>
          </a>
        ))}
      </section>

      <section className="border-t border-border bg-secondary/40">
        <div className="container-x py-16 lg:py-24 grid lg:grid-cols-2 gap-12">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Send a message</p>
            <h2 className="font-display font-bold text-4xl mt-2">Drop us a note</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Fill in the form and we&apos;ll get back to you as soon as we can.
            </p>

            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Gadget & Gear BD — Flagship Store</p>
                  <p className="text-muted-foreground">Level 4, Bashundhara City, Panthapath, Dhaka 1205</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-accent"><Instagram className="w-4 h-4" /></a>
                <a href="#" aria-label="Facebook"  className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-accent"><Facebook className="w-4 h-4" /></a>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="bg-card p-7 lg:p-10 rounded-2xl border border-border space-y-4 shadow-lg shadow-primary/5"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs text-muted-foreground">Name</span>
                <input required className="mt-1 w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </label>
              <label className="block">
                <span className="text-xs text-muted-foreground">Email</span>
                <input required type="email" className="mt-1 w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </label>
            </div>
            <label className="block">
              <span className="text-xs text-muted-foreground">Subject</span>
              <select className="mt-1 w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Order enquiry</option>
                <option>Warranty claim</option>
                <option>EMI / payment help</option>
                <option>Product question</option>
                <option>Other</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Message</span>
              <textarea required rows={5} className="mt-1 w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </label>
            <button className="w-full py-3.5 rounded-full gradient-brand text-primary-foreground text-sm font-medium hover:opacity-90 shadow-lg shadow-primary/25">
              {sent ? "Thanks — we'll be in touch!" : "Send message"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
