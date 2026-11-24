import type { ReactNode } from "react";
import { PawIcon } from "../icons";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="container-page grid place-items-center py-8 lg:py-14">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-card sm:p-8">
        <PawIcon className="mb-3 size-10 text-brand" />
        <h1 className="text-2xl font-bold text-petrol">{title}</h1>
        <p className="mb-6 text-sm text-muted">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
