import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Youtube, Phone, MessageCircle, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brand-dark text-primary-foreground mt-24 border-t border-white/10">
      <div className="container-x py-16 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity" aria-label="Home">
            <div className="relative h-14 sm:h-16 w-[180px] sm:w-[220px] flex items-center shrink-0">
              <Image
                src="/logo.png"
                alt="Logo"
                width={256}
                height={151}
                className="w-full h-full object-contain object-left drop-shadow-lg"
              />
            </div>
          </Link>
          <p className="text-sm opacity-70 max-w-sm leading-relaxed">
            Bangladesh&apos;s premium destination for smartphones, laptops, audio and smart tech — with official warranty, 0% EMI and nationwide express delivery.
          </p>

          {/* Contact Details */}
          <div className="pt-2 space-y-2 text-xs opacity-90">
            <a
              href="tel:+8801677248045"
              className="flex items-center gap-2 hover:text-accent transition font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-accent" />
              <span>+880 1677-248045</span>
            </a>
            <a
              href="https://wa.me/8801677248045"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-accent transition font-medium"
            >
              <MessageCircle className="w-3.5 h-3.5 text-success" />
              <span>WhatsApp: +880 1677-248045</span>
            </a>
            <a
              href="mailto:support@gadgetandgear.bd"
              className="flex items-center gap-2 hover:text-accent transition opacity-80"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>support@gadgetandgear.bd</span>
            </a>
          </div>

          <div className="pt-2 flex gap-3">
            {[
              { icon: Instagram, href: "#", label: "Instagram" },
              { icon: Facebook, href: "#", label: "Facebook" },
              { icon: Youtube, href: "#", label: "Youtube" },
            ].map(({ icon: Icon, href, label }, i) => (
              <a
                key={i}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/10 hover:border-accent transition"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-4 font-display">Shop</p>
          <ul className="space-y-2.5 text-sm opacity-70">
            <li><Link href="/shop?category=smartphones" className="hover:opacity-100 hover:text-accent transition">Smartphones</Link></li>
            <li><Link href="/shop?category=laptops" className="hover:opacity-100 hover:text-accent transition">Laptops</Link></li>
            <li><Link href="/shop?category=earbuds" className="hover:opacity-100 hover:text-accent transition">Earbuds & Audio</Link></li>
            <li><Link href="/shop?category=smartwatches" className="hover:opacity-100 hover:text-accent transition">Smart Watches</Link></li>
            <li><Link href="/shop?category=monitors" className="hover:opacity-100 hover:text-accent transition">Gaming & Monitors</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium mb-4 font-display">Support</p>
          <ul className="space-y-2.5 text-sm opacity-70">
            <li><a href="#" className="hover:opacity-100 hover:text-accent transition">Warranty & Service</a></li>
            <li><a href="#" className="hover:opacity-100 hover:text-accent transition">Delivery & Shipping</a></li>
            <li><a href="#" className="hover:opacity-100 hover:text-accent transition">EMI Options (0%)</a></li>
            <li><a href="#" className="hover:opacity-100 hover:text-accent transition">Track Order</a></li>
            <li><Link href="/contact" className="hover:opacity-100 hover:text-accent transition">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-display font-medium mb-4">Company</p>
          <ul className="space-y-2.5 text-sm opacity-70">
            <li><Link href="/about" className="hover:opacity-100 hover:text-accent transition">About Us</Link></li>
            <li><a href="#" className="hover:opacity-100 hover:text-accent transition">Store Locations</a></li>
            <li><a href="#" className="hover:opacity-100 hover:text-accent transition">Official BD Warranty</a></li>
            <li><Link href="/contact" className="hover:opacity-100 hover:text-accent transition">Help & Support</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright & Branding */}
      <div className="border-t border-primary-foreground/10 bg-black/20">
        <div className="container-x py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-80">
          <p>
            © {new Date().getFullYear()} <span className="font-semibold text-primary-foreground">Gadget & Gear BD</span>. Designed & Developed by{" "}
            <a
              href="https://jarzdigital.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent font-semibold hover:underline underline-offset-4 transition"
            >
              JarzDigital
            </a>
            . All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-accent">Hotline: +880 1677-248045</span>
            <span className="opacity-40">|</span>
            <p>bKash · Nagad · Rocket · COD · 0% EMI</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

