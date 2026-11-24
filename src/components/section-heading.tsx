import Link from "next/link";
import type { ReactNode } from "react";
import { Sprout } from "lucide-react";

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = "Ver todos",
  id,
}: {
  title: string;
  subtitle?: ReactNode;
  href?: string;
  linkLabel?: string;
  id?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h2 id={id} className="flex items-center gap-2 font-display text-[clamp(1.35rem,4.5vw,1.9rem)] font-bold text-petrol">
          <Sprout className="size-6 shrink-0 text-brand" />
          {title}
        </h2>
        {typeof subtitle === "string" ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : subtitle}
      </div>
      {href && (
        <Link href={href} className="text-sm font-semibold whitespace-nowrap text-brand-dark hover:underline">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
