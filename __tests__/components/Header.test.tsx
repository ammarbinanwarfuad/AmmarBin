import { render, screen, fireEvent, waitFor } from '../setup/test-utils'
import { Header } from '@/components/Header'
import { useRouter } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock dynamic import for ThemeToggle
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (importFunc: any, options?: any) => {
    const Component = () => <div data-testid="theme-toggle">Theme Toggle</div>
    Component.displayName = 'ThemeToggle'
    return Component
  },
}))

describe('Header Component', () => {
  const mockPrefetch = jest.fn()
  const mockRouter = {
    push: jest.fn(),
    prefetch: mockPrefetch,
    back: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('should render the logo/brand name', () => {
    render(<Header />)
    expect(screen.getByText('Ammar Bin')).toBeInTheDocument()
  })

  it('should render all navigation links', () => {
    render(<Header />)
    
    const expectedLinks = [
      'Home',
      'About',
      'Skills',
      'Projects',
      'Experience',
      'Education',
      'Certifications',
      'Blog',
      'Contact',
    ]

    expectedLinks.forEach((linkText) => {
      expect(screen.getAllByText(linkText).length).toBeGreaterThan(0)
    })
  })

  it('should render navigation links with correct hrefs', () => {
    render(<Header />)
    
    const homeLink = screen.getAllByText('Home')[0].closest('a')
    const aboutLink = screen.getAllByText('About')[0].closest('a')
    const skillsLink = screen.getAllByText('Skills')[0].closest('a')
    
    expect(homeLink).toHaveAttribute('href', '/')
    expect(aboutLink).toHaveAttribute('href', '/about')
    expect(skillsLink).toHaveAttribute('href', '/skills')
  })

  it('should render ThemeToggle component', () => {
    render(<Header />)
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })

  it('should toggle mobile menu when menu button is clicked', () => {
    render(<Header />)
    
    const menuButton = screen.getByRole('button', { name: /open main menu/i })
    
    // Initially mobile menu should not be visible (only desktop links shown)
    const mobileMenuBefore = screen.queryByText('Home', {
      selector: '.lg\\:hidden .block',
    })
    
    // Click to open
    fireEvent.click(menuButton)
    
    // Mobile menu should now be visible
    waitFor(() => {
      const mobileLinks = screen.getAllByText('Home')
      expect(mobileLinks.length).toBeGreaterThan(1) // Desktop + Mobile
    })
  })

  it('should close mobile menu when a link is clicked', async () => {
    render(<Header />)
    
    const menuButton = screen.getByRole('button', { name: /open main menu/i })
    
    // Open mobile menu
    fireEvent.click(menuButton)
    
    await waitFor(() => {
      const mobileLinks = screen.getAllByText('About')
      expect(mobileLinks.length).toBeGreaterThan(1)
    })
    
    // Click a mobile menu link
    const mobileAboutLink = screen.getAllByText('About').find((el) => 
      el.closest('.lg\\:hidden')
    )
    
    if (mobileAboutLink) {
      fireEvent.click(mobileAboutLink)
    }
    
    // Menu should close (links count should decrease)
    await waitFor(() => {
      // After closing, should only see desktop links
      const links = screen.getAllByText('About')
      expect(links.length).toBe(1)
    })
  })

  it('should show menu icon when mobile menu is closed', () => {
    render(<Header />)
    
    const menuButton = screen.getByRole('button', { name: /open main menu/i })
    expect(menuButton.querySelector('svg')).toBeInTheDocument()
  })

  it('should show X icon when mobile menu is open', () => {
    render(<Header />)
    
    const menuButton = screen.getByRole('button', { name: /open main menu/i })
    
    // Open menu
    fireEvent.click(menuButton)
    
    // Should now show X icon (Menu component switches to X)
    waitFor(() => {
      expect(menuButton.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    })
  })

  it('should prefetch routes on hover (desktop)', () => {
    render(<Header />)
    
    const aboutLink = screen.getAllByText('About')[0]
    
    fireEvent.mouseEnter(aboutLink)
    
    expect(mockPrefetch).toHaveBeenCalledWith('/about')
  })

  it('should have correct accessibility attributes', () => {
    render(<Header />)
    
    const menuButton = screen.getByRole('button', { name: /open main menu/i })
    expect(menuButton.querySelector('.sr-only')).toHaveTextContent('Open main menu')
  })

  it('should have fixed positioning with backdrop blur', () => {
    const { container } = render(<Header />)
    
    const header = container.querySelector('header')
    expect(header).toHaveClass('fixed')
    expect(header).toHaveClass('backdrop-blur')
  })

  it('should navigate to home when logo is clicked', () => {
    render(<Header />)
    
    const logo = screen.getByText('Ammar Bin')
    const logoLink = logo.closest('a')
    
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('should render all navigation items in desktop menu', () => {
    const { container } = render(<Header />)
    
    const desktopNav = container.querySelector('.lg\\:flex.lg\\:gap-x-6')
    expect(desktopNav).toBeInTheDocument()
    
    const desktopLinks = desktopNav?.querySelectorAll('a')
    expect(desktopLinks?.length).toBe(9) // 9 navigation items
  })

  it('should hide desktop navigation on mobile', () => {
    const { container } = render(<Header />)
    
    const desktopNav = container.querySelector('.hidden.lg\\:flex')
    expect(desktopNav).toBeInTheDocument()
  })

  it('should show mobile menu button only on mobile', () => {
    const { container } = render(<Header />)
    
    const mobileButton = container.querySelector('.lg\\:hidden button')
    expect(mobileButton).toBeInTheDocument()
  })
})
