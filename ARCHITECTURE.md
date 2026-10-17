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
│   ├── auth/
│   ├── checkout/
│   └── wallets/
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

Essa separação evita concentrar a aplicação em pastas genéricas de componentes e serviços. A feature `auth` reúne contratos, sessão, formulários, API, perfil e avatar; `wallets` reúne contratos, consulta, persistência e conexão das carteiras; `checkout` reúne pagamento, idempotência, pedidos e confirmação.

### `routes`

As rotas fazem a composição das features e controlam apenas o estado relacionado à navegação.

Rotas atuais:

```text
/                    # Homepage e catálogo
/cart                # Carrinho e resumo financeiro
/favorites           # Lista de interesse privada
/nfts/$nftId         # Detalhes de um NFT
/profile             # Perfil privado do colecionador
/wallets             # Carteiras principal e secundária
/checkout            # Pagamento e conexão da carteira
/orders/$orderId     # Acompanhamento e confirmação do pedido
```

O arquivo `routeTree.gen.ts` é gerado automaticamente pelo plugin do TanStack Router.

## Estado da aplicação

O estado foi dividido de acordo com sua origem e duração.

| Tipo | Responsabilidade | Implementação |
| --- | --- | --- |
| Estado da URL | Busca, filtros, abas, ordenação e página | TanStack Router |
| Estado remoto | Catálogo, detalhes, favoritos, carrinho, sessão, perfil, carteiras e pedidos | TanStack Query |
| Estado local | Drawer, modal, aba visual, edição e quantidade | React |
| Estado persistente do navegador | Identificador anônimo, carrinhos, token e banco mockado | `localStorage` |

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
- mutations de avatar e carteiras;
- mutations de conexão da carteira e criação do pedido;
- polling apenas enquanto o pedido permanece `pending`;
- atualização do cache do carrinho após mutations;
- atualização otimista dos favoritos com rollback do cache.

O `AbortSignal` recebido pelas query functions é encaminhado ao Axios.

## Camada HTTP

Existe uma única instância compartilhada do Axios. As funções em `features/*/api` conhecem URLs, headers e contratos HTTP; componentes não conhecem esses detalhes.

Endpoints atuais:

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

Os tipos das respostas ficam nas respectivas features. O MSW implementa os mesmos contratos esperados pelo cliente.

## Mocking e persistência

O MSW intercepta chamadas no navegador e simula latência e códigos HTTP. Fixtures fixas mantêm busca, filtros, ordenação e paginação reproduzíveis.

O banco mockado contém:

```text
nfts
carts por ownerId
favorites por userId
wallets por userId
orders por orderId, sempre vinculados ao userId
users
sessions por token
```

O visitante recebe um identificador criado por `crypto.randomUUID()` e persistido no `localStorage`. Uma conta autenticada recebe a identidade determinística `user-${userId}`. A identidade atual é enviada em `X-Cart-Owner-Id` e também compõe a query key do carrinho.

```text
sessão pendente  → consulta do carrinho aguarda
visitante        → guest-UUID
conta autenticada → user-${userId}
```

As funções HTTP e mutations recebem o `ownerId` explicitamente. Assim, uma operação iniciada por uma conta mantém o mesmo proprietário mesmo que a sessão mude antes da resposta. Trocas de conta selecionam outra entrada de cache e outro carrinho persistido.

Login e cadastro executam `POST /api/cart/merge` antes de publicar a nova sessão no contexto. O handler aceita apenas uma origem `guest-*`, deriva o destino do token autenticado, combina itens repetidos até o limite atual e transfere o cupom quando a conta ainda não possui um. A origem só é esvaziada depois que o destino foi produzido. Se a transferência falhar, o cliente remove o token recebido e não apresenta autenticação concluída.

O carrinho também é serializado no `localStorage`. A persistência existe apenas para sustentar a demonstração entre recarregamentos; uma API real assumiria essa responsabilidade em produção.

Favoritos pertencem à relação entre usuário e NFT, e não à fixture global do NFT. Os handlers derivam o `userId` do Bearer token e persistem somente os IDs favoritados. Catálogo, detalhes e lista de interesse usam chaves de cache que incluem a identidade do visualizador. Logout, expiração e troca de conta removem o cache privado anterior.

A mutation de favorito cancela refetches concorrentes, captura todas as queries do visualizador, atualiza imediatamente listas, detalhes e favoritos e envia a operação REST. Em caso de erro, `onError` restaura os snapshots; `onSettled` reconcilia o resultado com a API. O cenário determinístico de falha do MSW permite verificar esse rollback no Playwright.

Usuários e sessões seguem a mesma estratégia exclusivamente para permitir cadastro, login e perfil verificáveis sem backend. Senhas não são armazenadas em texto: o Web Crypto deriva hashes PBKDF2 com salt individual. Essa proteção aproxima o contrato de uma API real, mas `localStorage` e um Service Worker não constituem uma fronteira de segurança de produção.

O token do cliente é armazenado separadamente e anexado pelo interceptor do Axios como `Authorization: Bearer <token>`. O `AuthProvider`, montado no layout raiz, consulta a sessão e compartilha usuário e abertura do modal entre homepage, detalhes, carrinho e perfil. Login, cadastro, atualização e logout substituem diretamente o cache da sessão para evitar estados divergentes.

O `AuthProvider` agenda uma revalidação para o instante indicado por `expiresAt`. Se o MSW rejeitar a sessão expirada, o token é removido, a identidade do carrinho volta ao visitante e as rotas privadas reagem ao cache anônimo. Um novo login com a mesma conta recupera seu carrinho por meio do `userId` estável.

O carregamento do banco normaliza usuários persistidos por versões anteriores, preenchendo username, ENS e apelido da carteira sem invalidar contas já criadas.

Avatares são enviados como Data URL para a API simulada, validados novamente no MSW e limitados a PNG, JPEG ou WebP de até 1 MB. A escolha evita uma dependência externa de armazenamento durante a demonstração; em produção, o arquivo seria enviado para um serviço próprio e o perfil armazenaria somente sua URL.

Carteiras são persistidas separadamente por `userId`. Os handlers derivam o proprietário do Bearer token, permitem uma carteira principal e uma secundária, validam rede e formato do endereço e rejeitam endereços duplicados. A query key inclui o usuário atual e seu cache é removido em logout, troca de conta ou expiração. Conexão e desconexão são operações protegidas; conectar uma carteira desconecta as demais e o checkout exige correspondência entre carteira, rede e provedor.

Pedidos armazenam snapshots imutáveis do colecionador, carteira, itens e resumo financeiro. `POST /api/orders` exige uma `Idempotency-Key`: repetir a mesma chave e o mesmo conteúdo devolve o pedido existente, enquanto reutilizá-la com outro conteúdo retorna conflito. Antes da criação, a API revalida versão e total do carrinho, estoque e conexão da carteira. A confirmação é assíncrona; somente ao passar de `pending` para `confirmed` o estoque é reduzido e os itens comprados são removidos do carrinho. Pedidos recusados preservam o carrinho. A consulta deriva o usuário do token e responde `404` para pedidos de outra conta.

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
- carteiras: menu lateral e formulário em duas colunas no desktop; cabeçalho compacto e campos em uma coluna no mobile.
- pagamento: formulário e resumo lateral fixo no desktop; fluxo em cartão único e controles empilhados no mobile.
- confirmação: recibo centralizado no desktop e cartão adaptado no mobile.

As telas de perfil e carteiras possuem referências desktop no Figma, mas não possuem layouts mobile fornecidos. As duas versões mobile foram projetadas pelo autor do projeto a partir da hierarquia, dos campos e do sistema visual apresentados no desktop. O Figma também não fornece confirmação de pedido mobile; o recibo responsivo é uma adaptação autoral da confirmação desktop. A documentação distingue essas adaptações das reproduções diretas das telas de referência.

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
- O carrinho possui rota responsiva, persistência e operações completas; sua ação principal abre o checkout autenticado.
- Login, cadastro, sessão, logout, perfil e avatar são funcionais; login social e recuperação de senha permanecem explicitamente indisponíveis.
- Cadastro, edição, conexão e desconexão de carteiras são funcionais e simulados; pedidos e transações também são mockados, e nenhuma transação real é executada.

Esses trade-offs priorizam fluxos verificáveis e arquitetura extensível dentro do prazo de 48 horas.

## Evolução planejada

### Carrinho e checkout

O carrinho usa a mesma chave de cache, composta pelo proprietário atual, nos cabeçalhos, no painel de compra e na rota `/cart`. As mutations de itens e cupom preservam o proprietário com que foram iniciadas e substituem o cache pela resposta confirmada da API, mantendo quantidade, desconto e totais sincronizados.

O checkout mantém uma chave de idempotência estável durante a tentativa. Se a requisição expirar depois de o servidor criar o pedido, o usuário pode reenviar e receber o mesmo recurso. Alterações nos dados ou na seleção da carteira iniciam uma chave nova. Conflitos de cotação invalidam o carrinho para exibir os valores atuais. Depois da criação, a rota do pedido consulta a API a cada 750 ms somente enquanto o status está `pending`; estados terminais interrompem o polling. Uma confirmação invalida os caches do carrinho e dos NFTs.

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

A rota `/profile` bloqueia os dados para visitantes e oferece o modal de login como recuperação. Alterações de e-mail e username repetem validação de unicidade no handler; troca de senha exige a senha atual e gera novo salt e hash. O avatar usa endpoints próprios para que sua mutation e seus estados de erro não interfiram no restante do formulário.

### Carteiras

A rota `/wallets` é privada e consulta uma coleção vinculada à identidade da sessão. Criação e edição usam o mesmo formulário, mas endpoints REST diferentes. O MSW continua sendo a autoridade para cardinalidade, formato do endereço, duplicidade e propriedade do registro.

```text
Formulário de carteira
  → mutation de criação ou edição
  → Axios com Bearer token
  → MSW deriva o usuário e valida o domínio
  → persistência por userId
  → resposta substitui a query ["wallets", userId]
```

A referência desktop foi reproduzida com menu lateral e duas colunas. Como o Figma não inclui uma versão mobile, essa composição é autoral: uma navegação compacta conecta perfil, carteiras e favoritos, enquanto cada carteira ocupa um cartão com campos em uma coluna. No checkout, o usuário escolhe uma carteira salva, rede e provedor, e pode conectar, recusar ou desconectar a sessão simulada antes de confirmar.

### Tempo real e reconciliação

Um cliente Socket.IO único é controlado pelo `RealtimeProvider`. No navegador de demonstração, o servidor é simulado pelo MSW com `@mswjs/socket.io-binding`; trocar esse transporte pelo servidor real não altera os componentes consumidores. A inscrição da sessão envia apenas o token atual, e a desmontagem ou troca de usuário remove listeners e desconecta a inscrição anterior.

```text
Socket.IO (`nft.updated` ou `order.updated`)
  → validação estrutural do evento
  → comparação de identidade e versão
  → descarte de evento duplicado ou antigo
  → atualização do cache do TanStack Query
  → React renderiza o novo estado

Reconexão
  → refetch REST de queries ativas de NFTs, carrinho e pedidos
  → API volta a ser a fonte autoritativa
```

Eventos de NFT carregam versões do NFT e da edição. O provider atualiza catálogo, detalhes e favoritos e invalida o carrinho para que seus totais sejam recalculados pela API. No checkout, uma alteração relevante bloqueia a confirmação até o usuário revisar explicitamente a nova cotação. Eventos de pedido são aceitos somente quando pertencem à sessão atual e têm versão mais recente.

Pedidos pendentes usam eventos enquanto a conexão está saudável. Durante uma interrupção, a query ativa polling REST; ao reconectar, o provider reconcilia novamente o recurso pela API. Esse desenho evita depender da entrega perfeita do socket e mantém o REST como autoridade persistente.

### Testes e qualidade

Playwright está configurado sobre o build de produção em dois projetos Chromium: desktop `1440 × 900` e mobile `390 × 844`. A suíte possui 57 cenários validados e produz 114 execuções aprovadas ao percorrer os dois projetos.

```text
home.spec.ts          → carregamento e navegação responsiva
catalog.spec.ts       → busca, filtros, ordenação, histórico e vazio
nft-details.spec.ts   → edições, indisponibilidade e 404
cart.spec.ts          → itens, quantidades, persistência, cupons e totais
cart-isolation.spec.ts → visitante, troca de contas, expiração e retomada
auth.spec.ts          → acesso privado, login, cadastro, sessão e logout
profile.spec.ts       → dados pessoais e alteração de senha
favorites.spec.ts     → autenticação, persistência, isolamento e rollback
avatar-wallets.spec.ts → avatar, carteiras, validação e isolamento
checkout.spec.ts       → conexão, recusa, desconexão, confirmação, timeout e isolamento
realtime.spec.ts       → preço, estoque, versões, reconexão e fallback REST
accessibility-resilience.spec.ts → teclado, foco, skeleton, falha e recuperação
visual.spec.ts         → baselines de início, detalhe, carrinho e pagamento
```

Os 6 cenários de `realtime.spec.ts` são executados nos dois projetos e validam atualizações de preço e estoque no catálogo, detalhes e carrinho, remoção de edição esgotada, revisão de cotação no checkout, descarte de eventos duplicados ou antigos e retomada REST após interrupção do socket.

Os testes observam a interface e os contratos acessíveis, restringindo seletores ao domínio relevante da página. Isso evita que conteúdo editorial visualmente semelhante seja confundido com resultados do catálogo. Helpers são compartilhados apenas quando representam uma operação de negócio completa, como autenticar uma conta ou adicionar uma edição ao carrinho.

Cada teste recebe um contexto de navegador isolado, enquanto fixtures determinísticas do MSW tornam os resultados reproduzíveis. Falhas preservam screenshot e trace, e o relatório HTML permanece como artefato local.

A cobertura valida loading, vazio, erro recuperável, conflito de estoque e sucesso com cenários determinísticos do MSW. A regressão visual compara oito baselines versionadas de início, detalhe, carrinho e pagamento em desktop e mobile.

O Lighthouse CI executa sobre o mesmo build de produção e cenário padrão do MSW. As configurações versionadas separam os perfis desktop e mobile, auditam início e detalhe três vezes e persistem cada resultado em HTML e JSON. Um script consolida as medianas das categorias e de LCP, CLS e TBT, registra ferramentas e ambiente e aplica as metas somente depois que os dois perfis foram coletados, preservando diagnósticos mesmo quando uma meta falha.

A medição final atingiu todas as metas no desktop: início com `99/100/96/92` e detalhe com `98/97/96/92` para Performance, Accessibility, Best Practices e SEO. No mobile, início registrou `78/100/96/92` e detalhe `75/97/96/92`. Os respectivos LCPs móveis foram `4199 ms` e `4897 ms`; CLS permaneceu em `0.005` e `0.000`, e TBT em `40 ms` e `24 ms`.

O diagnóstico associa a diferença de Performance móvel ao atraso de renderização do LCP: 89% na home e 71% no detalhe. A entrega inicializa no navegador a SPA e a infraestrutura completa da API simulada pelo MSW, incluindo persistência e interceptadores usados pelos fluxos testados. O detalhe também aguarda a resposta REST autoritativa antes de inserir a imagem principal. A auditoria final preserva imagens, Space Mono, mocks e funcionalidades reais; nenhuma variante reduzida foi criada para o Lighthouse. Em produção com backend, a remoção do MSW do bundle e SSR ou prerenderização das rotas públicas são as evoluções indicadas para reduzir esse caminho crítico.

## Regras para novas features

1. Contratos pertencem à feature responsável.
2. Componentes não importam fixtures ou handlers.
3. Dados remotos passam pelo TanStack Query.
4. Estado compartilhável de catálogo permanece na URL.
5. Validações importantes são repetidas na API, mesmo quando já existem na interface.
6. Estados de loading, vazio e erro fazem parte da feature, não são adicionados somente no final.
7. Novas decisões relevantes devem atualizar este documento.
