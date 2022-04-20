/**
 * @jest-environment jsdom
 */
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import userEvent from '@testing-library/user-event'
import { getPage } from 'next-page-tester'
import { initTestHelpers } from 'next-page-tester'
import 'setimmediate'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

initTestHelpers()

/*  ページ遷移のテスト
    遷移元ページ取得 → レンダー → 遷移先ページ取得 → 検証（要素を選択し、アサーション関数で検証）  */
// モックしないとblogpageへの遷移が出来なくなった。他の回避方法は？
    const handlers = [
      rest.get('https://jsonplaceholder.typicode.com/posts/', (req, res, ctx) => {
        const query = req.url.searchParams
        const _limit = query.get('_limit')
        if (_limit === '10') {
          return res(
            ctx.status(200),
            ctx.json([
            ])
          )
        }
      }),
    ]
    const server = setupServer(...handlers)
    beforeAll(() => {
      server.listen()
    })
    afterEach(() => {
      server.resetHandlers()
      cleanup()
    })
    afterAll(() => {
      server.close()
    })

describe('Navigation by Link', () => {
  it('Should route to selected page in navbar', async () => {  // next-page-testerを使ったケースはasync
    // 初期ページ取得
    const { page } = await getPage({
      route: '/index', // 取得したいページ指定
    })
    render(page)

    userEvent.click(screen.getByTestId('blog-nav'))  // ページ遷移。対象要素にカスタムデータ属性data-testid=blog-navを指定していた。
    expect(await screen.findByText('blog page')).toBeInTheDocument()
    // 非同期はfindBy。初回レンダリングではないが、非同期で取得のあとレンダリングされるような対象に対して使用（まだ存在しないものの最終的に存在する要素）
    // 別のページ遷移へのたち。一つのitの中に複数expectを書いて良い。
    userEvent.click(screen.getByTestId('comment-nav'))
    expect(await screen.findByText('comment page')).toBeInTheDocument()
    userEvent.click(screen.getByTestId('context-nav'))
    expect(await screen.findByText('context page')).toBeInTheDocument()
    userEvent.click(screen.getByTestId('task-nav'))
    expect(await screen.findByText('todos page')).toBeInTheDocument()
    userEvent.click(screen.getByTestId('home-nav'))
    expect(await screen.findByText('Welcome to Nextjs')).toBeInTheDocument()
  })
})
