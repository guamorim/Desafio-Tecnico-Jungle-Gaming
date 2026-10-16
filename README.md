# Jungle NFT Marketplace

Marketplace de NFTs desenvolvido como solução para o [desafio frontend da Jungle](https://github.com/junglegaming/frontend-challenge).

A aplicação simula a descoberta e a compra de NFTs com dados determinísticos, interface responsiva, autenticação persistente e uma arquitetura preparada para checkout e eventos em tempo real.

As principais decisões técnicas e os pontos de extensão estão documentados em [`ARCHITECTURE.md`](./ARCHITECTURE.md).

> Status: em desenvolvimento. Homepage, detalhes dos NFTs, carrinho, autenticação, perfil privado e favoritos estão funcionais e responsivos. Checkout, carteiras e tempo real fazem parte das próximas etapas.

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

## Tecnologias

- React 19
- TypeScript 6
- Vite 8
- TanStack Router
- TanStack Query e Query Devtools
- Axios
- MSW
- Tailwind CSS 4
- shadcn/ui com Base UI
- Lucide React
- Space Mono
- ESLint
- Playwright

Socket.IO e Lighthouse fazem parte das próximas etapas do desafio. O Playwright cobre os fluxos concluídos em Chromium desktop e mobile.

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
│   │   ├── mutations/           # Login, cadastro, perfil e logout
│   │   ├── queries/             # Query global da sessão
│   │   ├── auth-provider.tsx    # Sessão e modal disponíveis em todas as rotas
│   │   └── types.ts
│   └── nfts/
│       ├── api/                 # Catálogo, detalhes e favoritos
│       ├── components/          # Filtros, cards, galeria e detalhes
│       ├── mutations/           # Favorito otimista e rollback
│       ├── queries/             # Query options do TanStack Query
│       ├── catalog-filters.ts
│       ├── catalog-search.ts
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
│   ├── handlers.ts              # Endpoints de NFTs e carrinho
│   └── mock-database.ts         # Banco mockado persistente
└── routes/
    ├── __root.tsx               # Layout raiz e rodapé
    ├── cart.tsx                 # Carrinho
    ├── favorites.tsx            # Lista de interesse privada
    ├── index.tsx                # Homepage
    ├── nfts/$nftId.tsx          # Detalhes de um NFT
    └── profile.tsx              # Perfil privado
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
```

Cupons determinísticos disponíveis para validação manual:

| Código | Resultado esperado |
| --- | --- |
| `JUNGLE10` | Aplica 10% de desconto. |
| `GENESIS20` | Retorna erro de cupom expirado. |
| Qualquer outro | Retorna erro de cupom inválido. |

As rotas do carrinho usam o header `X-Cart-Owner-Id`. Para visitantes anônimos, o cliente cria um identificador com `crypto.randomUUID()` e o mantém no `localStorage`. Contas autenticadas usam uma identidade determinística derivada do ID do usuário. Essa mesma identidade compõe a chave de cache do TanStack Query e é enviada explicitamente por cada mutation.

Ao autenticar, a API mescla os itens e o cupom do visitante no carrinho da conta, respeita os limites vigentes e esvazia o carrinho anônimo somente depois da transferência. Ao trocar de conta, a aplicação troca também a query do carrinho. Logout e expiração retornam à identidade anônima; autenticar novamente a mesma conta recupera seu carrinho persistido sem expor os itens de outro usuário.

As rotas privadas usam `Authorization: Bearer <token>`. O interceptor do Axios anexa o token automaticamente. Favoritos são derivados exclusivamente da sessão autenticada e persistidos por `userId`; o cliente não escolhe a conta que será alterada. Usuários e sessões são persistidos somente no navegador para fins de demonstração; limpar os dados do site restaura as fixtures.

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

Para validar autenticação, crie também uma conta nova. Ela permanecerá disponível após recarregar a página no mesmo navegador. Alterar a senha no perfil exige a senha atual e o logout permite validar o novo acesso.

As respostas possuem latência simulada para permitir a inspeção dos skeletons e transições de carregamento.

## Variáveis de ambiente

O MSW é habilitado por padrão. Para executar a aplicação sem os mocks, crie `.env.local`:

```env
VITE_ENABLE_MOCKS=false
```

Somente o valor exato `false` desabilita os mocks. Variáveis públicas do Vite precisam começar com `VITE_`.

## Decisões atuais

- O Figma fornece referências desktop para perfil e carteiras, mas não define essas telas no mobile. O perfil mobile foi projetado pelo autor do projeto; a adaptação mobile de carteiras seguirá a mesma abordagem autoral, preservando o sistema visual das referências fornecidas.
- As imagens são locais e otimizadas em WebP.
- Os 12 NFTs do catálogo possuem artes próprias em WebP.
- Os 12 NFTs possuem descrição, atributos e avaliação próprios.
- Todos os NFTs possuem quatro edições comerciais.
- Somente o Aurora Ape possui uma imagem diferente para cada edição.
- Botões editoriais sem fluxo previsto no desafio permanecem apenas apresentacionais.
- Contas, sessões e alterações de perfil são locais e não representam autenticação de produção.
- Upload de avatar, login social e recuperação de senha permanecem indisponíveis nesta etapa.
- O projeto não realiza transações reais nem depende de blockchain, extensão de carteira ou gateway de pagamento.

## Próximas etapas

- Checkout, pagamento simulado e confirmação.
- Gerenciamento e conexão mockada de carteiras.
- Upload e remoção de avatar.
- Atualizações de estoque com Socket.IO.
- Cenários adicionais de falha e regressão visual com Playwright.
- Auditoria e documentação do Lighthouse.
- Deploy público.

## Qualidade

A base atual é validada continuamente com:

```bash
npm run lint
npm run build
npm run test:e2e
```

A suíte atual possui 30 cenários executados nos projetos Chromium desktop (`1440 × 900`) e mobile (`390 × 844`), totalizando 60 execuções. Ela cobre:

- carregamento e navegação responsiva da homepage;
- pesquisa, filtros combinados, ordenação, abas, paginação, histórico e estado vazio do catálogo;
- troca de edição, indisponibilidade e estado `404` nos detalhes;
- inclusão, quantidade, persistência, remoção, cupons e totais do carrinho;
- isolamento do carrinho entre visitante e contas, troca de usuário, expiração e retomada;
- favoritos autenticados, persistência, isolamento entre contas e rollback otimista;
- bloqueio de rota privada, login, cadastro, duplicidade, persistência de sessão e logout;
- edição do perfil, rejeição da senha atual incorreta e troca de senha com novo login.

O Playwright gera o build de produção e inicia o preview com MSW antes dos testes. Falhas preservam screenshot e trace; resultados e relatórios HTML permanecem como artefatos locais e não são versionados.

Um arquivo específico pode ser executado durante o desenvolvimento:

```bash
npm run test:e2e -- catalog.spec.ts
```

## Desenvolvimento assistido por IA

Este projeto foi desenvolvido com apoio do OpenAI Codex para planejamento técnico, implementação incremental, revisão de código, depuração e documentação.

As decisões de arquitetura, priorização, validação funcional e responsabilidade pela entrega permanecem com o autor.
