import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import Home from '../pages/index'

it('Should render hello text', () => {
  render(<Home />) //htmlを取得
  // screen.debug()  現在のscreenのdomのhtmlをコンソールログ表示
  expect(screen.getByText('Welcome to Nextjs')).toBeInTheDocument() // 文字列を取得.要素が存在するか
  // getByTextは要素がそもそもなければエラーを投げる。そのため存在しないことの検証はscreen.queryByText('').toBeNull()
})
