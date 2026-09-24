import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App navigation smoke test', () => {
  it('renders the bottom navigation bar with all 4 tabs', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /movimientos/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /fijos/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ajustes/i })).toBeInTheDocument()
  })

  it('renders the floating action button', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: /nuevo registro/i })).toBeInTheDocument()
  })
})
