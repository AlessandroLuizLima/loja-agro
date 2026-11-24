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
    <div className="reveal mb-5 flex items-end justify-between gap-3 lg:mb-7">
      <div>
        <h2 id={id} className="flex items-center gap-2.5 font-display text-[clamp(1.35rem,4.5vw,1.9rem)] font-bold tracking-tight text-petrol">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-dark">
            <Sprout className="size-5" />
          </span>
          {title}
        </h2>
        {typeof subtitle === "string" ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : subtitle}
      </div>
      {href && (
        <Link href={href} className="group/link flex items-center gap-1 text-sm font-semibold whitespace-nowrap text-brand-dark">
          {linkLabel} <span className="transition group-hover/link:translate-x-1">→</span>
        </Link>
      )}
    </div>
  );
}
