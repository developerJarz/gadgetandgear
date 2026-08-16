export function AnnouncementBar() {
  return (
    <div className="bg-brand-dark text-primary-foreground text-[11px]">
      <div className="overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee py-1.5 gap-10">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-10 shrink-0">
              <span>⚡ Flash deals up to 40% off — today only</span>
              <span>🚚 Free delivery inside Dhaka on orders above ৳3,000</span>
              <span>💳 EMI available from 3 to 24 months</span>
              <span>🛡 1 Year Official Warranty on all flagship products</span>
              <span>📦 Cash on Delivery all over Bangladesh</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
