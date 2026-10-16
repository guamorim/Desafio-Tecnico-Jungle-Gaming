# Jungle NFT Marketplace

Marketplace de NFTs desenvolvido como solução para o [desafio frontend da Jungle](https://github.com/junglegaming/frontend-challenge).

O projeto tem como objetivo implementar os fluxos de descoberta, compra e gerenciamento da conta de um colecionador, com dados simulados, suporte a desktop e mobile e atenção a acessibilidade, performance e qualidade das interações.

> Status: em desenvolvimento. A fundação da aplicação e o catálogo responsivo estão configurados com hero adaptável, busca, filtros, multiseleção de categorias, abas, ordenação e paginação sincronizados com a URL, Axios, TanStack Query, MSW e componentes React tipados.

## Tecnologias configuradas

- React 19
- TypeScript 6
- Vite 8
- TanStack Router com rotas baseadas em arquivos
- TanStack Query para estado remoto e cache
- TanStack Query Devtools no ambiente de desenvolvimento
- Axios como cliente HTTP
- MSW para simulação da API no navegador
- Tailwind CSS 4
- shadcn/ui com Base UI
- Lucide React
- Space Mono
- ESLint

## Stack restante do desafio

As próximas etapas integrarão Socket.IO, Playwright e auditorias com Lighthouse.

## Requisitos

- Node.js 24
- npm 12

Essas são as versões usadas no ambiente de desenvolvimento atual.

## Instalação

```bash
git clone https://github.com/guamorim/Desafio-Tecnico-Jungle-Gaming.git
cd Desafio-Tecnico-Jungle-Gaming
npm install
```

## Execução local

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local da aplicação.

## Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento com atualização automática. |
| `npm run build` | Verifica os tipos e gera o bundle de produção em `dist`. |
| `npm run lint` | Executa a análise estática do código. |
| `npm run preview` | Serve localmente o bundle gerado pelo build. |

## Estrutura atual

```text
.
├── public/
│   ├── images/
│   │   └── nfts/                  # Artes locais otimizadas do catálogo
│   └── mockServiceWorker.js       # Service Worker gerado pelo MSW
├── src/
│   ├── components/
│   │   ├── home/
│   │   │   └── home-hero.tsx      # Hero responsivo da página inicial
│   │   ├── layout/
│   │   │   └── mobile-home-header.tsx
│   │   └── ui/
│   │       ├── button.tsx          # Botão gerado pelo shadcn/ui
│   │       ├── sheet.tsx           # Drawer acessível do shadcn/ui
│   │       └── skeleton.tsx        # Base visual para carregamento
│   ├── features/
│   │   └── nfts/
│   │       ├── api/
│   │       │   └── list-nfts.ts   # Requisição do catálogo
│   │       ├── components/
│   │       │   ├── category-multiselect.tsx
│   │       │   ├── desktop-catalog-filters.tsx
│   │       │   ├── mobile-catalog-filters.tsx
│   │       │   ├── nft-card.tsx   # Card apresentacional de NFT
│   │       │   ├── nft-catalog-empty-state.tsx
│   │       │   ├── nft-catalog-pagination.tsx
│   │       │   ├── nft-catalog-skeleton.tsx
│   │       │   ├── nft-catalog-sort.tsx
│   │       │   └── nft-catalog-tabs.tsx
│   │       ├── queries/
│   │       │   └── nft-list-query.ts
│   │       ├── catalog-filters.ts  # Opções e limites dos filtros
│   │       ├── catalog-search.ts   # Estado e validação da URL
│   │       └── types.ts           # Contratos dos NFTs e paginação
│   ├── lib/
│   │   ├── http-client.ts         # Instância compartilhada do Axios
│   │   ├── query-client.ts        # Configuração do TanStack Query
│   │   └── utils.ts
│   ├── mocks/
│   │   ├── fixtures/
│   │   │   └── nfts.ts            # Dados determinísticos
│   │   ├── browser.ts             # Worker usado pelo navegador
│   │   ├── enable-mocking.ts      # Inicialização condicional
│   │   └── handlers.ts            # Endpoints simulados
│   ├── routes/
│   │   ├── __root.tsx
│   │   └── index.tsx
│   ├── index.css
│   ├── main.tsx
│   └── routeTree.gen.ts
└── components.json
```

O arquivo `src/routeTree.gen.ts` é gerado automaticamente e não deve ser editado manualmente.

Os componentes em `src/components/ui` são adicionados pelo CLI do shadcn/ui, passam a fazer parte do código-fonte do projeto e podem ser adaptados à identidade visual do marketplace.

## Variáveis de ambiente

Os mocks do MSW são habilitados por padrão para que o projeto funcione sem um backend externo.

Para desabilitá-los, crie um arquivo `.env.local`:

```env
VITE_ENABLE_MOCKS=false
```

Somente o valor exato `false` desabilita os mocks. Variáveis expostas ao código do navegador pelo Vite precisam começar com `VITE_`.

## Dados simulados

O endpoint disponível atualmente é:

```text
GET /api/nfts
```

Ele devolve uma lista determinística de 12 NFTs e aceita busca textual, multiseleção de categorias, rede, preço mínimo, preço máximo, abas, ordenação e paginação. Uma latência simulada de 500 ms permite observar o estado de carregamento da interface.

Cada NFT possui uma data fixa em `listedAt` e um indicador público `isTrending`. Esses dados mantêm as abas e a ordenação reproduzíveis independentemente do relógio do ambiente.

A rota inicial apresenta os itens em cards semânticos e em um grid mobile-first de uma a três colunas. As imagens são servidas localmente em WebP para manter a demonstração independente de serviços externos.

### Parâmetros disponíveis

| Parâmetro | Descrição |
| --- | --- |
| `q` | Busca por nome, criador ou coleção. |
| `categories` | Categorias separadas por vírgula, combinadas com lógica OR. |
| `network` | Filtra por Ethereum, Polygon ou Solana. |
| `minimumPrice` | Define o preço mínimo em ETH. |
| `maximumPrice` | Define o preço máximo em ETH. |
| `tab` | Seleciona `new` ou `trending`; a ausência representa todos os NFTs. |
| `sort` | Ordena por `price-asc` ou `price-desc`; a ausência representa itens recentes. |
| `page` | Seleciona a página do catálogo. |
| `scenario=empty` | Produz um estado vazio determinístico. |

### Cenários determinísticos

Com o servidor de desenvolvimento em execução, os seguintes cenários podem ser acessados diretamente:

| URL | Resultado esperado |
| --- | --- |
| `http://localhost:5173/` | Primeira página do catálogo, com 9 dos 12 NFTs. |
| `http://localhost:5173/?page=2` | Segunda página do catálogo, com os 3 NFTs restantes. |
| `http://localhost:5173/?q=ape` | Busca textual por nome, criador ou coleção. |
| `http://localhost:5173/?q=maya` | NFTs associados à criadora Maya K. |
| `http://localhost:5173/?categories=generative` | NFTs da categoria generativa. |
| `http://localhost:5173/?categories=generative,collectibles` | NFTs generativos ou colecionáveis. |
| `http://localhost:5173/?network=ethereum` | NFTs publicados na rede Ethereum. |
| `http://localhost:5173/?categories=generative,collectibles&network=ethereum` | Categorias combinadas com a rede Ethereum. |
| `http://localhost:5173/?minimumPrice=0.5&maximumPrice=2` | NFTs entre 0,5 e 2 ETH. |
| `http://localhost:5173/?categories=photography&network=ethereum` | Estado vazio produzido por filtros sem correspondência. |
| `http://localhost:5173/?tab=new` | Seis NFTs publicados entre 7 e 12 de outubro de 2026. |
| `http://localhost:5173/?tab=trending` | Seis NFTs marcados como itens em alta. |
| `http://localhost:5173/?tab=trending&network=ethereum` | Itens em alta publicados na rede Ethereum. |
| `http://localhost:5173/?sort=price-asc` | Catálogo ordenado do menor para o maior preço. |
| `http://localhost:5173/?sort=price-desc` | Catálogo ordenado do maior para o menor preço. |
| `http://localhost:5173/?categories=generative,collectibles&sort=price-asc` | Categorias combinadas e ordenadas por preço crescente. |
| `http://localhost:5173/?q=nao-existe` | Estado vazio produzido por uma busca sem resultados. |
| `http://localhost:5173/?scenario=empty` | Estado vazio após a latência simulada. |

Em telas mobile, a busca e o drawer de filtros atualizam os parâmetros da URL. No desktop, uma sidebar permite combinar categorias, rede e faixa de preço.

O filtro de categorias aceita múltiplas opções. As categorias são combinadas com lógica OR, enquanto categorias, rede, preço e busca são combinados entre si com lógica AND.

O TanStack Router valida `page`, `q`, `categories`, `network`, `minimumPrice`, `maximumPrice`, `tab`, `sort` e `scenario`. Categorias inválidas ou repetidas são eliminadas, e valores padrão como `tab=all` e `sort=recent` são omitidos para manter URLs canônicas. O TanStack Query inclui o estado validado na chave do cache, e o Axios encaminha os parâmetros para a API.

O MSW aplica busca, filtros e aba; em seguida ordena o conjunto resultante e somente então divide a resposta em páginas de 9 itens. Essa ordem impede que a ordenação produza páginas incompletas ou inconsistentes.

O parâmetro da primeira página é omitido para manter a URL canônica: `/` representa a página 1 e `/?page=2` representa a página 2. Os controles de paginação preservam os demais filtros durante a navegação.

Requisições de navegação e assets comuns passam pelo MSW sem avisos. Chamadas inesperadas de API e outros frames de rede continuam produzindo avisos no console para não ocultar falhas de integração.

O fluxo atual é:

```text
URL → TanStack Router → TanStack Query → Axios → MSW → fixtures
```

Quando uma navegação substitui uma consulta ainda em andamento, o `AbortSignal` fornecido pelo TanStack Query é encaminhado ao Axios para cancelar a requisição obsoleta.

Autenticação, carteiras, pagamentos e eventos em tempo real ainda serão simulados. O projeto não realizará transações reais nem dependerá de blockchain, extensões de carteira ou gateways de pagamento.

## Qualidade

A base atual é validada com:

```bash
npm run lint
npm run build
```

Os testes E2E, a regressão visual e os resultados do Lighthouse serão documentados durante as próximas etapas da implementação.
