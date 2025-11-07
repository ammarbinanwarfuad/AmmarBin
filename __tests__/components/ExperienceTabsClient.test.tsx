import { render, screen, fireEvent, waitFor } from '../setup/test-utils'
import { ExperienceTabsClient } from '@/components/ExperienceTabsClient'
import { useRouter, useSearchParams } from 'next/navigation'

// Mock Next.js navigation
const mockPush = jest.fn()
const mockSearchParams = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock LazyMotion components
jest.mock('@/components/LazyMotion', () => ({
  LazyMotionDiv: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: () => <svg data-testid="calendar-icon" />,
  MapPin: () => <svg data-testid="mappin-icon" />,
  Briefcase: () => <svg data-testid="briefcase-icon" />,
  Users: () => <svg data-testid="users-icon" />,
}))

const mockExperiences = [
  {
    _id: '1',
    company: 'Tech Corp',
    companyLogo: 'https://example.com/logo.jpg',
    role: 'Senior Developer',
    startDate: new Date('2022-01-01'),
    endDate: new Date('2023-12-31'),
    current: false,
    location: 'San Francisco, CA',
    description: 'Led development of web applications.',
    responsibilities: [
      'Architected scalable solutions',
      'Mentored junior developers',
      'Conducted code reviews',
    ],
    skills: ['React', 'Node.js', 'TypeScript'],
  },
  {
    _id: '2',
    company: 'Startup Inc',
    role: 'Full Stack Developer',
    startDate: new Date('2024-01-01'),
    current: true,
    location: 'Remote',
    description: 'Building innovative products.',
    responsibilities: ['Developing features', 'Writing tests'],
    skills: ['Next.js', 'Python'],
  },
]

const mockParticipations = [
  {
    _id: '1',
    title: 'Open Source Contributor',
    organization: 'React Team',
    role: 'Contributor',
    startDate: new Date('2023-06-01'),
    endDate: new Date('2024-01-01'),
    current: false,
    location: 'Remote',
    description: 'Contributing to React documentation.',
    impact: 'Improved documentation clarity',
    images: [],
  },
  {
    _id: '2',
    title: 'Community Organizer',
    organization: 'Tech Meetup',
    role: 'Organizer',
    startDate: new Date('2023-01-01'),
    current: true,
    location: 'New York, NY',
    description: 'Organizing monthly tech meetups.',
    impact: 'Grew community to 500+ members',
    images: [],
  },
]

describe('ExperienceTabsClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
  })

  describe('Tab Navigation', () => {
    it('renders both tabs', () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      expect(screen.getByText(/Work Experience/)).toBeInTheDocument()
      expect(screen.getByText(/Participation & Activities/)).toBeInTheDocument()
    })

    it('shows experience count in tab label', () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      expect(screen.getByText(/Work Experience \(2\)/)).toBeInTheDocument()
      expect(screen.getByText(/Participation & Activities \(2\)/)).toBeInTheDocument()
    })

    it('defaults to experience tab when no query param', () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      expect(screen.getByText('Tech Corp')).toBeInTheDocument()
      expect(screen.queryByText('React Team')).not.toBeInTheDocument()
    })

    it('switches to participation tab when clicked', () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      const participationTab = screen.getByText(/Participation & Activities/)
      fireEvent.click(participationTab)

      expect(screen.getByText('Open Source Contributor')).toBeInTheDocument()
      expect(screen.queryByText('Tech Corp')).not.toBeInTheDocument()
    })

    it('switches back to experience tab when clicked', async () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      const participationTab = screen.getByText(/Participation & Activities/)
      fireEvent.click(participationTab)

      await waitFor(() => {
        expect(screen.getByText('Open Source Contributor')).toBeInTheDocument()
      })

      const experienceTab = screen.getByText(/Work Experience/)
      fireEvent.click(experienceTab)

      await waitFor(() => {
        expect(screen.getByText('Tech Corp')).toBeInTheDocument()
      })
    })

    it('updates URL when switching tabs', () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      const participationTab = screen.getByText(/Participation & Activities/)
      fireEvent.click(participationTab)

      expect(mockPush).toHaveBeenCalledWith('?tab=participation', { scroll: false })
    })

    it('initializes with participation tab when query param is set', () => {
      const participationParams = new URLSearchParams('tab=participation')
      ;(useSearchParams as jest.Mock).mockReturnValue(participationParams)

      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      expect(screen.getByText('Open Source Contributor')).toBeInTheDocument()
      expect(screen.queryByText('Tech Corp')).not.toBeInTheDocument()
    })
  })

  describe('Work Experience Display', () => {
    it('displays all experience entries', () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      expect(screen.getByText('Senior Developer')).toBeInTheDocument()
      expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
      expect(screen.getByText('Tech Corp')).toBeInTheDocument()
      expect(screen.getByText('Startup Inc')).toBeInTheDocument()
    })

    it('shows company and role information', () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      expect(screen.getByText('Senior Developer')).toBeInTheDocument()
      expect(screen.getByText('Tech Corp')).toBeInTheDocument()
    })

    it('displays date range for completed experiences', () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      expect(screen.getByText(/Jan 2022 - Dec 2023/)).toBeInTheDocument()
    })

    it('shows "Present" for current experiences', () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      expect(screen.getByText(/Jan 2024 - Present/)).toBeInTheDocument()
    })

    it('displays location information', () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
      expect(screen.getByText('Remote')).toBeInTheDocument()
    })

    it('shows experience description', () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      expect(screen.getByText('Led development of web applications.')).toBeInTheDocument()
      expect(screen.getByText('Building innovative products.')).toBeInTheDocument()
    })

    it('displays key responsibilities', () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      expect(screen.getByText('Key Responsibilities:')).toBeInTheDocument()
      expect(screen.getByText('Architected scalable solutions')).toBeInTheDocument()
      expect(screen.getByText('Mentored junior developers')).toBeInTheDocument()
      expect(screen.getByText('Conducted code reviews')).toBeInTheDocument()
    })

    it('shows skills as tags', () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('Node.js')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Next.js')).toBeInTheDocument()
      expect(screen.getByText('Python')).toBeInTheDocument()
    })

    it('displays Briefcase icon for each experience', () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      const briefcaseIcons = screen.getAllByTestId('briefcase-icon')
      expect(briefcaseIcons.length).toBeGreaterThan(0)
    })

    it('shows empty state when no experiences', () => {
      render(
        <ExperienceTabsClient experiences={[]} participations={mockParticipations} />
      )

      expect(screen.getByText('No work experience added yet.')).toBeInTheDocument()
    })
  })

  describe('Participation Display', () => {
    beforeEach(() => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      const participationTab = screen.getByText(/Participation & Activities/)
      fireEvent.click(participationTab)
    })

    it('displays all participation entries', async () => {
      await waitFor(() => {
        expect(screen.getByText('Open Source Contributor')).toBeInTheDocument()
        expect(screen.getByText('Community Organizer')).toBeInTheDocument()
      })
    })

    it('shows organization and role information', async () => {
      await waitFor(() => {
        expect(screen.getByText('React Team')).toBeInTheDocument()
        expect(screen.getByText(/Role: Contributor/)).toBeInTheDocument()
        expect(screen.getByText('Tech Meetup')).toBeInTheDocument()
        expect(screen.getByText(/Role: Organizer/)).toBeInTheDocument()
      })
    })

    it('displays date range for completed participations', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Jun 2023 - Jan 2024/)).toBeInTheDocument()
      })
    })

    it('shows "Present" for current participations', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Jan 2023 - Present/)).toBeInTheDocument()
      })
    })

    it('displays participation description', async () => {
      await waitFor(() => {
        expect(screen.getByText('Contributing to React documentation.')).toBeInTheDocument()
        expect(screen.getByText('Organizing monthly tech meetups.')).toBeInTheDocument()
      })
    })

    it('shows impact information', async () => {
      await waitFor(() => {
        expect(screen.getByText('Impact:')).toBeInTheDocument()
        expect(screen.getByText('Improved documentation clarity')).toBeInTheDocument()
        expect(screen.getByText('Grew community to 500+ members')).toBeInTheDocument()
      })
    })

    it('displays Users icon for each participation', async () => {
      await waitFor(() => {
        const usersIcons = screen.getAllByTestId('users-icon')
        expect(usersIcons.length).toBeGreaterThan(0)
      })
    })

    it('shows empty state when no participations', async () => {
      render(
        <ExperienceTabsClient experiences={mockExperiences} participations={[]} />
      )

      const participationTab = screen.getByText(/Participation & Activities/)
      fireEvent.click(participationTab)

      await waitFor(() => {
        expect(screen.getByText('No participation activities added yet.')).toBeInTheDocument()
      })
    })

    it('uses grid layout for participation cards', async () => {
      const { container } = render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      const participationTab = screen.getByText(/Participation & Activities/)
      fireEvent.click(participationTab)

      await waitFor(() => {
        const gridContainer = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2')
        expect(gridContainer).toBeInTheDocument()
      })
    })
  })

  describe('Icons', () => {
    it('renders tab icons correctly', () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      expect(screen.getAllByTestId('briefcase-icon').length).toBeGreaterThan(0)
      expect(screen.getAllByTestId('users-icon').length).toBeGreaterThan(0)
    })

    it('renders calendar icons for dates', () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      const calendarIcons = screen.getAllByTestId('calendar-icon')
      expect(calendarIcons.length).toBeGreaterThan(0)
    })

    it('renders location icons', () => {
      render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      const locationIcons = screen.getAllByTestId('mappin-icon')
      expect(locationIcons.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Behavior', () => {
    it('applies responsive classes to tab navigation', () => {
      const { container } = render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      const tabNav = container.querySelector('.flex.flex-col.sm\\:flex-row')
      expect(tabNav).toBeInTheDocument()
    })

    it('applies hover effects to experience cards', () => {
      const { container } = render(
        <ExperienceTabsClient
          experiences={mockExperiences}
          participations={mockParticipations}
        />
      )

      const hoverCards = container.querySelectorAll('.hover\\:shadow-lg')
      expect(hoverCards.length).toBeGreaterThan(0)
    })
  })
})
