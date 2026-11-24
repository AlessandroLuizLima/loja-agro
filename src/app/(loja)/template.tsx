import type { ReactNode } from "react";

/** Template monta de novo a cada navegação: a página nova entra com um fade suave. */
export default function StoreTemplate({ children }: { children: ReactNode }) {
  return <div className="page-in">{children}</div>;
}
