import { render, screen } from '../setup/test-utils'
import { CertificationsGrid } from '@/components/CertificationsGrid'

// Mock LazyMotion components
jest.mock('@/components/LazyMotion', () => ({
  LazyMotionDiv: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Award: () => <svg data-testid="award-icon" />,
  Calendar: () => <svg data-testid="calendar-icon" />,
  CheckCircle2: () => <svg data-testid="checkcircle-icon" />,
  XCircle: () => <svg data-testid="xcircle-icon" />,
  ExternalLink: () => <svg data-testid="externallink-icon" />,
  Eye: () => <svg data-testid="eye-icon" />,
}))

const mockStats = {
  total: 10,
  active: 8,
  expired: 2,
  categories: [
    { _id: 'Cloud', count: 3 },
    { _id: 'Development', count: 5 },
    { _id: 'Security', count: 2 },
  ],
}

const mockCertificates = [
  {
    _id: '507f1f77bcf86cd799439011',
    title: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    category: 'Cloud',
    issueDate: '2023-06-01',
    expiryDate: '2026-06-01',
    credentialId: 'AWS-123456',
    verificationUrl: 'https://aws.amazon.com/verify/123456',
    certificateImage: 'https://example.com/cert1.jpg',
    skills: ['AWS', 'Cloud Architecture', 'EC2', 'S3'],
    description: 'Validates expertise in designing distributed systems on AWS.',
    featured: true,
  },
  {
    _id: '507f1f77bcf86cd799439012',
    title: 'Google Cloud Professional',
    issuer: 'Google Cloud',
    category: 'Cloud',
    issueDate: '2024-01-15',
    credentialId: 'GCP-789012',
    verificationUrl: 'https://google.com/verify/789012',
    certificateImage: 'https://example.com/cert2.jpg',
    skills: ['GCP', 'Kubernetes'],
    description: 'Professional-level certification for Google Cloud Platform.',
    featured: false,
  },
  {
    _id: '507f1f77bcf86cd799439013',
    title: 'Expired Certificate',
    issuer: 'Tech Company',
    category: 'Development',
    issueDate: '2020-01-01',
    expiryDate: '2022-01-01',
    credentialId: 'EXP-111111',
    certificateImage: 'https://example.com/cert3.jpg',
    description: 'This certificate has expired.',
    featured: false,
  },
]

describe('CertificationsGrid', () => {
  describe('Stats Display', () => {
    it('renders stats cards with correct data', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      expect(screen.getByText('Total Certificates')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText('Categories')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('displays stat icons', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      const awardIcons = screen.getAllByTestId('award-icon')
      expect(awardIcons.length).toBeGreaterThan(0)
    })

    it('renders without stats', () => {
      const emptyStats = {
        total: 0,
        active: 0,
        expired: 0,
        categories: [],
      }

      render(<CertificationsGrid certificates={[]} stats={emptyStats} />)

      expect(screen.getByText('Total Certificates')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('Certificate Display', () => {
    it('renders all certificates', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      expect(screen.getByText('AWS Certified Solutions Architect')).toBeInTheDocument()
      expect(screen.getByText('Google Cloud Professional')).toBeInTheDocument()
      expect(screen.getByText('Expired Certificate')).toBeInTheDocument()
    })

    it('displays certificate issuer', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      expect(screen.getByText('Amazon Web Services')).toBeInTheDocument()
      expect(screen.getByText('Google Cloud')).toBeInTheDocument()
      expect(screen.getByText('Tech Company')).toBeInTheDocument()
    })

    it('shows category badges', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      const cloudBadges = screen.getAllByText('Cloud')
      expect(cloudBadges.length).toBe(2)
      expect(screen.getByText('Development')).toBeInTheDocument()
    })

    it('displays certificate images', () => {
      const { container } = render(
        <CertificationsGrid certificates={mockCertificates} stats={mockStats} />
      )

      const images = container.querySelectorAll('img')
      expect(images.length).toBeGreaterThanOrEqual(3)
      expect(images[0]).toHaveAttribute('src', 'https://example.com/cert1.jpg')
    })

    it('shows featured badge for featured certificates', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      expect(screen.getByText('Featured')).toBeInTheDocument()
    })

    it('displays certificate descriptions', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      expect(
        screen.getByText('Validates expertise in designing distributed systems on AWS.')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Professional-level certification for Google Cloud Platform.')
      ).toBeInTheDocument()
    })
  })

  describe('Expiry Status', () => {
    it('shows active status for non-expired certificates with expiry date', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      const activeLabels = screen.getAllByText('Active')
      expect(activeLabels.length).toBeGreaterThan(0)
      expect(screen.getAllByTestId('checkcircle-icon').length).toBeGreaterThan(0)
    })

    it('shows lifetime status for certificates without expiry date', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      expect(screen.getByText('Lifetime')).toBeInTheDocument()
    })

    it('shows expired status for expired certificates', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      expect(screen.getByText('Expired')).toBeInTheDocument()
      expect(screen.getByTestId('xcircle-icon')).toBeInTheDocument()
    })
  })

  describe('Skills Display', () => {
    it('displays skill tags', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      expect(screen.getByText('AWS')).toBeInTheDocument()
      expect(screen.getByText('Cloud Architecture')).toBeInTheDocument()
      expect(screen.getByText('EC2')).toBeInTheDocument()
      expect(screen.getByText('GCP')).toBeInTheDocument()
      expect(screen.getByText('Kubernetes')).toBeInTheDocument()
    })

    it('limits displayed skills to 3 and shows +N more', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      // AWS cert has 4 skills, should show first 3 + "+1 more"
      expect(screen.getByText('+1 more')).toBeInTheDocument()
    })

    it('does not show skills section when no skills provided', () => {
      const certsWithoutSkills = [
        {
          ...mockCertificates[0],
          skills: undefined,
        },
      ]

      render(<CertificationsGrid certificates={certsWithoutSkills} stats={mockStats} />)

      expect(screen.queryByText('AWS')).not.toBeInTheDocument()
    })
  })

  describe('Date Information', () => {
    it('displays issue dates', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      expect(screen.getByText(/Jun 2023/)).toBeInTheDocument()
      expect(screen.getByText(/Jan 2024/)).toBeInTheDocument()
    })

    it('shows date range for active certificates with expiry', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      expect(screen.getByText(/Jun 2023 - Jun 2026/)).toBeInTheDocument()
    })

    it('does not show expiry date for expired certificates', () => {
      const { container } = render(
        <CertificationsGrid certificates={mockCertificates} stats={mockStats} />
      )

      // Expired cert should only show issue date, not expiry
      const expiredCertText = container.textContent
      expect(expiredCertText).toContain('Jan 2020')
      expect(expiredCertText).not.toContain('Jan 2020 - Jan 2022')
    })

    it('renders calendar icons for dates', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      const calendarIcons = screen.getAllByTestId('calendar-icon')
      expect(calendarIcons.length).toBeGreaterThan(0)
    })
  })

  describe('Credential Information', () => {
    it('displays credential IDs', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      expect(screen.getByText(/ID: AWS-123456/)).toBeInTheDocument()
      expect(screen.getByText(/ID: GCP-789012/)).toBeInTheDocument()
      expect(screen.getByText(/ID: EXP-111111/)).toBeInTheDocument()
    })

    it('does not show credential ID when not provided', () => {
      const certsWithoutId = [
        {
          ...mockCertificates[0],
          credentialId: undefined,
        },
      ]

      render(<CertificationsGrid certificates={certsWithoutId} stats={mockStats} />)

      expect(screen.queryByText(/ID:/)).not.toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('renders View Certificate button for each certificate', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      const viewButtons = screen.getAllByText('View Certificate')
      expect(viewButtons).toHaveLength(3)
      expect(screen.getAllByTestId('eye-icon')).toHaveLength(3)
    })

    it('renders Verify button when verification URL is provided', () => {
      render(<CertificationsGrid certificates={mockCertificates} stats={mockStats} />)

      const verifyButtons = screen.getAllByText('Verify')
      expect(verifyButtons).toHaveLength(3)
      expect(screen.getAllByTestId('externallink-icon')).toHaveLength(3)
    })

    it('generates correct certificate view links', () => {
      const { container } = render(
        <CertificationsGrid certificates={mockCertificates} stats={mockStats} />
      )

      const viewLinks = container.querySelectorAll('a[href*="/certifications/"]')
      expect(viewLinks.length).toBeGreaterThan(0)
      
      // Check that slug is generated from title and ID
      const firstLink = viewLinks[0] as HTMLAnchorElement
      expect(firstLink.href).toContain('aws-certified-solutions-architect')
    })

    it('verification buttons open in new tab', () => {
      const { container } = render(
        <CertificationsGrid certificates={mockCertificates} stats={mockStats} />
      )

      const verifyLinks = container.querySelectorAll('a[href*="verify"]')
      verifyLinks.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no certificates', () => {
      render(<CertificationsGrid certificates={[]} stats={mockStats} />)

      expect(screen.getByText('No certifications found.')).toBeInTheDocument()
      expect(screen.getByTestId('award-icon')).toBeInTheDocument()
    })

    it('does not render grid when no certificates', () => {
      const { container } = render(
        <CertificationsGrid certificates={[]} stats={mockStats} />
      )

      const grid = container.querySelector('.grid.grid-cols-1')
      expect(grid).not.toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('uses grid layout for certificates', () => {
      const { container } = render(
        <CertificationsGrid certificates={mockCertificates} stats={mockStats} />
      )

      const grid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3')
      expect(grid).toBeInTheDocument()
    })

    it('applies hover effects to certificate cards', () => {
      const { container } = render(
        <CertificationsGrid certificates={mockCertificates} stats={mockStats} />
      )

      const hoverCards = container.querySelectorAll('.hover\\:shadow-lg')
      expect(hoverCards.length).toBeGreaterThan(0)
    })

    it('truncates long certificate titles', () => {
      const { container } = render(
        <CertificationsGrid certificates={mockCertificates} stats={mockStats} />
      )

      const titles = container.querySelectorAll('.line-clamp-2')
      expect(titles.length).toBeGreaterThan(0)
    })
  })

  describe('Category Colors', () => {
    it('applies different colors to different categories', () => {
      const { container } = render(
        <CertificationsGrid certificates={mockCertificates} stats={mockStats} />
      )

      const categoryBadges = container.querySelectorAll('[class*="bg-"]')
      expect(categoryBadges.length).toBeGreaterThan(0)
    })
  })
})
