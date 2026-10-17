# Jungle NFT Marketplace

Marketplace de NFTs desenvolvido como solução para o [desafio frontend da Jungle](https://github.com/junglegaming/frontend-challenge).

A aplicação simula a descoberta e a compra de NFTs com dados determinísticos, interface responsiva, autenticação persistente, checkout idempotente e eventos em tempo real reconciliados com a API.

As principais decisões técnicas e os pontos de extensão estão documentados em [`ARCHITECTURE.md`](./ARCHITECTURE.md).

> Status: em desenvolvimento. Homepage, detalhes dos NFTs, carrinho, autenticação, perfil privado, avatar, favoritos, carteiras, checkout com pedidos e a integração em tempo real estão funcionais e responsivos. Auditoria final e deploy fazem parte das próximas etapas.

## Funcionalidades implementadas

### Homepage

- Cabeçalhos específicos para desktop e mobile.
- Barra inferior exclusiva da homepage mobile, com acesso ao carrinho e contador sincronizado.
- Hero responsivo baseado na referência visual.
- Busca por nome, criador ou coleção.
- Filtro de categorias com multisseleção.
- Filtros de rede e faixa de preço.
- Abas para todos os NFTs, novos lançamentos e itens em alta.
- Ordenação por data e preço.
- Paginação preservando busca, filtros e ordenação.
- Estado do catálogo sincronizado com a URL.
- Skeleton, erro com nova tentativa e estado vazio.
- NFT em destaque na sidebar desktop.
- Duas chamadas editoriais.
- Seção “Diário da Cunhagem”.
- Rodapé global e responsivo.

### Detalhes do NFT

- Rota dinâmica e tipada `/nfts/$nftId`.
- Skeleton, erro genérico e estado `404`.
- Galeria com imagem própria para cada NFT.
- Quatro edições por NFT: `ABERTA`, `1/50`, `1/10` e `1/1`.
- Imagem diferente para cada edição do Aurora Ape.
- Sincronização bidirecional entre miniatura e versão do Aurora Ape.
- Reutilização da imagem principal entre as edições dos demais NFTs.
- Preço, estoque e limite de compra próprios para cada edição.
- Controle de quantidade respeitando disponibilidade e limite.
- Avaliação agregada e comentários simulados.
- Descrição, atributos e avaliação próprios para cada NFT.
- Metadados de token e coleção.
- Informações de rede, contrato ERC-721 e direitos autorais.
- Cópia da URL do NFT para a área de transferência.
- Lista compacta de NFTs da mesma coleção.
- Layout específico para desktop e mobile.

### Carrinho

- Rota tipada e responsiva `/cart`.
- Identidade estável para visitantes anônimos.
- Identidade própria para cada conta autenticada.
- Isolamento entre o carrinho do visitante e os carrinhos de usuários diferentes.
- Transferência dos itens do visitante para a conta durante login ou cadastro.
- Retomada do carrinho da conta após expiração da sessão e novo login.
- Consulta do carrinho com TanStack Query.
- Inclusão de uma edição pelo painel de compra.
- Alteração de quantidade, remoção individual e limpeza completa.
- Aplicação e remoção de cupom promocional.
- Tratamento de cupom inválido e expirado.
- Validação de NFT, edição, quantidade, estoque e limite no MSW.
- Subtotal, desconto, taxa de rede e total calculados pela API simulada.
- Cálculos de ETH com inteiros arbitrários, sem erros de ponto flutuante.
- Skeleton, erro recuperável e estado vazio.
- Recomendações que excluem NFTs presentes no carrinho.
- Navegação pelos cabeçalhos desktop e pelo detalhe mobile.
- Contador de unidades sincronizado nos cabeçalhos desktop.
- Persistência do banco mockado no `localStorage`.
- Atualização do cache após cada mutation bem-sucedida.
- Mensagens de sucesso e erro na interface.

### Autenticação e perfil

- Login e cadastro responsivos em modal sobre a homepage no desktop e cartão dedicado no mobile.
- Criação de novas contas com validação por campo e bloqueio de e-mail duplicado.
- Hash de senha com PBKDF2 e salt individual usando Web Crypto.
- Sessões mockadas com token, expiração e persistência no `localStorage`.
- Revalidação automática da sessão no momento da expiração.
- Retorno seguro à identidade anônima quando a sessão expira.
- Header e navegação mobile sincronizados com a sessão em todas as rotas.
- Rota privada e tipada `/profile` com estado de acesso bloqueado para visitantes.
- Edição de nome, username, e-mail, ENS e apelido da carteira.
- Alteração opcional de senha mediante confirmação da senha atual.
- Upload, persistência e remoção de avatar em PNG, JPEG ou WebP, com limite de 1 MB.
- Validação de unicidade de e-mail e username na API simulada.
- Migração automática de contas armazenadas antes da evolução do modelo.
- Logout global com limpeza do token e do cache da sessão.
- Login com Google, Facebook e recuperação de senha exibidos como indisponíveis, pois não fazem parte do backend simulado.

### Favoritos

- Rota privada e responsiva `/favorites` acessível pela navegação mobile e pelo perfil.
- Consulta, inclusão e remoção por endpoints REST protegidos.
- Persistência da lista de interesse por usuário no banco mockado.
- Estado consistente nos cards, nos detalhes e na lista de favoritos.
- Cache separado pela identidade do visualizador, sem vazamento durante troca de contas.
- Atualização otimista com restauração do snapshot quando a API falha.
- Estado vazio, acesso bloqueado para visitantes e erro recuperável.

### Carteiras

- Rota privada e tipada `/wallets`.
- Cadastro e edição de uma carteira principal e uma secundária por usuário.
- Campos de apelido, rede, endereço, provedor, nome do perfil, ENS, e-mail e indicação.
- Validação de endereços Ethereum, Polygon e Solana na API simulada.
- Tratamento de endereço duplicado e demais erros por campo.
- Persistência no `localStorage` e isolamento entre contas.
- Cache remoto separado por usuário e removido em logout, troca de conta ou expiração.
- Reprodução da referência desktop e layout mobile autoral, com navegação própria da conta e formulários em cartões, pois o Figma não fornece essa tela em viewport móvel.
- Conexão, recusa e desconexão simuladas no checkout, com rede e provedor selecionáveis.

### Pagamento e pedidos

- Rota privada e responsiva `/checkout`, acessível pelo resumo do carrinho.
- Revisão dos NFTs, edições, quantidades, subtotal, desconto, taxa de rede e total devolvidos pela API.
- Seleção de carteira cadastrada, rede e conector antes da confirmação.
- Conexão e desconexão mockadas, incluindo cenário determinístico de recusa pelo usuário.
- Revalidação de versão, preço e disponibilidade do carrinho no momento da compra.
- Criação de pedidos protegida por `Idempotency-Key`, impedindo cobranças duplicadas em novas tentativas.
- Recuperação da mesma tentativa depois de timeout sem criar um segundo pedido.
- Estados persistentes `pending`, `confirmed` e `refused` por usuário.
- Confirmação assíncrona consultada por polling e preservada após recarregar a página.
- Baixa de estoque e limpeza dos itens comprados somente após a confirmação.
- Carrinho preservado quando o pagamento é recusado.
- Rota privada `/orders/$orderId`, isolada por conta, com recibo, snapshot financeiro e transação simulada.
- Cenários mockados por query string para validação: `wallet-rejected`, `payment-refused` e `order-timeout`.
- Nenhuma carteira real, blockchain ou cobrança externa é utilizada.

### Atualizações em tempo real

- Conexão efetiva com `socket.io-client` e servidor simulado por `@mswjs/socket.io-binding`.
- Eventos `nft.updated` refletem preço e disponibilidade no catálogo, detalhes, carrinho e checkout.
- Eventos `order.updated` atualizam o pedido sem polling enquanto o socket está conectado.
- Eventos duplicados ou com versão antiga são descartados por identidade e versão do recurso.
- Reconexões refazem pela API REST todas as consultas ativas de NFTs, carrinho e pedidos.
- Trocas de sessão encerram a conexão anterior e criam uma nova inscrição vinculada ao token atual.
- Mudanças de cotação no checkout bloqueiam a confirmação até uma revisão explícita dos novos valores.
- Quando o socket cai, pedidos pendentes voltam temporariamente ao polling REST e continuam recuperáveis.

## Tecnologias

- React 19
- TypeScript 6
- Vite 8
- TanStack Router
- TanStack Query e Query Devtools
- Axios
- MSW
- Socket.IO Client e MSW Socket.IO Binding
- Tailwind CSS 4
- shadcn/ui com Base UI
- Lucide React
- Space Mono
- ESLint
- Playwright

Lighthouse faz parte das próximas etapas do desafio. O Playwright cobre os fluxos concluídos em Chromium desktop e mobile.

## Requisitos

- Node.js 24
- npm 12

Essas são as versões utilizadas no ambiente de desenvolvimento atual.

## Instalação

```bash
git clone https://github.com/guamorim/Desafio-Tecnico-Jungle-Gaming.git
cd Desafio-Tecnico-Jungle-Gaming
npm install
npx playwright install chromium
```

## Execução local

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local da aplicação, normalmente `http://localhost:5173`.

## Comandos

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Verifica os tipos e gera o bundle de produção. |
| `npm run lint` | Executa a análise estática do projeto. |
| `npm run preview` | Serve localmente o bundle de produção. |
| `npm run test:e2e` | Executa os testes Playwright em Chromium desktop e mobile. |
| `npm run test:e2e:ui` | Abre a interface interativa do Playwright. |
| `npm run test:e2e:report` | Abre o último relatório HTML. |

## Estrutura principal

```text
public/
├── images/nfts/                 # Artes WebP usadas na demonstração
└── mockServiceWorker.js         # Service Worker gerado pelo MSW

tests/e2e/                       # Testes de navegador com Playwright
playwright.config.ts             # Viewports, servidor e artefatos E2E

src/
├── components/
│   ├── home/                    # Hero, destaque e conteúdo editorial
│   ├── layout/                  # Cabeçalhos, container e rodapé global
│   └── ui/                      # Componentes do shadcn/ui
├── features/
│   ├── cart/
│   │   ├── api/                 # Consulta e alterações do carrinho
│   │   ├── components/          # Página, estados e recomendações
│   │   ├── mutations/           # Mutations do TanStack Query
│   │   ├── queries/             # Query e chave do carrinho
│   │   ├── guest-owner.ts       # Identidade persistida do visitante
│   │   ├── use-cart-owner-id.ts # Identidade derivada da sessão atual
│   │   └── types.ts
│   ├── auth/
│   │   ├── api/                 # Login, cadastro, sessão e perfil
│   │   ├── components/          # Modal, formulários e perfil responsivo
│   │   ├── mutations/           # Login, cadastro, perfil, avatar e logout
│   │   ├── queries/             # Query global da sessão
│   │   ├── auth-provider.tsx    # Sessão e modal disponíveis em todas as rotas
│   │   └── types.ts
│   ├── nfts/
│   │   ├── api/                 # Catálogo, detalhes e favoritos
│   │   ├── components/          # Filtros, cards, galeria e detalhes
│   │   ├── mutations/           # Favorito otimista e rollback
│   │   ├── queries/             # Query options do TanStack Query
│   │   ├── catalog-filters.ts
│   │   ├── catalog-search.ts
│   │   └── types.ts
│   ├── checkout/
│   │   ├── api/                 # Criação e consulta de pedidos
│   │   ├── components/          # Pagamento e confirmação responsivos
│   │   ├── mutations/           # Criação idempotente do pedido
│   │   ├── queries/             # Polling do estado do pedido
│   │   └── types.ts
│   └── wallets/
│       ├── api/                 # Consulta, criação e edição de carteiras
│       ├── components/          # Formulários responsivos
│       ├── mutations/           # Persistência e atualização do cache
│       ├── queries/             # Query isolada por usuário
│       └── types.ts
├── lib/
│   ├── http-client.ts           # Instância compartilhada do Axios
│   ├── query-client.ts          # Configuração do TanStack Query
│   └── utils.ts
├── mocks/
│   ├── fixtures/nfts.ts         # Dados determinísticos
│   ├── browser.ts
│   ├── enable-mocking.ts
│   ├── auth-handlers.ts         # Endpoints de autenticação e perfil
│   ├── wallet-handlers.ts       # Endpoints protegidos de carteiras
│   ├── handlers.ts              # Composição dos handlers REST
│   └── mock-database.ts         # Banco mockado persistente
└── routes/
    ├── __root.tsx               # Layout raiz e rodapé
    ├── cart.tsx                 # Carrinho
    ├── checkout.tsx             # Pagamento e conexão da carteira
    ├── favorites.tsx            # Lista de interesse privada
    ├── index.tsx                # Homepage
    ├── nfts/$nftId.tsx          # Detalhes de um NFT
    ├── orders/$orderId.tsx      # Confirmação privada do pedido
    ├── profile.tsx              # Perfil privado
    └── wallets.tsx              # Carteiras privadas
```

O arquivo `src/routeTree.gen.ts` é gerado automaticamente pelo TanStack Router e não deve ser editado manualmente.

Os componentes adicionados pelo shadcn/ui passam a fazer parte do código-fonte e podem ser adaptados à identidade visual do projeto.

## Arquitetura de dados

O fluxo principal é:

```text
Interface
  → TanStack Router
  → TanStack Query
  → Axios
  → MSW
  → fixtures e banco mockado
```

O TanStack Router valida e tipa o estado presente na URL. O TanStack Query usa esse estado em suas chaves de cache, enquanto o Axios envia os parâmetros para a API REST simulada pelo MSW.

Quando uma consulta é substituída durante a navegação, o `AbortSignal` fornecido pelo TanStack Query é encaminhado ao Axios para cancelar a requisição anterior.

### Endpoints simulados

```text
GET  /api/nfts
GET  /api/nfts/:nftId
GET  /api/favorites
POST /api/favorites/:nftId
DELETE /api/favorites/:nftId
GET  /api/cart
POST /api/cart/items
POST /api/cart/merge
PATCH /api/cart/items/:itemId
DELETE /api/cart/items/:itemId
DELETE /api/cart/items
POST /api/cart/coupon
DELETE /api/cart/coupon
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/session
POST /api/auth/logout
PATCH /api/auth/profile
PATCH /api/auth/profile/avatar
DELETE /api/auth/profile/avatar
GET  /api/wallets
POST /api/wallets
PATCH /api/wallets/:walletId
POST /api/wallets/:walletId/connection
DELETE /api/wallets/:walletId/connection
POST /api/orders
GET  /api/orders/:orderId
```

Cupons determinísticos disponíveis para validação manual:

| Código | Resultado esperado |
| --- | --- |
| `JUNGLE10` | Aplica 10% de desconto. |
| `GENESIS20` | Retorna erro de cupom expirado. |
| Qualquer outro | Retorna erro de cupom inválido. |

As rotas do carrinho usam o header `X-Cart-Owner-Id`. Para visitantes anônimos, o cliente cria um identificador com `crypto.randomUUID()` e o mantém no `localStorage`. Contas autenticadas usam uma identidade determinística derivada do ID do usuário. Essa mesma identidade compõe a chave de cache do TanStack Query e é enviada explicitamente por cada mutation.

Ao autenticar, a API mescla os itens e o cupom do visitante no carrinho da conta, respeita os limites vigentes e esvazia o carrinho anônimo somente depois da transferência. Ao trocar de conta, a aplicação troca também a query do carrinho. Logout e expiração retornam à identidade anônima; autenticar novamente a mesma conta recupera seu carrinho persistido sem expor os itens de outro usuário.

As rotas privadas usam `Authorization: Bearer <token>`. O interceptor do Axios anexa o token automaticamente. Favoritos, carteiras e pedidos são derivados exclusivamente da sessão autenticada e persistidos por `userId`; o cliente não escolhe a conta que será alterada. Usuários, sessões, avatares, carteiras, pedidos e estoque são persistidos somente no navegador para fins de demonstração; limpar os dados do site restaura as fixtures.

Contas determinísticas disponíveis para teste:

| E-mail | Senha |
| --- | --- |
| `ana@kurio.test` | `Kurio#2026` |
| `leo@kurio.test` | `Jungle#2026` |

Os endpoints do carrinho validam:

- existência do NFT;
- existência da edição;
- formato e valor da quantidade;
- estoque disponível;
- limite máximo por compra;
- quantidade já presente no carrinho.

O MSW devolve erros `400`, `404` ou `409` conforme o problema encontrado.

## Parâmetros do catálogo

| Parâmetro | Descrição |
| --- | --- |
| `q` | Busca por nome, criador ou coleção. |
| `categories` | Categorias separadas por vírgula e combinadas com lógica OR. |
| `network` | Filtra por Ethereum, Polygon ou Solana. |
| `minimumPrice` | Preço mínimo em ETH. |
| `maximumPrice` | Preço máximo em ETH. |
| `tab` | Seleciona `new` ou `trending`; a ausência representa todos. |
| `sort` | Seleciona `price-asc` ou `price-desc`; a ausência representa recentes. |
| `page` | Página atual do catálogo. |
| `scenario=empty` | Força um resultado vazio determinístico. |

Busca, categorias, rede e preço são combinados com lógica AND. Categorias selecionadas entre si usam lógica OR.

Valores inválidos ou repetidos são normalizados. Valores padrão, como página 1, `tab=all` e `sort=recent`, são omitidos para manter URLs canônicas.

## Cenários para teste manual

Com o servidor executando em `http://localhost:5173`:

| URL | Resultado esperado |
| --- | --- |
| `/` | Homepage e primeira página do catálogo. |
| `/?page=2` | Segunda página do catálogo. |
| `/?q=ape` | Busca textual. |
| `/?categories=generative,collectibles` | Multisseleção de categorias. |
| `/?network=ethereum` | NFTs da rede Ethereum. |
| `/?minimumPrice=0.5&maximumPrice=2` | NFTs dentro da faixa de preço. |
| `/?tab=new` | Novos lançamentos. |
| `/?tab=trending` | Itens em alta. |
| `/?sort=price-asc` | Ordenação por menor preço. |
| `/?q=nao-existe` | Estado vazio produzido pela busca. |
| `/?scenario=empty` | Estado vazio forçado pelo MSW. |
| `/nfts/nft-aurora-ape` | Detalhes, edições e compra do Aurora Ape. |
| `/nfts/nft-inexistente` | Estado de NFT não encontrado. |
| `/cart` | Carrinho persistente, edição de itens e resumo financeiro. |
| `/profile` | Perfil privado; solicita login quando não há sessão. |
| `/wallets` | Cadastro e edição das carteiras principal e secundária. |
| `/checkout` | Revisão do pagamento, seleção e conexão da carteira. |
| `/orders/$orderId` | Acompanhamento e confirmação privada do pedido. |

Para validar autenticação, crie também uma conta nova. Ela permanecerá disponível após recarregar a página no mesmo navegador. Alterar a senha no perfil exige a senha atual e o logout permite validar o novo acesso.

As respostas possuem latência simulada para permitir a inspeção dos skeletons e transições de carregamento.

## Variáveis de ambiente

O MSW é habilitado por padrão. Para executar a aplicação sem os mocks, crie `.env.local`:

```env
VITE_ENABLE_MOCKS=false
```

Somente o valor exato `false` desabilita os mocks. Variáveis públicas do Vite precisam começar com `VITE_`.

## Decisões atuais

- O Figma fornece referências desktop para perfil e carteiras, mas não define essas telas no mobile. As versões mobile foram projetadas pelo autor do projeto, preservando a hierarquia e o sistema visual das referências fornecidas.
- As imagens são locais e otimizadas em WebP.
- Os 12 NFTs do catálogo possuem artes próprias em WebP.
- Os 12 NFTs possuem descrição, atributos e avaliação próprios.
- Todos os NFTs possuem quatro edições comerciais.
- Somente o Aurora Ape possui uma imagem diferente para cada edição.
- Botões editoriais sem fluxo previsto no desafio permanecem apenas apresentacionais.
- Contas, sessões e alterações de perfil são locais e não representam autenticação de produção.
- Login social e recuperação de senha permanecem indisponíveis nesta etapa.
- Avatares são armazenados como Data URL no banco mockado local e limitados a 1 MB para respeitar a capacidade do `localStorage`.
- O cadastro, a conexão, a recusa e a desconexão de carteiras são simulados e funcionais.
- O projeto não realiza transações reais nem depende de blockchain, extensão de carteira ou gateway de pagamento; o link do explorador aponta para uma transação fictícia na Sepolia.
- O Figma não fornece confirmação mobile. Essa tela foi projetada de forma autoral a partir do recibo desktop e do sistema visual mobile existente.

## Próximas etapas

- Cenários adicionais de falha e regressão visual com Playwright.
- Auditoria Lighthouse e otimização do bundle.
- Revisão final da documentação.
- Deploy público.

## Qualidade

A base atual é validada continuamente com:

```bash
npm run lint
npm run build
npm run test:e2e
```

A suíte possui 49 cenários validados nos projetos Chromium desktop (`1440 × 900`) e mobile (`390 × 844`), totalizando 98 execuções aprovadas. Ela cobre:

- carregamento e navegação responsiva da homepage;
- pesquisa, filtros combinados, ordenação, abas, paginação, histórico e estado vazio do catálogo;
- troca de edição, indisponibilidade e estado `404` nos detalhes;
- inclusão, quantidade, persistência, remoção, cupons e totais do carrinho;
- isolamento do carrinho entre visitante e contas, troca de usuário, expiração e retomada;
- favoritos autenticados, persistência, isolamento entre contas e rollback otimista;
- bloqueio de rota privada, login, cadastro, duplicidade, persistência de sessão e logout;
- edição do perfil, rejeição da senha atual incorreta e troca de senha com novo login.
- upload, persistência, validação e remoção de avatar;
- acesso privado, criação, edição, persistência, validação e isolamento de carteiras.
- pagamento protegido, conexão, recusa e desconexão de carteira, pedido confirmado ou recusado, retomada idempotente após timeout e isolamento entre contas.
- atualização em tempo real de preço e estoque, remoção de edição esgotada, revisão de cotação, descarte de eventos duplicados ou antigos e reconciliação REST após queda do socket.

O Playwright gera o build de produção e inicia o preview com MSW antes dos testes. Falhas preservam screenshot e trace; resultados e relatórios HTML permanecem como artefatos locais e não são versionados.

Um arquivo específico pode ser executado durante o desenvolvimento:

```bash
npm run test:e2e -- catalog.spec.ts
```

## Desenvolvimento assistido por IA

Este projeto foi desenvolvido com apoio do OpenAI Codex para planejamento técnico, implementação incremental, revisão de código, depuração e documentação.

As decisões de arquitetura, priorização, validação funcional e responsabilidade pela entrega permanecem com o autor.
