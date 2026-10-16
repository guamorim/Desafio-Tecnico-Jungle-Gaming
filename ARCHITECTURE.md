# Arquitetura

Este documento descreve as decisões arquiteturais atuais do Jungle NFT Marketplace e os pontos de extensão planejados para as próximas etapas do desafio.

## Objetivos

A arquitetura foi organizada para:

- manter regras de domínio fora dos componentes visuais;
- permitir a substituição dos mocks por uma API real;
- preservar estados compartilháveis do catálogo na URL;
- tratar dados assíncronos de forma previsível;
- suportar desktop e mobile com a mesma árvore de componentes sempre que possível;
- permitir a implementação incremental dentro do prazo do desafio.

## Visão geral

```text
Navegador
   │
   ▼
React e componentes de interface
   │
   ├── TanStack Router ── parâmetros e estado da URL
   │
   └── TanStack Query ─── cache, loading, erro e mutations
              │
              ▼
            Axios
              │
              ▼
       REST API simulada pelo MSW
              │
              ├── fixtures determinísticas de NFTs
              └── banco mockado persistido no localStorage
```

Os componentes não acessam diretamente fixtures ou o banco mockado. Eles consomem funções da camada de API por meio do TanStack Query, como fariam com um backend real.

## Organização por responsabilidade

```text
src/
├── components/      # Componentes compartilhados e composição visual
├── features/        # Domínios da aplicação
│   ├── nfts/
│   ├── cart/
│   └── auth/
├── lib/             # Infraestrutura compartilhada
├── mocks/           # API REST simulada e dados determinísticos
└── routes/          # Páginas e integração com o TanStack Router
```

### `components`

Contém componentes sem responsabilidade direta sobre persistência ou requisições:

- `home`: hero e conteúdo editorial da homepage;
- `layout`: cabeçalhos, container e rodapé global;
- `ui`: componentes gerados pelo shadcn/ui e adaptados ao projeto.

### `features`

Cada domínio concentra seus contratos, chamadas HTTP, queries, mutations e componentes específicos.

```text
features/nfts/
├── api/
├── components/
├── queries/
├── catalog-filters.ts
├── catalog-search.ts
└── types.ts
```

```text
features/cart/
├── api/
├── mutations/
├── queries/
├── guest-owner.ts
└── types.ts
```

Essa separação permite evoluir `checkout` e `wallets` sem concentrar toda a aplicação em pastas genéricas de componentes e serviços. A feature `auth` já reúne contratos, sessão, formulários, API e perfil.

### `routes`

As rotas fazem a composição das features e controlam apenas o estado relacionado à navegação.

Rotas atuais:

```text
/                    # Homepage e catálogo
/cart                # Carrinho e resumo financeiro
/nfts/$nftId         # Detalhes de um NFT
/profile             # Perfil privado do colecionador
```

O arquivo `routeTree.gen.ts` é gerado automaticamente pelo plugin do TanStack Router.

## Estado da aplicação

O estado foi dividido de acordo com sua origem e duração.

| Tipo | Responsabilidade | Implementação |
| --- | --- | --- |
| Estado da URL | Busca, filtros, abas, ordenação e página | TanStack Router |
| Estado remoto | Catálogo, detalhes, carrinho, sessão e perfil | TanStack Query |
| Estado local | Drawer, modal, aba visual, edição e quantidade | React |
| Estado persistente do visitante | Identificador, carrinho, token e banco mockado | `localStorage` |

### Estado do catálogo na URL

Busca, categorias, rede, preço, aba, ordenação e paginação fazem parte da URL. Isso permite:

- compartilhar uma consulta;
- atualizar a página sem perder filtros;
- usar os controles nativos de voltar e avançar;
- criar chaves de cache determinísticas.

O fluxo é:

```text
Interação
  → navegação tipada
  → validação e normalização da URL
  → nova query key
  → requisição REST
  → interface atualizada
```

Valores padrão são omitidos para manter URLs canônicas. Categorias inválidas ou duplicadas são removidas durante a validação.

### Estado remoto

O TanStack Query controla:

- cache por conjunto de parâmetros;
- estados de carregamento e erro;
- cancelamento de consultas obsoletas;
- refetch manual;
- mutations para incluir, alterar, remover e limpar o carrinho;
- mutations para aplicar e remover cupom promocional;
- query global de sessão;
- mutations de login, cadastro, perfil e logout;
- atualização do cache do carrinho após mutations.

O `AbortSignal` recebido pelas query functions é encaminhado ao Axios.

## Camada HTTP

Existe uma única instância compartilhada do Axios. As funções em `features/*/api` conhecem URLs, headers e contratos HTTP; componentes não conhecem esses detalhes.

Endpoints atuais:

```text
GET  /api/nfts
GET  /api/nfts/:nftId
GET  /api/cart
POST /api/cart/items
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

Os tipos das respostas ficam nas respectivas features. O MSW implementa os mesmos contratos esperados pelo cliente.

## Mocking e persistência

O MSW intercepta chamadas no navegador e simula latência e códigos HTTP. Fixtures fixas mantêm busca, filtros, ordenação e paginação reproduzíveis.

O banco mockado contém:

```text
nfts
carts por ownerId
users
sessions por token
```

O visitante recebe um identificador criado por `crypto.randomUUID()`. Esse identificador é enviado em `X-Cart-Owner-Id` e persistido no `localStorage`.

O carrinho também é serializado no `localStorage`. A persistência existe apenas para sustentar a demonstração entre recarregamentos; uma API real assumiria essa responsabilidade em produção.

Usuários e sessões seguem a mesma estratégia exclusivamente para permitir cadastro, login e perfil verificáveis sem backend. Senhas não são armazenadas em texto: o Web Crypto deriva hashes PBKDF2 com salt individual. Essa proteção aproxima o contrato de uma API real, mas `localStorage` e um Service Worker não constituem uma fronteira de segurança de produção.

O token do cliente é armazenado separadamente e anexado pelo interceptor do Axios como `Authorization: Bearer <token>`. O `AuthProvider`, montado no layout raiz, consulta a sessão uma vez e compartilha usuário e abertura do modal entre homepage, detalhes, carrinho e perfil. Login, cadastro, atualização e logout substituem diretamente o cache da sessão para evitar estados divergentes.

O carregamento do banco normaliza usuários persistidos por versões anteriores, preenchendo username, ENS e apelido da carteira sem invalidar contas já criadas.

Cada resposta do carrinho inclui itens enriquecidos, cupom aplicado, quantidade total, subtotal, desconto, taxa de rede e total. A interface não recalcula a cotação: ela apresenta os valores confirmados pela API simulada. Valores em ETH permanecem como strings na fronteira HTTP e são convertidos em unidades inteiras com `BigInt` durante os cálculos, evitando imprecisão de ponto flutuante.

Os cupons são fixtures determinísticas. `JUNGLE10` representa sucesso com 10% de desconto, `GENESIS20` representa expiração e códigos desconhecidos retornam erro de validação. O código aplicado faz parte do carrinho persistido e toda alteração de itens produz uma nova cotação.

## Modelagem de NFT e edições

`NftSummary` contém somente os dados necessários ao catálogo. `NftDetail` estende esse contrato com galeria, edições, avaliações, atributos, contrato e NFTs relacionados.

Todos os NFTs possuem quatro edições:

```text
ABERTA
1/50
1/10
1/1
```

Cada edição possui identificador, preço, estoque, limite de compra e número de versão próprios. Galeria e painel de compra compartilham o mesmo `selectedEditionId`, garantindo sincronização bidirecional.

O Aurora Ape possui uma arte diferente para cada edição. Nos demais NFTs, as quatro edições reutilizam a imagem principal da obra, mantendo preços, estoques e limites independentes.

O endpoint do carrinho valida o estado novamente. A interface limita a quantidade por conveniência, mas a API mockada continua sendo a autoridade para estoque e limites.

## Componentes e responsividade

Tailwind CSS é usado diretamente nos componentes. O breakpoint `md` separa as principais experiências:

- desktop: navegação completa, sidebar de filtros e miniaturas verticais;
- mobile: busca destacada, filtros em drawer, navegação inferior da homepage e detalhe em card compacto.
- perfil: menu lateral e formulário em duas colunas no desktop; cabeçalho compacto e formulário em uma coluna no mobile.

Quando a estrutura muda significativamente, são usados componentes separados, como os cabeçalhos. Quando muda apenas a disposição, o mesmo componente recebe classes responsivas.

Os componentes do shadcn/ui são mantidos dentro do projeto e podem ser adaptados sem depender de um pacote visual em tempo de execução.

## Estados de interface

Consultas importantes possuem estados explícitos:

```text
pending → skeleton
success → conteúdo
empty   → orientação para remover filtros
404     → recurso inexistente
error   → mensagem e nova tentativa
```

Controles interativos possuem rótulos acessíveis, foco visível e elementos semânticos. Abas utilizam `tablist`, `tab` e `tabpanel`.

## Decisões e trade-offs atuais

- O MSW permite desenvolver os fluxos antes de existir um backend.
- `localStorage` é adequado para a demonstração, mas não substitui persistência segura no servidor.
- Os 12 NFTs possuem artes próprias em WebP.
- Todos possuem quatro edições comerciais, mas somente o Aurora Ape possui quatro imagens diferentes.
- Botões sem fluxo definido pelo desafio permanecem apresentacionais.
- O carrinho possui rota responsiva, persistência e operações completas; o botão de finalização permanece bloqueado até a implementação do checkout.
- Login, cadastro, sessão, logout e perfil são funcionais; login social, recuperação de senha e avatar permanecem explicitamente indisponíveis.
- Blockchain, carteiras e pagamento são simulados; nenhuma transação real será executada.

Esses trade-offs priorizam fluxos verificáveis e arquitetura extensível dentro do prazo de 48 horas.

## Evolução planejada

### Carrinho e checkout

O carrinho usa a mesma chave de cache nos cabeçalhos, no painel de compra e na rota `/cart`. As mutations de itens e cupom substituem o cache pela resposta confirmada da API, mantendo quantidade, desconto e totais sincronizados. O checkout usará um identificador de idempotência para impedir confirmações duplicadas.

### Autenticação

A feature `auth` concentra contratos públicos, armazenamento do token, API, query de sessão, mutations, modal e formulário de perfil. O `AuthProvider` mantém a sessão transversal sem acoplar autenticação aos componentes de NFT.

```text
Formulário
  → mutation
  → Axios com Bearer token
  → MSW valida credenciais e sessão
  → banco mockado persistente
  → resposta substitui o cache da sessão
  → headers e rotas privadas reagem imediatamente
```

A rota `/profile` bloqueia os dados para visitantes e oferece o modal de login como recuperação. Alterações de e-mail e username repetem validação de unicidade no handler; troca de senha exige a senha atual e gera novo salt e hash.

### Tempo real

Socket.IO atualizará estoque e disponibilidade. Eventos recebidos modificarão o cache do TanStack Query usando as mesmas query keys atuais.

```text
Socket.IO
  → validação do evento
  → atualização do cache
  → React renderiza o novo estoque
```

### Testes e qualidade

Playwright já está configurado sobre o build de produção em dois projetos Chromium: desktop `1440 × 900` e mobile `390 × 844`. O smoke test valida a inicialização da homepage, a resposta do catálogo via MSW e a navegação inferior responsiva. Falhas preservam screenshot e trace, e o relatório HTML permanece como artefato local.

A cobertura será expandida junto de cada fluxo crítico e receberá regressão visual com baselines versionadas. Lighthouse será executado sobre o mesmo build de produção. Os cenários determinísticos do MSW permitirão testar loading, vazio, erro, conflito de estoque e sucesso sem depender de serviços externos.

## Regras para novas features

1. Contratos pertencem à feature responsável.
2. Componentes não importam fixtures ou handlers.
3. Dados remotos passam pelo TanStack Query.
4. Estado compartilhável de catálogo permanece na URL.
5. Validações importantes são repetidas na API, mesmo quando já existem na interface.
6. Estados de loading, vazio e erro fazem parte da feature, não são adicionados somente no final.
7. Novas decisões relevantes devem atualizar este documento.
