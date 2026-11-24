"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page grid place-items-center py-16 text-center">
      <p className="mb-2 text-7xl" aria-hidden="true">
        🐄
      </p>
      <h1 className="mb-2 text-3xl font-bold text-petrol">Ops, algo deu errado</h1>
      <p className="mb-6 max-w-md text-muted">Tivemos um problema ao carregar esta página. Tente de novo em instantes.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Tentar novamente
        </button>
        <Link href="/" className="btn border-2 border-line bg-white text-petrol">
          Página inicial
        </Link>
      </div>
    </div>
  );
}
