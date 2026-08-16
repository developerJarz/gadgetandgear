import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShieldCheck, Truck, Cpu, Users } from "lucide-react";
import hero from "@/assets/gh-hero.jpg";

export const metadata: Metadata = {
  title: "About Gadget & Gear BD — Bangladesh's Premium Tech Store",
  description: "Gadget & Gear BD is Bangladesh's premium destination for smartphones, laptops and smart devices — with official warranty and nationwide service.",
  openGraph: { title: "About — Gadget & Gear BD", description: "Premium electronics for modern Bangladesh." },
};

export default function About() {
  return (
    <>
      <section className="container-x py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Our story</p>
          <h1 className="font-display font-bold text-5xl lg:text-6xl mt-3 leading-tight">
            Built for the <span className="text-gradient-brand">future of Bangladesh.</span>
          </h1>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Gadget & Gear BD was founded to solve one problem — buying premium electronics in Bangladesh shouldn&apos;t feel risky. No fakes, no grey market, no confusing warranty.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Every product we stock is sourced from official channels, tested in-house, and backed by real warranty from real brands. Add nationwide delivery and flexible EMI, and you get a tech store that feels like it should have existed years ago.
          </p>
          <Link href="/shop" className="mt-8 inline-flex items-center gap-2 gradient-brand text-primary-foreground px-7 py-3.5 rounded-full text-sm font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">
            Explore the store <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-accent blur-3xl opacity-50 rounded-3xl animate-pulse-glow" />
          <Image src={hero} alt="Premium gadget collection" width={1600} height={1200} className="relative rounded-3xl w-full object-cover aspect-[4/5] shadow-2xl shadow-primary/20" />
        </div>
      </section>

      <section className="bg-secondary/40 border-y border-border">
        <div className="container-x py-16 lg:py-24">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.2em] uppercase text-primary font-medium">What we stand for</p>
            <h2 className="font-display font-bold text-4xl lg:text-5xl mt-2">Four commitments to you</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, t: "100% genuine", d: "Every unit sourced from official distributors — with brand warranty." },
              { icon: Cpu,         t: "Tested in-house", d: "Every device is powered on and inspected before it ships." },
              { icon: Truck,       t: "Nationwide reach", d: "Same-day inside Dhaka, 1–3 days anywhere in Bangladesh." },
              { icon: Users,       t: "Real humans", d: "A tech-literate team answers every question, seven days a week." },
            ].map((v) => (
              <div key={v.t} className="bg-card p-7 rounded-2xl border border-border hover:shadow-lg hover:shadow-primary/5 transition">
                <div className="w-11 h-11 rounded-xl gradient-brand flex items-center justify-center text-primary-foreground">
                  <v.icon className="w-5 h-5" />
                </div>
                <p className="mt-5 font-display font-semibold">{v.t}</p>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16 lg:py-24 text-center max-w-2xl mx-auto">
        <p className="text-xs tracking-[0.2em] uppercase text-primary font-medium">By the numbers</p>
        <h2 className="font-display font-bold text-4xl mt-2">Trusted at scale</h2>
        <div className="mt-10 grid grid-cols-3 gap-6">
          {[
            { k: "50K+", v: "Happy customers" },
            { k: "500+", v: "Devices in stock" },
            { k: "4.9", v: "Service rating" },
          ].map((s) => (
            <div key={s.v}>
              <p className="font-display font-bold text-4xl text-gradient-brand">{s.k}</p>
              <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
