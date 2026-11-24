# 🐾 PetHouse — Loja virtual pet

Loja virtual completa para o segmento pet (cães e gatos), feita com **Next.js 16**, **React 19**, **TypeScript** e **Tailwind CSS v4**. Mobile first, com foco em conversão: carrinho lateral, barra de frete grátis, desconto no Pix, parcelamento e checkout em uma página.

> "PetHouse" é um nome fictício. Produtos, preços e dados da empresa são de demonstração.

## Funcionalidades

| Área | O que tem |
| --- | --- |
| **Vitrine** | Home com banner, benefícios, categorias, ofertas da semana com contagem regressiva, mais vendidos, depoimentos e newsletter com cupom |
| **Catálogo** | Páginas de categoria com ordenação (preço, desconto, avaliação), busca sem acento, página de produto com quantidade, estoque, "Comprar agora" e produtos relacionados |
| **Carrinho** | Gaveta lateral e página completa, salvo no navegador e sincronizado entre abas, cupons (`BEMVINDO10`, `ASSINE15`) e barra de progresso para frete grátis |
| **Conta** | Cadastro e login com senha (hash `scrypt`), sessão em cookie `httpOnly` assinado, área "Minha conta" com histórico de pedidos e logout |
| **Checkout** | Compra logado ou como visitante, endereço preenchido pelo CEP (ViaCEP), frete por região (PAC, SEDEX, retirada), Pix (5% OFF), cartão em até 6x e boleto |
| **Pedido** | Confirmação com Pix copia-e-cola, linha digitável do boleto, resumo e endereço. Pedido de cliente só aparece para o próprio cliente |
| **Institucional** | Quem somos, Clube, Fale conosco, Trocas e devoluções, Privacidade (LGPD), Termos e Prazos de entrega |
| **SEO** | Metadados por página, `sitemap.xml`, `robots.txt`, dados estruturados (schema.org `Product`) e favicon |
| **Acessibilidade** | HTML semântico, menus com `<dialog>` nativo, foco visível, rótulos e mensagens de erro ligadas aos campos, respeito a "reduzir movimento" |

### Segurança

- Preços, descontos e frete são **recalculados no servidor** a partir do catálogo. O navegador não tem como alterar valores.
- Formulários validados no servidor com **Zod** (CPF com dígito verificador, e-mail, CEP, UF).
- **O número do cartão nunca é enviado ao servidor**: é validado no navegador (Luhn, validade, CVV) e só a bandeira e os 4 últimos dígitos seguem com o pedido.
- Redirecionamentos pós-login só aceitam caminhos internos, para evitar redirecionamento aberto.
- O login responde com a mesma mensagem para e-mail inexistente e senha errada, para não revelar quem tem conta.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions, Cache Components / Partial Prerendering)
- React 19 (`useActionState`, `use`)
- TypeScript, Tailwind CSS v4, [lucide-react](https://lucide.dev) (ícones)
- [Zod 4](https://zod.dev) (validação)
- SQLite nativo do Node (`node:sqlite`): sem dependência de banco externo
- [Vitest](https://vitest.dev) (testes) e GitHub Actions (CI)

## Como rodar

Requisitos: **Node.js 22.13 ou superior** (recomendado 24).

```bash
npm install
cp .env.example .env.local   # e preencha SESSION_SECRET
npm run dev
```

Abra http://localhost:3000. O banco SQLite é criado sozinho em `data/pethouse.db` no primeiro acesso.

Para gerar um `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### Dados de teste para o checkout

| Campo | Valor |
| --- | --- |
| CPF | `529.982.247-25` |
| CEP | `01310-100` (SP) ou `20040-002` (RJ) |
| Cartão | `4111 1111 1111 1111`, qualquer nome, validade futura, CVV `123` |
| Cupons | `BEMVINDO10` (10% OFF acima de R$ 99), `ASSINE15` (15% OFF) |

O pagamento é simulado: cartão é aprovado na hora; Pix e boleto ficam "aguardando pagamento".

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Gera os tipos das rotas e roda o TypeScript |
| `npm test` | Testes unitários (preços, cupons, frete, CPF, cartão, senha e sessão) |

## Estrutura

```
src/
├── app/                    # Rotas (App Router)
│   ├── page.tsx            # Home
│   ├── produto/[slug]/     # Página de produto
│   ├── categoria/[slug]/   # Categorias, Promoções e Mais vendidos
│   ├── busca/              # Busca
│   ├── carrinho/           # Carrinho
│   ├── checkout/           # Checkout + Server Action que cria o pedido
│   ├── pedido/[id]/        # Confirmação do pedido
│   ├── conta/              # Login, cadastro, Minha conta + Server Actions
│   └── ajuda/[slug]/       # Páginas institucionais e políticas
├── components/             # Componentes de interface
└── lib/
    ├── catalog.ts          # Produtos e categorias (ponto de integração com a Nuvemshop)
    ├── pricing.ts          # Regras de preço, cupons, frete e parcelas
    ├── validators.ts       # CPF, cartão, validade
    ├── content.ts          # Textos institucionais e dados da loja
    └── server/             # Só roda no servidor: banco, sessão, usuários, pedidos
```

## Personalização rápida

- **Nome, contato e CNPJ:** `src/lib/content.ts` (`STORE`)
- **Cores e fontes:** `src/app/globals.css` (bloco `@theme`) e `src/app/layout.tsx`
- **Produtos:** `src/lib/catalog.ts`
- **Cupons, frete grátis, desconto Pix e parcelas:** `src/lib/pricing.ts`
- **Redes sociais:** `src/components/footer.tsx`

## Antes de ir para produção

Este projeto funciona de ponta a ponta, mas algumas partes são simuladas e precisam ser ligadas a serviços reais:

1. **Pagamentos:** troque os códigos fictícios em `src/app/checkout/actions.ts` pelo gateway (Nuvem Pago, Mercado Pago, Pagar.me…) e use os campos de cartão do próprio gateway (tokenização). Hoje o cartão é sempre "aprovado".
2. **Catálogo e estoque:** ligue `src/lib/catalog.ts` à API da Nuvemshop (`GET /v1/{store_id}/products`) ou a um banco. O estoque não é decrementado nas vendas.
3. **Frete:** troque `shippingOptions` em `src/lib/pricing.ts` pela cotação real (Correios, Melhor Envio ou a da Nuvemshop).
4. **E-mails:** a confirmação de pedido diz que o e-mail foi enviado, mas não há envio. Integre um serviço (Resend, SendGrid…).
5. **Fotos:** os produtos usam emojis como ilustração. Use `next/image` com as fotos reais.
6. **Hospedagem:** o SQLite precisa de disco persistente (VPS, Railway, Render, Fly.io). Em serverless (Vercel), troque o banco por Postgres ou Turso, mantendo as funções de `src/lib/server/users.ts` e `orders.ts`.
7. **Textos legais:** revise as políticas em `src/lib/content.ts` com um advogado.
8. Defina `SESSION_SECRET` e `NEXT_PUBLIC_SITE_URL` no ambiente de produção.
