import Link from "next/link";
import { PawIcon } from "./icons";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" aria-label="PetHouse - página inicial" className={`flex items-center gap-1.5 font-display text-2xl font-bold lg:text-[1.7rem] ${light ? "text-white" : "text-petrol"}`}>
      <PawIcon className="size-8 text-brand" />
      Pet<span className="text-brand">House</span>
    </Link>
  );
}
