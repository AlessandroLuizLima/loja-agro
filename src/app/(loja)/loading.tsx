/** Esqueleto mostrado enquanto a página busca preços e estoque. */
export default function Loading() {
  return (
    <div className="container-page py-6" role="status" aria-label="Carregando">
      <div className="skeleton mb-6 h-8 w-56 rounded-full" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="skeleton aspect-square" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-4 rounded-full" />
              <div className="skeleton h-4 w-2/3 rounded-full" />
              <div className="skeleton mt-3 h-6 w-1/2 rounded-full" />
              <div className="skeleton mt-3 h-11 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
