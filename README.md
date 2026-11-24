# 🌱 Loja Agro: loja virtual para agropecuárias

Loja virtual com **painel do lojista** pensada para agropecuárias e pet shops de cidade do interior. O cliente vê **preço e estoque na hora**, **reserva pelo site** e escolhe **retirar na loja** ou **receber em casa** no dia de entrega do bairro dele. Sem precisar mandar mensagem e esperar resposta.

Feita com **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4** e **SQLite** (embutido no Node, sem servidor de banco).

> A loja de demonstração ("Agro Boa Terra") e os produtos são fictícios. Tudo é editável pelo painel.
> A versão anterior, de pet shop, está na tag `pet-v1` (`git checkout pet-v1`).

## O que tem

### Para o cliente

| | |
| --- | --- |
| **Catálogo** | Categorias, busca sem acento, ofertas com preço "de/por", estoque visível ("Últimas 3 unidades") |
| **Produtos sob consulta** | Itens que exigem receita (ex.: medicamentos) aparecem no catálogo com botão "Consultar no WhatsApp" |
| **Sem estoque** | Botão "Avise-me quando chegar" no WhatsApp, em vez de perder a venda |
| **Carrinho** | Salvo no celular, com preço e estoque atualizados pelo servidor ao abrir |
| **Retirada na loja** | Cliente escolhe o dia (hoje, amanhã…) entre os dias em que a loja abre |
| **Entrega por região** | Cada região tem taxa, valor para frete grátis e dias de rota (ex.: zona norte só às terças) |
| **Pagamento** | Pix pelo site com QR Code (desconto opcional) ou pagar na retirada/entrega (dinheiro com troco, cartão ou Pix) |
| **Confirmação** | Página do pedido com QR Pix e botão que manda o resumo pronto para o WhatsApp da loja |
| **Conta** (opcional) | Cadastro, login e histórico de pedidos. Também dá para comprar sem cadastro |

### Para o lojista (`/admin`)

| | |
| --- | --- |
| **Início** | Pedidos novos, pedidos do dia (e atrasados), vendas de 24 h/7/30 dias, estoque baixo |
| **Pedidos** | Filtro por etapa, botão de próximo passo (Confirmar → Separado → Saiu para entrega → Entregue), marcar como pago, cancelar (devolve ao estoque), imprimir para separação e **mensagem pronta no WhatsApp do cliente** |
| **Produtos** | Cadastro com foto (reduzida no próprio celular antes de enviar), preço "de/por", unidade (saco 25 kg…), estoque, destaque, ocultar. Ajuste rápido de estoque na lista |
| **Categorias** | Nome, ícone, cor, ordem, visível ou não |
| **Entregas** | Dias de retirada e regiões de entrega (taxa, grátis acima de, dias da rota) |
| **Cupons** | Código, % de desconto, compra mínima, pausar/reativar, quantas vezes foi usado |
| **Clientes** | Quem tem cadastro, nº de pedidos e total gasto, atalho para o WhatsApp |
| **Configurações** | **Nome, logo e cores da loja**, textos da página inicial, contato, endereço, redes sociais, chave Pix, domínio e troca de senha |

### Segurança

- Preços, estoque, taxas e descontos são **recalculados no servidor**. O navegador não consegue alterar valores.
- O estoque baixa numa transação junto com o pedido: dois clientes não compram a última unidade ao mesmo tempo.
- Senhas com `scrypt`, sessão em cookie `httpOnly` assinado (HMAC), mesma mensagem para e-mail inexistente e senha errada.
- Toda página e ação do painel confere se quem está logado é administrador.
- Upload só aceita JPG, PNG e WebP, conferidos pelo conteúdo do arquivo (SVG é recusado), até 3 MB.
- Pedido de cliente cadastrado só aparece para ele; pedido sem cadastro tem link com código aleatório.
- O site não pede nem guarda dados de cartão.

## Como rodar

Requisitos: **Node.js 22.13 ou superior** (recomendado 24).

```bash
npm install
cp .env.example .env.local   # preencha SESSION_SECRET e a senha do ADMIN
npm run dev
```

- Loja: http://localhost:3000
- Painel: http://localhost:3000/admin (e-mail e senha do `.env.local`)

O banco é criado sozinho em `data/loja.db` no primeiro acesso, com produtos de demonstração. Para começar do zero, apague a pasta `data/`.

**Para testar:** cupom `BEMVINDO10` (10% acima de R$ 100). Para ver o Pix com QR Code, cadastre uma chave Pix em Painel > Configurações.

## Uma loja por cliente

O mesmo código atende quantas agropecuárias você quiser. Cada cliente tem **a própria cópia rodando**, com banco, painel, senha e domínio separados: uma loja nunca vê os dados da outra.

| O que muda de uma loja para outra | Onde |
| --- | --- |
| Nome, logo, cores, textos, WhatsApp, endereço, Pix | **Painel > Configurações** (o próprio lojista pode mudar) |
| Produtos, categorias, entregas, cupons | Painel |
| Domínio (www.loja.com.br) | Registro do domínio + 1 linha no `deploy/Caddyfile` |
| E-mail/senha inicial do painel, segredo da sessão | Variáveis de ambiente (`deploy/.env`) |

### Colocar no ar (VPS com Docker)

Uma VPS simples (2 GB de RAM, a partir de ~R$ 30/mês em Hostinger, Contabo, DigitalOcean etc.) aguenta várias lojas.

1. **Domínio de cada loja:** registre em [registro.br](https://registro.br) (~R$ 40/ano), de preferência no CPF/CNPJ do cliente. Na zona DNS, crie um registro **A** para `@` e outro para `www` apontando para o IP da VPS.
2. **No servidor:** instale o Docker, clone este repositório e entre em `deploy/`.
3. Copie `deploy/.env.example` para `deploy/.env` e preencha domínio, segredo e e-mail/senha inicial de cada loja.
4. `docker compose up -d --build`
5. Em alguns minutos cada domínio abre com **HTTPS automático**. O lojista entra em `https://dominio/admin`, troca a senha e configura a loja.

Para a 3ª loja: copie um bloco `loja-...` no `docker-compose.yml`, um bloco no `Caddyfile` e as variáveis no `.env`.

**Atualizar todas as lojas** depois de mudar o código: `git pull && docker compose up -d --build`. Os dados ficam nos volumes e não se perdem.

**Backup** (faça todo dia, por exemplo com cron):

```bash
docker compose exec loja-a node -e "new (require('node:sqlite').DatabaseSync)('/data/loja.db').exec(\"VACUUM INTO '/data/backup.db'\")"
docker compose cp loja-a:/data/backup.db ./backup-loja-a-$(date +%F).db
```

> Hospedagem serverless (Vercel, Netlify) não serve como está, porque o SQLite precisa de disco permanente. Nesse caso troque o banco por Postgres ou Turso, mantendo as funções de `src/lib/server/`.

## Antes de vender para um cliente

1. **Conteúdo:** fotos reais dos produtos, preços e estoque do dia.
2. **Pix:** cadastre a chave Pix da loja. O QR Code é o padrão do Banco Central (Pix estático): o dinheiro cai direto na conta, e o lojista confere no app do banco e marca "pago" no painel. Para confirmação automática ou cartão online, integre um intermediador (Mercado Pago, PagBank, Asaas…) em `src/app/(loja)/checkout/actions.ts`.
3. **Textos legais:** revise trocas, privacidade (LGPD) e termos em `src/lib/content.ts`.
4. **Produtos controlados:** medicamentos com receita e defensivos agrícolas devem ficar como "Sob consulta".
5. **Avisos de pedido:** hoje o cliente avisa a loja pelo WhatsApp com um toque e o lojista vê o pedido no painel. Para aviso automático (e-mail ou WhatsApp API), integre um serviço como Resend ou a API oficial do WhatsApp.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Tipos das rotas + TypeScript |
| `npm test` | Testes (preços, cupons, entrega, Pix, datas, senha e sessão) |

## Estrutura

```
src/
├── app/
│   ├── (loja)/              # Loja: início, categoria, produto, ofertas, busca, carrinho,
│   │                        # checkout, pedido, conta e páginas de ajuda
│   ├── admin/
│   │   ├── entrar/          # Login do painel
│   │   ├── (painel)/        # Telas do painel (pedidos, produtos, entregas…)
│   │   └── actions/         # Server Actions do painel (todas exigem administrador)
│   ├── imagens/[id]/        # Fotos e logo, servidas do banco
│   └── layout.tsx           # Aplica nome, cores e logo da loja
├── components/              # Interface da loja e do painel (components/admin)
└── lib/
    ├── pricing.ts           # Totais, cupom, taxa de entrega, desconto Pix
    ├── pix.ts               # Pix copia e cola (BR Code) com CRC16
    ├── dates.ts             # Dias de retirada/entrega no fuso de São Paulo
    ├── whatsapp.ts          # Mensagens prontas para loja e cliente
    ├── content.ts           # Páginas de ajuda montadas com os dados da loja
    └── server/              # Só no servidor: banco, migrações, dados de exemplo,
                             # catálogo, pedidos, sessão, usuários, imagens
deploy/                      # Docker Compose + Caddy para várias lojas num servidor
```
