import { cn } from "@/lib/utils";
import { getBrandInfo, resolveBrandLogo } from "@/lib/site-data";

interface BrandLogoProps {
  name: string;
  /** Logo stored in the database, if any. Uploaded logos win over the built-in file. */
  stored?: string | null;
  /** Size the box; the mark is contained inside it. */
  className?: string;
  /** Turn the mark into the brand colour when a parent `.group` is hovered. */
  colorOnHover?: boolean;
}

/*
 * Built-in logos render as a single-colour silhouette (CSS mask filled with currentColor),
 * so they sit evenly on light and dark backgrounds and can take the brand colour on hover.
 * Logos uploaded through the admin panel are shown as-is.
 */
export function BrandLogo({ name, stored, className, colorOnHover }: BrandLogoProps) {
  const src = resolveBrandLogo(name, stored);
  const color = getBrandInfo(name)?.color;

  if (!src) {
    return (
      <span className={cn("flex items-center justify-center font-display font-bold text-sm", className)} aria-label={name}>
        {name}
      </span>
    );
  }

  if (!src.startsWith("/brands/")) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={src} alt={name} loading="lazy" className={cn("object-contain", className)} />
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "block bg-current transition-colors duration-300",
        colorOnHover && color && "group-hover:text-[var(--brand)] group-focus-visible:text-[var(--brand)]",
        className
      )}
      style={{
        ...(color ? ({ "--brand": color } as React.CSSProperties) : {}),
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
