import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page grid place-items-center py-16 text-center">
      <p className="mb-2 text-7xl" aria-hidden="true">
        🐕‍🦺
      </p>
      <h1 className="mb-2 text-3xl font-bold text-petrol">Página não encontrada</h1>
      <p className="mb-6 max-w-md text-muted">Parece que esse caminho foi enterrado junto com o osso. Que tal voltar para a loja?</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          Ir para a página inicial
        </Link>
        <Link href="/categoria/promocoes" className="btn border-2 border-line bg-white text-petrol">
          Ver ofertas
        </Link>
      </div>
    </div>
  );
}
