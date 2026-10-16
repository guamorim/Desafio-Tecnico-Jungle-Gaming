# Jungle NFT Marketplace

Marketplace de NFTs desenvolvido como solução para o [desafio frontend da Jungle](https://github.com/junglegaming/frontend-challenge).

O projeto tem como objetivo implementar os fluxos de descoberta, compra e gerenciamento da conta de um colecionador, com dados simulados, suporte a desktop e mobile e atenção a acessibilidade, performance e qualidade das interações.

> Status: em desenvolvimento. A fundação da aplicação e o primeiro catálogo responsivo estão configurados com Axios, TanStack Query, MSW e componentes React tipados.

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
- Geist Variable
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
│   │   └── ui/
│   │       └── button.tsx         # Botão gerado pelo shadcn/ui
│   ├── features/
│   │   └── nfts/
│   │       ├── api/
│   │       │   └── list-nfts.ts   # Requisição do catálogo
│   │       ├── components/
│   │       │   └── nft-card.tsx   # Card apresentacional de NFT
│   │       ├── queries/
│   │       │   └── nft-list-query.ts
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

Ele devolve uma lista determinística de NFTs com metadados de paginação e uma latência simulada de 500 ms, permitindo observar o estado de carregamento da interface.

A rota inicial apresenta os itens em cards semânticos e em um grid mobile-first de uma a quatro colunas. As imagens são servidas localmente em WebP para manter a demonstração independente de serviços externos.

O fluxo atual é:

```text
HomePage → TanStack Query → Axios → MSW → fixture
```

Autenticação, carteiras, pagamentos e eventos em tempo real ainda serão simulados. O projeto não realizará transações reais nem dependerá de blockchain, extensões de carteira ou gateways de pagamento.

## Qualidade

A base atual é validada com:

```bash
npm run lint
npm run build
```

Os testes E2E, a regressão visual e os resultados do Lighthouse serão documentados durante as próximas etapas da implementação.
