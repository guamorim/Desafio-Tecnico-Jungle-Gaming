# Jungle NFT Marketplace

Marketplace de NFTs desenvolvido como solução para o [desafio frontend da Jungle](https://github.com/junglegaming/frontend-challenge).

O projeto tem como objetivo implementar os fluxos de descoberta, compra e gerenciamento da conta de um colecionador, com dados simulados, suporte a desktop e mobile e atenção a acessibilidade, performance e qualidade das interações.

> Status: em desenvolvimento. A fundação da aplicação e o roteamento estão configurados; os fluxos de produto serão adicionados incrementalmente.

## Tecnologias configuradas

- React 19
- TypeScript
- Vite
- TanStack Router com rotas baseadas em arquivos
- ESLint

## Stack prevista pelo desafio

As próximas etapas integrarão TanStack Query, Axios, Socket.IO, Tailwind CSS, shadcn/ui, MSW, Playwright e auditorias com Lighthouse.

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
src/
├── assets/              # Imagens e outros recursos estáticos
├── routes/
│   ├── __root.tsx       # Layout raiz compartilhado pelas rotas
│   └── index.tsx        # Página inicial (/)
├── index.css            # Estilos globais
├── main.tsx             # Inicialização do React e do router
└── routeTree.gen.ts     # Árvore de rotas gerada pelo TanStack Router
```

O arquivo `src/routeTree.gen.ts` é gerado automaticamente e não deve ser editado manualmente.

## Variáveis de ambiente

Nenhuma variável de ambiente é necessária no estágio atual.

As configurações dos mocks e dos cenários de rede serão documentadas aqui quando a camada de integração for implementada.

## Dados simulados

Autenticação, APIs, carteiras, pagamentos e eventos em tempo real serão simulados. O projeto não realizará transações reais nem dependerá de blockchain, extensões de carteira ou gateways de pagamento.

As credenciais fictícias, os cenários de falha e o procedimento de reset serão adicionados quando os mocks com MSW estiverem disponíveis.

## Qualidade

A base atual é validada com:

```bash
npm run lint
npm run build
```

Os testes E2E, a regressão visual e os resultados do Lighthouse serão documentados durante as próximas etapas da implementação.
