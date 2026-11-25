import { daysSummary } from "./dates";
import { brl, formatPhone } from "./format";
import type { DeliveryZone, Settings } from "./types";

/**
 * Páginas institucionais montadas a partir das configurações da loja.
 * Textos-modelo: o lojista deve revisá-los (de preferência com um advogado) antes de publicar.
 */

/** Data da versão atual da Política de Privacidade (atualize ao mudar o texto). */
export const PRIVACY_UPDATED = "24/11/2026";

export type InfoPage = { slug: string; title: string; group: "institucional" | "politicas"; intro: string; sections: { heading: string; body: string[] }[] };

export function infoPages(s: Settings, zones: DeliveryZone[]): InfoPage[] {
  const phone = formatPhone(s.whatsapp);
  const fullAddress = `${s.address}, ${s.city} – ${s.state}`;
  const dpo = s.dpoName || `a própria ${s.storeName}`;
  const privacyEmail = s.dpoEmail || s.email;
  const privacyContact = privacyEmail ? `${privacyEmail} ou WhatsApp ${phone}` : `WhatsApp ${phone}`;

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
            zones.length > 0 ? "Ou receba na sua casa, no dia de entrega do seu bairro." : "",
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
      intro: `Como a ${s.storeName} trata os seus dados pessoais, de acordo com a Lei Geral de Proteção de Dados (LGPD – Lei 13.709/2018). Atualizada em ${PRIVACY_UPDATED}.`,
      sections: [
        {
          heading: "Quem cuida dos seus dados",
          body: [
            `A controladora dos dados é ${s.legalName || s.storeName}${s.cnpj ? `, CNPJ ${s.cnpj}` : ""}, com endereço em ${fullAddress}.`,
            `Encarregado pelo tratamento de dados: ${dpo}. Contato: ${privacyContact}.`,
          ],
        },
        {
          heading: "Quais dados coletamos",
          body: [
            "No pedido: nome, celular, e-mail (opcional), endereço de entrega (só se você escolher receber em casa) e observações que você escrever.",
            "Se criar uma conta: nome, e-mail, celular e senha. A senha é guardada de forma embaralhada (criptografia de mão única): nem a loja consegue lê-la.",
            "Para segurança: o endereço IP das tentativas de login, para bloquear quem tenta adivinhar senhas.",
            "Não pedimos nem guardamos dados de cartão. O Pix é pago direto no aplicativo do seu banco.",
          ],
        },
        {
          heading: "Para que usamos",
          body: [
            "Para separar, entregar e combinar o seu pedido, e para avisar você sobre ele pelo WhatsApp (execução do contrato de compra, art. 7º, V, da LGPD).",
            "Para manter o site e a sua conta seguros (legítimo interesse, art. 7º, IX) e cumprir obrigações legais, como as fiscais (art. 7º, II).",
            "Não usamos seus dados para propaganda e não vendemos nem alugamos seus dados para ninguém.",
          ],
        },
        {
          heading: "Com quem compartilhamos",
          body: [
            "Com ninguém, a não ser quando necessário para atender você: a empresa que hospeda o site (os dados ficam guardados no servidor dela) e o WhatsApp, quando você ou a loja iniciam uma conversa por ele.",
            "Também podemos fornecer dados quando a lei ou uma autoridade exigir.",
          ],
        },
        {
          heading: "Por quanto tempo guardamos",
          body: [
            `Os dados pessoais de pedidos concluídos ou cancelados são apagados automaticamente ${s.retentionMonths} meses depois. O pedido continua registrado (produtos, valores e datas), sem nada que identifique você.`,
            "Os dados da conta ficam enquanto ela existir. Você pode excluí-la quando quiser.",
            "Os registros de acesso ao painel da loja são guardados por 12 meses.",
          ],
        },
        {
          heading: "Cookies",
          body: [
            "Usamos só um cookie essencial, para manter você conectado na sua conta, e guardamos o carrinho no seu próprio aparelho. Não usamos cookies de propaganda nem de rastreamento.",
          ],
        },
        {
          heading: "Como protegemos",
          body: [
            "Conexão criptografada (HTTPS), senhas embaralhadas, acesso ao painel da loja só com senha forte, bloqueio após várias tentativas erradas e registro de quem acessou e alterou dados.",
          ],
        },
        {
          heading: "Seus direitos",
          body: [
            "Você pode, a qualquer momento: confirmar se tratamos seus dados, ter acesso a eles, corrigi-los, pedir a exclusão, receber uma cópia (portabilidade) e saber com quem foram compartilhados (art. 18 da LGPD).",
            "Se tem conta: em Minha conta você vê e corrige seu e-mail e celular, troca a senha e exclui a conta sozinho, na hora.",
            `Para receber uma cópia dos seus dados, se comprou sem cadastro, ou para qualquer outro pedido: fale com o encarregado em ${privacyContact}. Respondemos em até 15 dias.`,
            "Se não ficar satisfeito, você pode reclamar na Autoridade Nacional de Proteção de Dados (ANPD), em gov.br/anpd.",
          ],
        },
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
