import { NextResponse, type NextRequest } from "next/server";
import { adminSlug } from "@/lib/admin-path";

/**
 * Painel em endereço secreto (ADMIN_PATH).
 * - /<ADMIN_PATH>/... é servido pelas páginas de /admin/...
 * - /admin/... responde "página não encontrada", como qualquer endereço que não existe.
 * Sem ADMIN_PATH, nada muda: o painel fica em /admin.
 */
export function proxy(request: NextRequest) {
  const slug = adminSlug();
  if (!slug) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.rewrite(new URL("/__pagina-inexistente", request.url));
  }
  if (pathname === `/${slug}` || pathname.startsWith(`/${slug}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname.slice(slug.length + 1)}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  // Não passa por arquivos estáticos nem fotos
  matcher: ["/((?!_next/|imagens/|icone\\.svg|favicon\\.ico).*)"],
};
