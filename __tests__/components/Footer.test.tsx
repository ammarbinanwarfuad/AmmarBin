import { render, screen } from '../setup/test-utils'
import { Footer } from '@/components/Footer'

// Mock the getProfile function
jest.mock('@/lib/server/data', () => ({
  getProfile: jest.fn(),
}))

const { getProfile } = require('@/lib/server/data')

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render footer with copyright text', async () => {
    getProfile.mockResolvedValue({
      name: 'John Doe',
      email: 'john@example.com',
      socialLinks: {},
    })

    const FooterComponent = await Footer()
    render(FooterComponent)

    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument()
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument()
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument()
  })

  it('should render all social links when provided', async () => {
    getProfile.mockResolvedValue({
      name: 'John Doe',
      email: 'john@example.com',
      socialLinks: {
        github: 'https://github.com/johndoe',
        linkedin: 'https://linkedin.com/in/johndoe',
        facebook: 'https://facebook.com/johndoe',
        instagram: 'https://instagram.com/johndoe',
        twitter: 'https://twitter.com/johndoe',
        hashnode: 'https://hashnode.com/@johndoe',
        portfolio: 'https://johndoe.com',
      },
    })

    const FooterComponent = await Footer()
    render(FooterComponent)

    expect(screen.getByLabelText('GitHub')).toBeInTheDocument()
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument()
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument()
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument()
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument()
    expect(screen.getByLabelText('Hashnode')).toBeInTheDocument()
    expect(screen.getByLabelText('Portfolio')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('should render email link when email is provided', async () => {
    getProfile.mockResolvedValue({
      name: 'John Doe',
      email: 'john@example.com',
      socialLinks: {},
    })

    const FooterComponent = await Footer()
    render(FooterComponent)

    const emailLink = screen.getByLabelText('Email')
    expect(emailLink).toHaveAttribute('href', 'mailto:john@example.com')
  })

  it('should render social links with correct hrefs', async () => {
    getProfile.mockResolvedValue({
      name: 'John Doe',
      email: null,
      socialLinks: {
        github: 'https://github.com/johndoe',
        linkedin: 'https://linkedin.com/in/johndoe',
      },
    })

    const FooterComponent = await Footer()
    render(FooterComponent)

    const githubLink = screen.getByLabelText('GitHub')
    const linkedinLink = screen.getByLabelText('LinkedIn')

    expect(githubLink).toHaveAttribute('href', 'https://github.com/johndoe')
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/johndoe')
  })

  it('should open social links in new tab', async () => {
    getProfile.mockResolvedValue({
      name: 'John Doe',
      email: null,
      socialLinks: {
        github: 'https://github.com/johndoe',
      },
    })

    const FooterComponent = await Footer()
    render(FooterComponent)

    const githubLink = screen.getByLabelText('GitHub')
    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should only render provided social links', async () => {
    getProfile.mockResolvedValue({
      name: 'John Doe',
      email: null,
      socialLinks: {
        github: 'https://github.com/johndoe',
        // Only GitHub provided
      },
    })

    const FooterComponent = await Footer()
    render(FooterComponent)

    expect(screen.getByLabelText('GitHub')).toBeInTheDocument()
    expect(screen.queryByLabelText('LinkedIn')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Twitter')).not.toBeInTheDocument()
  })

  it('should use default name when profile name is not provided', async () => {
    getProfile.mockResolvedValue({
      name: null,
      email: null,
      socialLinks: {},
    })

    const FooterComponent = await Footer()
    render(FooterComponent)

    expect(screen.getByText(/Ammar Bin Anwar Fuad/i)).toBeInTheDocument()
  })

  it('should render with no social links when none are provided', async () => {
    getProfile.mockResolvedValue({
      name: 'John Doe',
      email: null,
      socialLinks: {},
    })

    const FooterComponent = await Footer()
    const { container } = render(FooterComponent)

    // Check that no social links are rendered
    const links = container.querySelectorAll('a')
    expect(links).toHaveLength(0)
  })

  it('should have proper accessibility with sr-only text', async () => {
    getProfile.mockResolvedValue({
      name: 'John Doe',
      email: null,
      socialLinks: {
        github: 'https://github.com/johndoe',
      },
    })

    const FooterComponent = await Footer()
    render(FooterComponent)

    // sr-only text should be present for screen readers
    const srOnlyText = screen.getByText('GitHub', { selector: '.sr-only' })
    expect(srOnlyText).toBeInTheDocument()
  })

  it('should have backdrop blur and border styling', async () => {
    getProfile.mockResolvedValue({
      name: 'John Doe',
      email: null,
      socialLinks: {},
    })

    const FooterComponent = await Footer()
    const { container } = render(FooterComponent)

    const footer = container.querySelector('footer')
    expect(footer).toHaveClass('backdrop-blur')
    expect(footer).toHaveClass('border-t')
  })
})
