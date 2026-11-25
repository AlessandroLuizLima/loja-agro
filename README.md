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
| **CEP** | Ao digitar o CEP, rua e bairro se preenchem (ViaCEP, grátis) e a região de entrega é sugerida pelo bairro; avisa se o CEP é de outra cidade |
| **Variações** | O mesmo produto em tamanhos diferentes (ex.: ração 3 kg e 15 kg) aparece como um card só, com "a partir de" e um seletor de opção na página |
| **Entrega por região** | Cada região tem taxa, valor para frete grátis e dias de rota (ex.: zona norte só às terças) |
| **Pagamento** | Pix pelo site com QR Code (desconto opcional) ou pagar na retirada/entrega (dinheiro com troco, cartão ou Pix) |
| **Confirmação** | Página do pedido com QR Pix e botão que manda o resumo pronto para o WhatsApp da loja |
| **Pedir de novo** | No histórico, um toque põe no carrinho os itens de um pedido antigo, com preço e estoque de hoje |
| **Conta** (opcional) | Cadastro, login, histórico de pedidos, confirmação de e-mail e celular por código, troca de senha e exclusão da conta. Também dá para comprar sem cadastro |

### Para o lojista (painel)

| | |
| --- | --- |
| **Início** | Pedidos novos, pedidos do dia (e atrasados), vendas de 24 h/7/30 dias, estoque baixo |
| **Alerta de pedido novo** | Com o painel aberto (no balcão ou no celular), pedido novo aparece sozinho com som, aviso na tela e notificação do sistema. Com o serviço de e-mail configurado, a loja também recebe um e-mail a cada pedido |
| **Pedidos** | Filtro por etapa, botão de próximo passo (Confirmar → Separado → Saiu para entrega → Entregue), marcar como pago, cancelar (devolve ao estoque), imprimir para separação e **mensagem pronta no WhatsApp do cliente** |
| **Produtos** | Cadastro com foto (reduzida no próprio celular antes de enviar), preço "de/por", unidade (saco 25 kg…), estoque, destaque, ocultar. Ajuste rápido de estoque na lista. **Variações:** grupo e nome da opção no cadastro. **Planilha:** baixa todos os produtos, edita no Excel e importa de volta (preço e estoque de tudo de uma vez), ou cadastra centenas de produtos novos, com conferência linha a linha antes de gravar |
| **Categorias** | Nome, ícone, cor, ordem, visível ou não |
| **Entregas** | Dias de retirada e regiões de entrega (taxa, grátis acima de, dias da rota) |
| **Cupons** | Código, % de desconto, compra mínima, pausar/reativar, quantas vezes foi usado |
| **Clientes** | Quem tem cadastro, nº de pedidos e total gasto, atalho para o WhatsApp |
| **Configurações** | **Nome, logo e cores da loja**, textos da página inicial, contato, endereço, redes sociais, chave Pix, domínio, dados de privacidade (LGPD) e troca de senha |
| **Segurança** | Registro de quem entrou no painel e do que foi alterado, com alerta de tentativas de login com senha errada |

### Segurança

O painel **só abre com login de administrador**: sem login, qualquer página do painel leva para a tela de entrada, e toda ação (salvar produto, mudar pedido, trocar configurações) confere no servidor se quem está logado é administrador.

Em produção, cada loja usa um **endereço secreto** para o painel (`ADMIN_PATH`), e `/admin` responde "página não encontrada". O endereço não fica no código nem neste README: cada lojista recebe o seu junto com a senha inicial.

| Proteção | Como funciona |
| --- | --- |
| **Endereço secreto** | Robôs que testam `/admin`, `/wp-admin` etc. nem encontram a tela de login. O login de cliente (`/conta/entrar`) não aceita contas de administrador, então ninguém consegue tentar senhas do painel (nem trancar o lojista para fora) pela loja |
| **Verificação em duas etapas** | Opcional (recomendada), ativada em Configurações: além da senha, um código de 6 números do Google Authenticator, Microsoft Authenticator ou Authy. 8 códigos de recuperação para o caso de perder o celular. O segredo fica criptografado no banco (AES-256-GCM) |
| **Senha forte no painel** | Mínimo de 10 caracteres com maiúsculas, minúsculas e números. A senha inicial (das variáveis de ambiente) **precisa ser trocada no primeiro acesso** |
| **Bloqueio de tentativas** | 5 senhas erradas na mesma conta (ou 20 no mesmo IP) bloqueiam o login por 15 minutos |
| **Sessão** | Cookie `httpOnly` assinado (HMAC). Painel desconecta em 12 horas. Trocar a senha derruba as sessões de outros aparelhos |
| **Senhas guardadas** | `scrypt` (criptografia de mão única): nem quem tem o banco consegue ler as senhas |
| **Registro de acessos** | Painel > Segurança mostra logins, senhas erradas, bloqueios e alterações (quem, o quê, quando, IP). Guardado por 12 meses |
| **Cabeçalhos HTTP** | Impede abrir o site dentro de outro (`X-Frame-Options`, `frame-ancestors`), HTTPS obrigatório em produção (HSTS), `nosniff`, sem `X-Powered-By`, páginas com dados pessoais sem cache |
| **Valores no servidor** | Preços, estoque, taxas e descontos são recalculados no servidor; o estoque baixa numa transação junto com o pedido |
| **Uploads** | Só JPG, PNG e WebP, conferidos pelo conteúdo do arquivo (SVG é recusado), até 3 MB |
| **Pedidos** | Pedido de cliente cadastrado só aparece para ele; pedido sem cadastro tem link com código aleatório. O site não pede nem guarda dados de cartão |

### LGPD (Lei 13.709/2018)

| Exigência | No sistema |
| --- | --- |
| **Transparência** | Política de Privacidade completa, montada com os dados da loja: controlador (razão social, CNPJ), encarregado, dados coletados, finalidade e base legal, compartilhamento, prazo de guarda, cookies e direitos |
| **Consentimento registrado** | Checkbox obrigatório de aceite da política no pedido e no cadastro, com data e hora guardadas |
| **Acesso e correção** | Em Minha conta, o cliente vê e corrige e-mail e celular (com confirmação por código) e troca a senha. Cópia dos dados: pedido ao encarregado, que responde em até 15 dias |
| **Exclusão** | O cliente exclui a própria conta (com senha). O lojista exclui um cliente em Painel > Clientes, ou remove os dados de um pedido sem cadastro na tela do pedido. Os pedidos ficam (registro de venda), sem dados pessoais |
| **Prazo de guarda** | Pedidos concluídos ou cancelados perdem nome, telefone, e-mail e endereço depois de X meses (padrão 24, ajustável em Configurações) |
| **Minimização** | Só o necessário para entregar o pedido; e-mail opcional; sem cookies de propaganda (por isso não há banner de cookies) |
| **Segurança** | As proteções da seção anterior (art. 46) |

**O que fica com o lojista (não é código):**

- Preencher em Configurações o **encarregado** e o e-mail de privacidade, e revisar a política com o contador/advogado.
- Responder pedidos de clientes sem cadastro em até 15 dias.
- Ter um **contrato** com você (quem mantém o sistema) dizendo que a loja é a controladora e você é o operador dos dados.
- Avisar a ANPD e os clientes em caso de vazamento.

## Como rodar

Requisitos: **Node.js 22.13 ou superior** (recomendado 24).

```bash
npm install
cp .env.example .env.local   # preencha SESSION_SECRET e a senha do ADMIN
npm run dev
```

- Loja: http://localhost:3000
- Painel: http://localhost:3000/admin (e-mail e senha do `.env.local`; com `ADMIN_PATH` preenchido, o endereço muda)

O banco é criado sozinho em `data/loja.db` no primeiro acesso, com produtos de demonstração. Para começar do zero, apague a pasta `data/`.

**Para testar:** cupom `BEMVINDO10` (10% acima de R$ 100). Para ver o Pix com QR Code, cadastre uma chave Pix em Painel > Configurações.

## Uma loja por cliente

O mesmo código atende quantas agropecuárias você quiser. Cada cliente tem **a própria cópia rodando**, com banco, painel, senha e domínio separados: uma loja nunca vê os dados da outra.

| O que muda de uma loja para outra | Onde |
| --- | --- |
| Nome, logo, cores, textos, WhatsApp, endereço, Pix | **Painel > Configurações** (o próprio lojista pode mudar) |
| Produtos, categorias, entregas, cupons | Painel |
| Domínio (www.loja.com.br) | Registro do domínio + 1 linha no `deploy/Caddyfile` |
| E-mail/senha inicial do painel, endereço secreto do painel, segredo da sessão | Variáveis de ambiente (`deploy/.env`) |

### Colocar no ar (VPS com Docker)

Uma VPS simples (2 GB de RAM, a partir de ~R$ 30/mês em Hostinger, Contabo, DigitalOcean etc.) aguenta várias lojas.

1. **Domínio de cada loja:** registre em [registro.br](https://registro.br) (~R$ 40/ano), de preferência no CPF/CNPJ do cliente. Na zona DNS, crie um registro **A** para `@` e outro para `www` apontando para o IP da VPS.
2. **No servidor:** instale o Docker, clone este repositório e entre em `deploy/`.
3. Copie `deploy/.env.example` para `deploy/.env` e preencha domínio, segredo e e-mail/senha inicial de cada loja.
4. `docker compose up -d --build`
5. Em alguns minutos cada domínio abre com **HTTPS automático**. O lojista entra em `https://dominio/<ADMIN_PATH>` com a senha inicial, é obrigado a criar uma senha própria, ativa a verificação em duas etapas e configura a loja.

**Lojista perdeu o celular e os códigos de recuperação:** coloque o e-mail dele em `LOJA_X_ADMIN_DISABLE_2FA` no `deploy/.env`, rode `docker compose up -d`, peça para ele entrar e ativar de novo, e apague a variável.

Para a 3ª loja: copie um bloco `loja-...` no `docker-compose.yml`, um bloco no `Caddyfile` e as variáveis no `.env`.

**Atualizar todas as lojas** depois de mudar o código: `git pull && docker compose up -d --build`. Os dados ficam nos volumes e não se perdem.

**Backup** (faça todo dia, por exemplo com cron). O backup contém dados pessoais: guarde num lugar com acesso restrito e, se for para a nuvem, criptografado:

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
5. **Confirmação de e-mail e celular:** para os clientes receberem o código de verdade, crie uma conta no [Resend](https://resend.com) (e-mail, grátis até 3.000/mês) e, se quiser SMS, no [Twilio](https://www.twilio.com), e preencha as variáveis `RESEND_*`/`EMAIL_FROM` e `TWILIO_*`. Sem elas, a opção de confirmar não aparece em produção.
6. **Fotos:** as fotos de demonstração são de licença livre (créditos em `public/demo-fotos/CREDITOS.md`); numa loja de cliente, use fotos dos produtos reais dela.
7. **Avisos de pedido:** deixe o painel aberto com o alerta ligado no computador do balcão (ou no celular) e configure o Resend para o e-mail de cada pedido. Para mensagem automática no WhatsApp da loja, integre a API oficial do WhatsApp.
8. **Cadastro inicial:** peça ao lojista a planilha de produtos do sistema que ele já usa e importe em Painel > Produtos > Planilha.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Tipos das rotas + TypeScript |
| `npm test` | Testes (preços, cupons, entrega, Pix, datas, senhas e sessão) |

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
