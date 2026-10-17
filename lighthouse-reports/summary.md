# Relatório Lighthouse

Gerado em: 2026-10-17T07:27:53.802Z

Condições: build de produção do Vite, cenário padrão do MSW, três medições por página e perfil. Os valores abaixo são as medianas das três execuções.

## Desktop

| Página | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Início | 99 | 100 | 96 | 92 | 896 ms | 0.000 | 0 ms |
| Detalhe do NFT | 98 | 97 | 96 | 92 | 1002 ms | 0.000 | 0 ms |

## Mobile

| Página | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Início | 78 | 100 | 96 | 92 | 4199 ms | 0.005 | 40 ms |
| Detalhe do NFT | 75 | 97 | 96 | 92 | 4897 ms | 0.000 | 24 ms |

## Ambiente

- Lighthouse: 12.6.1
- Lighthouse CI: 0.15.1
- Node.js: v24.18.0
- Sistema: Windows_NT 10.0.26200 (x64)
- User agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36
- Benchmark index: 3063.5
- URLs: `/` e `/nfts/nft-aurora-ape` em `http://127.0.0.1:4173`
- Perfis: desktop do Lighthouse e mobile 390 × 844 a 2x

Os relatórios completos HTML e JSON de cada medição estão nas pastas `desktop/` e `mobile/`.

## Metas não atingidas

- mobile/Início: Performance 78 < 90
- mobile/Detalhe do NFT: Performance 75 < 90

## Diagnóstico

As notas abaixo de 90 ficaram restritas à Performance mobile. Na página inicial, o LCP é o título principal e a maior parte do tempo corresponde ao atraso de renderização. No detalhe, o LCP é a imagem principal do Aurora Ape; o tempo de transferência é pequeno e o atraso ocorre principalmente antes da renderização do conteúdo obtido pela API REST simulada.

Os valores baixos de TBT e CLS indicam que o resultado não decorre de bloqueio prolongado da thread principal nem de instabilidade visual. O custo dominante é o bootstrap completo da SPA cliente, incluindo React, roteamento, React Query, sessão e a infraestrutura MSW usada para simular o backend no próprio navegador sob limitação mobile.

A auditoria preservou imagens, fontes, mocks e funcionalidades da entrega. Não foram criadas simplificações exclusivas para elevar a pontuação. Em produção com backend real, o MSW não faria parte do bundle; como evolução adicional, SSR ou pré-renderização das rotas públicas reduziria o atraso de renderização observado no perfil mobile.

