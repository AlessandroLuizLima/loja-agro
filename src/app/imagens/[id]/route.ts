import { getImage } from "@/lib/server/images";

/** Fotos de produtos e logo, guardadas no banco. O ID muda a cada envio, então podem ficar em cache para sempre. */
export async function GET(_req: Request, ctx: RouteContext<"/imagens/[id]">) {
  const { id } = await ctx.params;
  const image = /^[0-9a-f]{32}$/.test(id) ? getImage(id) : undefined;
  if (!image) return new Response("Imagem não encontrada", { status: 404 });
  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
