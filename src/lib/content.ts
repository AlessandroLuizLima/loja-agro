import { daysSummary } from "./dates";
import { brl, formatPhone } from "./format";
import type { DeliveryZone, Settings } from "./types";

/**
 * Páginas institucionais montadas a partir das configurações da loja.
 * Textos-modelo: o lojista deve revisá-los (de preferência com um advogado) antes de publicar.
 */

export type InfoPage = { slug: string; title: string; group: "institucional" | "politicas"; intro: string; sections: { heading: string; body: string[] }[] };

export function infoPages(s: Settings, zones: DeliveryZone[]): InfoPage[] {
  const phone = formatPhone(s.whatsapp);
  const fullAddress = `${s.address}, ${s.city} – ${s.state}`;

  return [
    {
      slug: "quem-somos",
      title: "Quem somos",
      group: "institucional",
      intro: s.tagline,
      sections: [{ heading: s.storeName, body: s.about.split(/\n+/).filter(Boolean) }],
    },
    {
      slug: "como-comprar",
      title: "Como comprar",
      group: "institucional",
      intro: "Veja preço e estoque na hora e reserve sem precisar mandar mensagem e esperar resposta.",
      sections: [
        { heading: "1. Escolha os produtos", body: ["Navegue pelas categorias ou use a busca. Cada produto mostra o preço e se tem em estoque agora."] },
        {
          heading: "2. Escolha como receber",
          body: [
            s.pickupEnabled ? `Retire na loja (${fullAddress}) no dia que preferir: ${daysSummary(s.pickupDays)}. ${s.pickupNote}` : "",
            zones.length > 0 ? "Ou receba em casa ou no sítio, no dia de entrega da sua região." : "",
          ].filter(Boolean),
        },
        {
          heading: "3. Pague como for melhor",
          body: [
            s.pixKey ? `Pague com Pix pelo site${s.pixDiscountPercent > 0 ? ` e ganhe ${s.pixDiscountPercent}% de desconto` : ""}, ou pague na retirada/entrega.` : "Pague na retirada ou na entrega.",
            "Na retirada ou entrega aceitamos dinheiro, cartão e Pix.",
          ],
        },
        { heading: "4. Pronto!", body: ["Você recebe o número do pedido e pode avisar a loja pelo WhatsApp com um toque. A gente separa tudo para você."] },
      ],
    },
    {
      slug: "fale-conosco",
      title: "Fale conosco",
      group: "institucional",
      intro: "Estamos aqui para ajudar.",
      sections: [
        { heading: "WhatsApp", body: [phone] },
        ...(s.email ? [{ heading: "E-mail", body: [s.email] }] : []),
        { heading: "Horário de funcionamento", body: [s.hours] },
        { heading: "Endereço", body: [fullAddress] },
      ],
    },
    {
      slug: "entregas-e-retirada",
      title: "Entregas e retirada",
      group: "politicas",
      intro: "Retire na loja ou receba no dia de entrega da sua região.",
      sections: [
        ...(s.pickupEnabled ? [{ heading: "Retirada na loja (grátis)", body: [`${fullAddress}.`, `Dias: ${daysSummary(s.pickupDays)}. ${s.pickupNote}`] }] : []),
        ...zones.map((z) => ({
          heading: z.name,
          body: [
            z.areas,
            `Entregas: ${daysSummary(z.days)}. Taxa: ${z.fee === 0 ? "grátis" : brl(z.fee)}${z.freeAbove != null && z.fee > 0 ? ` (grátis acima de ${brl(z.freeAbove)})` : ""}.`,
          ].filter(Boolean),
        })),
        { heading: "Não achou sua região?", body: [`Chame no WhatsApp ${phone} que a gente combina.`] },
      ],
    },
    {
      slug: "trocas-e-devolucoes",
      title: "Trocas e devoluções",
      group: "politicas",
      intro: "Comprou e não era bem o que precisava? A gente resolve.",
      sections: [
        { heading: "Direito de arrependimento", body: ["Em compras pela internet, você pode desistir em até 7 dias após o recebimento (art. 49 do Código de Defesa do Consumidor), com devolução do valor pago."] },
        { heading: "Trocas", body: ["Produtos lacrados e sem uso podem ser trocados em até 30 dias na loja.", "Rações, sementes e medicamentos abertos não podem ser trocados, exceto em caso de defeito."] },
      ],
    },
    {
      slug: "politica-de-privacidade",
      title: "Política de privacidade",
      group: "politicas",
      intro: "Tratamos seus dados de acordo com a Lei Geral de Proteção de Dados (LGPD – Lei 13.709/2018).",
      sections: [
        { heading: "Dados que coletamos", body: ["Nome, telefone, e-mail e endereço de entrega, usados só para separar, entregar e combinar seus pedidos."] },
        { heading: "Pagamentos", body: ["Não pedimos nem guardamos dados de cartão no site. O Pix é pago direto no aplicativo do seu banco."] },
        { heading: "Seus direitos", body: [`Você pode pedir acesso, correção ou exclusão dos seus dados pelo WhatsApp ${phone}${s.email ? ` ou pelo e-mail ${s.email}` : ""}.`] },
      ],
    },
    {
      slug: "termos-de-uso",
      title: "Termos de uso",
      group: "politicas",
      intro: "Ao usar este site, você concorda com as condições abaixo.",
      sections: [
        { heading: "Preços e estoque", body: ["Preços e estoque são atualizados pela loja e podem mudar sem aviso. Vale o valor mostrado ao finalizar o pedido."] },
        { heading: "Produtos sob consulta", body: ["Produtos de venda controlada (como medicamentos que exigem receita) só são vendidos com a documentação exigida, combinada pelo WhatsApp ou na loja."] },
        { heading: "Cupons", body: ["Cupons não são cumulativos."] },
      ],
    },
  ];
}
