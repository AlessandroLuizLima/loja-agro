/** Páginas institucionais. Textos-modelo: revise com o jurídico antes de publicar. */

export type InfoPage = { slug: string; title: string; group: "institucional" | "politicas"; intro: string; sections: { heading: string; body: string[] }[] };

export const STORE = {
  name: "PetHouse",
  legalName: "PetHouse Comércio de Produtos Pet LTDA",
  cnpj: "00.000.000/0001-00",
  whatsapp: "5511900000000",
  whatsappLabel: "(11) 90000-0000",
  email: "contato@pethouse.com.br",
  hours: "Seg a Sex, 9h às 18h · Sáb, 9h às 13h",
  address: "Rua dos Pets, 123 – Vila Madalena, São Paulo – SP",
};

export const infoPages: InfoPage[] = [
  {
    slug: "quem-somos",
    title: "Quem somos",
    group: "institucional",
    intro: "A PetHouse nasceu em 2020 da vontade de facilitar a vida de quem ama cães e gatos.",
    sections: [
      { heading: "Nossa missão", body: ["Levar produtos de qualidade para a casa de cada tutor, com preço justo, entrega rápida e um atendimento que trata seu pet como da família."] },
      { heading: "Como escolhemos os produtos", body: ["Trabalhamos apenas com marcas registradas no MAPA e testamos pessoalmente brinquedos e acessórios antes de colocá-los na loja."] },
    ],
  },
  {
    slug: "clube-pethouse",
    title: "Clube PetHouse",
    group: "institucional",
    intro: "Assine os itens que seu pet usa todo mês e economize 15% em cada entrega.",
    sections: [
      { heading: "Como funciona", body: ["Escolha os produtos, defina a frequência (15, 30, 45 ou 60 dias) e receba em casa automaticamente.", "Use o cupom ASSINE15 na sua primeira compra de assinatura."] },
      { heading: "Sem fidelidade", body: ["Pause, altere ou cancele quando quiser, direto na sua conta."] },
    ],
  },
  {
    slug: "fale-conosco",
    title: "Fale conosco",
    group: "institucional",
    intro: "Estamos aqui para ajudar você e seu pet.",
    sections: [
      { heading: "WhatsApp", body: [`${STORE.whatsappLabel} — resposta em até 15 minutos no horário comercial.`] },
      { heading: "E-mail", body: [`${STORE.email} — resposta em até 1 dia útil.`] },
      { heading: "Horário de atendimento", body: [STORE.hours] },
      { heading: "Loja física", body: [STORE.address] },
    ],
  },
  {
    slug: "trocas-e-devolucoes",
    title: "Trocas e devoluções",
    group: "politicas",
    intro: "Sua satisfação é garantida. Você tem até 30 dias para trocar ou devolver.",
    sections: [
      { heading: "Direito de arrependimento", body: ["Conforme o art. 49 do Código de Defesa do Consumidor, você pode desistir da compra em até 7 dias após o recebimento, com reembolso integral."] },
      { heading: "Trocas", body: ["Produtos sem uso, na embalagem original, podem ser trocados em até 30 dias. A primeira troca tem frete grátis.", "Rações e petiscos abertos não podem ser trocados, exceto em caso de defeito."] },
      { heading: "Como solicitar", body: ["Acesse Minha conta > Pedidos ou fale com a gente pelo WhatsApp informando o número do pedido."] },
    ],
  },
  {
    slug: "politica-de-privacidade",
    title: "Política de privacidade",
    group: "politicas",
    intro: "Tratamos seus dados de acordo com a Lei Geral de Proteção de Dados (LGPD – Lei 13.709/2018).",
    sections: [
      { heading: "Dados que coletamos", body: ["Nome, e-mail, telefone, CPF e endereço, usados exclusivamente para processar pedidos, emitir nota fiscal e prestar atendimento."] },
      { heading: "Pagamentos", body: ["Não armazenamos dados de cartão. Os pagamentos são processados por intermediadores certificados PCI-DSS."] },
      { heading: "Seus direitos", body: [`Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento pelo e-mail ${STORE.email}.`] },
    ],
  },
  {
    slug: "termos-de-uso",
    title: "Termos de uso",
    group: "politicas",
    intro: "Ao usar este site, você concorda com as condições abaixo.",
    sections: [
      { heading: "Preços e estoque", body: ["Preços e disponibilidade podem mudar sem aviso. O valor válido é o exibido no momento da finalização do pedido."] },
      { heading: "Cupons", body: ["Cupons não são cumulativos e valem uma vez por CPF, salvo indicação contrária."] },
    ],
  },
  {
    slug: "prazos-de-entrega",
    title: "Prazos de entrega",
    group: "politicas",
    intro: "Entregamos para todo o Brasil pelos Correios e transportadoras parceiras.",
    sections: [
      { heading: "Prazos", body: ["Sudeste: PAC de 4 a 6 dias úteis, SEDEX de 1 a 2 dias úteis.", "Demais regiões: PAC de 6 a 10 dias úteis, SEDEX de 2 a 4 dias úteis.", "O prazo começa a contar após a aprovação do pagamento."] },
      { heading: "Frete grátis", body: ["Compras acima de R$ 199 (após cupons) têm frete grátis na modalidade PAC."] },
      { heading: "Retirada na loja", body: [`Grátis, em até 2 horas após a aprovação, em ${STORE.address}.`] },
    ],
  },
];

export const getInfoPage = (slug: string) => infoPages.find((p) => p.slug === slug);
