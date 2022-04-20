/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect'
import { render, screen, cleanup } from '@testing-library/react'
import { getPage } from 'next-page-tester'
import { initTestHelpers } from 'next-page-tester'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import 'setimmediate'

// ① ハンドラにモック対象のエンドポイントや返す内容を定義
// ② モックサーバをたて、ハンドラを渡す
// ③ テストケースそのものの部分

initTestHelpers()

// ① ハンドラ
const handlers = [
  // MSW restでget(モックするエンドポイント)
  rest.get('https://jsonplaceholder.typicode.com/posts/', (req, res, ctx) => {
    const query = req.url.searchParams
    const _limit = query.get('_limit')
    if (_limit === '10') {
      // モックに返させるレスポンスヘッダ、ボディ
      return res(
        ctx.status(200),
        ctx.json([
          {
            userId: 1,
            id: 1,
            title: 'dummy title 1',
            body: 'dummy body 1',
          },
          {
            userId: 2,
            id: 2,
            title: 'dummy title 2',
            body: 'dummy body 2',
          },
        ])
      )
    }
  }),
]

// ② モックサーバを立てる
const server = setupServer(...handlers)
beforeAll(() => {
  server.listen()
})
afterEach(() => {
  server.resetHandlers()
  // テスト間の副作用が起こらないようクリーンナップ
  cleanup()
})
afterAll(() => {
  server.close()
})

// ③ テストケース
describe(`Blog page`, () => {
  it('Should render the list of blogs pre-fetched by getStaticProps', async () => {
    const { page } = await getPage({
      route: '/blog-page',
    })
    render(page)
    // 取得まで待機
    expect(await screen.findByText('blog page')).toBeInTheDocument()
    //
    expect(screen.getByText('dummy title 1')).toBeInTheDocument()
    expect(screen.getByText('dummy title 2')).toBeInTheDocument()
  })
})
