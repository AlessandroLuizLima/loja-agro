/**
 * Endereço do painel. Por padrão é /admin; em produção cada loja define um endereço
 * difícil de adivinhar em ADMIN_PATH (ex.: "gestao-7k2mq9"), e /admin passa a dar "página não encontrada".
 *
 * Lido em tempo de execução (não no build): a mesma imagem Docker serve lojas com endereços diferentes.
 * Só o servidor conhece o valor; componentes do navegador recebem o endereço pronto por props.
 */

const VALID = /^[a-z0-9][a-z0-9-]{5,63}$/;

/** Rotas da loja que o endereço do painel não pode ocupar. */
const RESERVED = new Set(["admin", "produto", "categoria", "ofertas", "busca", "carrinho", "checkout", "pedido", "conta", "ajuda", "imagens"]);

/** O endereço secreto configurado (sem barra), ou null se a loja usa o /admin padrão. */
export function adminSlug(raw = process.env.ADMIN_PATH): string | null {
  const slug = raw?.trim().replace(/^\/+|\/+$/g, "").toLowerCase();
  if (!slug) return null;
  if (!VALID.test(slug) || RESERVED.has(slug)) {
    console.warn(`[loja] ADMIN_PATH inválido ("${slug}"): use de 6 a 64 letras minúsculas, números e hífen. Usando /admin.`);
    return null;
  }
  return slug;
}

/** Endereço público de uma página do painel: adminUrl("/pedidos") → "/gestao-7k2mq9/pedidos". */
export function adminUrl(path = "") {
  return `/${adminSlug() ?? "admin"}${path}`;
}
