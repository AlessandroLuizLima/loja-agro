import { Sprout } from "lucide-react";
import Link from "next/link";
import { imageUrl } from "@/lib/types";

/** Logo enviado no painel ou, sem logo, o nome da loja em duas cores. */
export function Logo({ name, logoImageId, light = false, href = "/" }: { name: string; logoImageId: string | null; light?: boolean; href?: string }) {
  const src = imageUrl(logoImageId);
  const [first, ...rest] = name.split(" ");
  return (
    <Link href={href} aria-label={`${name} – página inicial`} className={`flex items-center gap-1.5 font-display text-[1.15rem] leading-none font-bold sm:text-xl lg:text-2xl ${light ? "text-white" : "text-petrol"}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className={`h-11 w-auto max-w-44 object-contain lg:h-12 ${light ? "rounded-lg bg-white p-1" : ""}`} />
      ) : (
        <>
          <Sprout className="size-7 shrink-0 text-brand sm:size-8" strokeWidth={2.4} />
          <span>
            {first}
            {rest.length > 0 && <span className="text-brand"> {rest.join(" ")}</span>}
          </span>
        </>
      )}
    </Link>
  );
}
