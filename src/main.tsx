import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  RouterProvider,
  createRouter,
  defaultParseSearch,
  defaultStringifySearch,
} from '@tanstack/react-router'
import './index.css'
import { queryClient } from './lib/query-client'
import { enableMocking } from './mocks/enable-mocking'
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

async function bootstrap() {
  await enableMocking()

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
