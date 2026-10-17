import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  focusManager,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  RouterProvider,
  createRouter,
  defaultParseSearch,
  defaultStringifySearch,
} from '@tanstack/react-router'
import spaceMono400Url from '@fontsource/space-mono/files/space-mono-latin-400-normal.woff2?url'
import spaceMono700Url from '@fontsource/space-mono/files/space-mono-latin-700-normal.woff2?url'
import './index.css'
import { queryClient } from './lib/query-client'
import {
  enableMocking,
  restoreMocking,
} from './mocks/enable-mocking'
import { routeTree } from './routeTree.gen'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  parseSearch: (searchString) => {
    const search = defaultParseSearch(
      searchString,
    ) as Record<string, unknown>

    return {
      ...search,
      categories:
        typeof search.categories === 'string'
          ? search.categories.split(',')
          : search.categories,
    }
  },
  stringifySearch: (search) =>
    defaultStringifySearch({
      ...search,
      categories: Array.isArray(search.categories)
        ? search.categories.join(',')
        : search.categories,
    }),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Elemento #root não encontrado')
}

const root = createRoot(rootElement)

function preloadFont(href: string, weight: string) {
  const preload = document.createElement('link')

  preload.rel = 'preload'
  preload.as = 'font'
  preload.href = href
  preload.type = 'font/woff2'
  preload.crossOrigin = 'anonymous'
  preload.setAttribute('data-font-weight', weight)
  document.head.append(preload)
}

preloadFont(spaceMono400Url, '400')
preloadFont(spaceMono700Url, '700')

function preloadDetailImage() {
  const match = window.location.pathname.match(
    /^\/nfts\/nft-([a-z0-9-]+)\/?$/,
  )

  if (!match?.[1]) {
    return
  }

  const slug = match[1]
  const imageUrl =
    slug === 'aurora-ape'
      ? '/images/nfts/aurora-ape-1-50.webp'
      : `/images/nfts/${slug}.webp`
  const preload = document.createElement('link')

  preload.rel = 'preload'
  preload.as = 'image'
  preload.href = imageUrl
  preload.fetchPriority = 'high'
  document.head.append(preload)
}

function configureWindowFocusRefetching() {
  focusManager.setEventListener((handleFocus) => {
    function handleVisibilityChange() {
      const isVisible =
        document.visibilityState === 'visible'

      if (!isVisible) {
        handleFocus(false)
        return
      }

      void restoreMocking().then(
        () => handleFocus(true),
        () => handleFocus(true),
      )
    }

    window.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
      false,
    )

    return () => {
      window.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      )
    }
  })
}

preloadDetailImage()

type InitialRoutePrimer =
  | (() => Promise<unknown>)
  | null

async function prepareInitialRoute(): Promise<InitialRoutePrimer> {
  const detailMatch = window.location.pathname.match(
    /^\/nfts\/([^/]+)\/?$/,
  )

  if (detailMatch?.[1]) {
    const nftId = decodeURIComponent(detailMatch[1])
    const [, { nftDetailQueryOptions }] = await Promise.all([
      router.preloadRoute({
        to: '/nfts/$nftId',
        params: { nftId },
      }),
      import('./features/nfts/queries/nft-detail-query'),
    ])

    return () =>
      queryClient.prefetchQuery(
        nftDetailQueryOptions(nftId, null),
      )
  }

  if (
    window.location.pathname === '/' &&
    window.location.search === ''
  ) {
    const [, { nftListQueryOptions }] = await Promise.all([
      router.preloadRoute({ to: '/', search: {} }),
      import('./features/nfts/queries/nft-list-query'),
    ])

    return () =>
      queryClient.prefetchQuery(
        nftListQueryOptions({}, null),
      )
  }

  return null
}

const initialRoutePrimerPromise = prepareInitialRoute()

async function bootstrap() {
  const [, initialRoutePrimer] = await Promise.all([
    enableMocking(),
    initialRoutePrimerPromise,
  ])

  if (initialRoutePrimer) {
    try {
      await initialRoutePrimer()
    } catch {
      // The route renders the regular retry state for bootstrap failures.
    }
  }

  configureWindowFocusRefetching()

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />

        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </StrictMode>
  )
}

bootstrap().catch((error: unknown) => {
  console.error('Falha ao inicializar a aplicação.', error)

  root.render(
    <main
      className="grid min-h-svh place-items-center p-6 text-center"
      role="alert"
    >
      Não foi possível iniciar a aplicação. Recarregue a página.
    </main>
  )
})
