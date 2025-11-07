import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from 'next-themes'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}))

describe('ThemeToggle Component', () => {
  const mockSetTheme = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })
  })

  it('should render loading skeleton when not mounted', () => {
    const { container } = render(<ThemeToggle />)
    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('should render sun icon in light mode after mounting', async () => {
    render(<ThemeToggle />)
    
    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Switch to dark theme')
  })

  it('should render moon icon in dark mode after mounting', async () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)
    
    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Switch to light theme')
  })

  it('should toggle from light to dark theme when clicked', async () => {
    render(<ThemeToggle />)
    
    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('should toggle from dark to light theme when clicked', async () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)
    
    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('should have correct accessibility attributes', async () => {
    render(<ThemeToggle />)
    
    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label')
    expect(button).toHaveAttribute('title')
  })

  it('should add and remove disable-transitions class on toggle', async () => {
    jest.useFakeTimers()
    
    render(<ThemeToggle />)
    
    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(document.documentElement.classList.contains('disable-transitions')).toBe(true)

    jest.advanceTimersByTime(300)

    expect(document.documentElement.classList.contains('disable-transitions')).toBe(false)

    jest.useRealTimers()
  })
})
