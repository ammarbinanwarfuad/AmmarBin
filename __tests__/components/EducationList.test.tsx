import { render, screen } from '../setup/test-utils'
import { EducationList } from '@/components/EducationList'

// Mock LazyMotion components
jest.mock('@/components/LazyMotion', () => ({
  LazyMotionDiv: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: () => <svg data-testid="calendar-icon" />,
  MapPin: () => <svg data-testid="mappin-icon" />,
  GraduationCap: () => <svg data-testid="graduationcap-icon" />,
  Award: () => <svg data-testid="award-icon" />,
}))

const mockEducation = [
  {
    _id: '1',
    institution: 'Test University',
    institutionLogo: 'https://example.com/logo.jpg',
    degree: 'Bachelor of Science',
    field: 'Computer Science',
    startDate: new Date('2019-09-01'),
    endDate: new Date('2023-05-15'),
    current: false,
    location: 'New York, NY',
    grade: '3.8',
    description: 'Studied computer science fundamentals and advanced topics.',
    achievements: [
      'Dean\'s List all semesters',
      'Published research paper on AI',
      'Led development team of 5 students',
    ],
  },
  {
    _id: '2',
    institution: 'Online Learning Platform',
    degree: 'Master of Science',
    field: 'Data Science',
    startDate: new Date('2023-09-01'),
    current: true,
    description: 'Advanced studies in machine learning and data analytics.',
  },
]

describe('EducationList', () => {
  describe('Rendering', () => {
    it('renders education entries correctly', () => {
      render(<EducationList education={mockEducation} />)

      expect(screen.getByText('Bachelor of Science - Computer Science')).toBeInTheDocument()
      expect(screen.getByText('Test University')).toBeInTheDocument()
      expect(screen.getByText('Master of Science - Data Science')).toBeInTheDocument()
      expect(screen.getByText('Online Learning Platform')).toBeInTheDocument()
    })

    it('displays education icons', () => {
      render(<EducationList education={mockEducation} />)

      const graduationIcons = screen.getAllByTestId('graduationcap-icon')
      expect(graduationIcons).toHaveLength(2)
    })

    it('shows empty state when no education entries', () => {
      render(<EducationList education={[]} />)

      expect(screen.getByText('No education information available.')).toBeInTheDocument()
    })
  })

  describe('Date Formatting', () => {
    it('displays date range for completed education', () => {
      render(<EducationList education={mockEducation} />)

      expect(screen.getByText(/Sep 2019 - May 2023/)).toBeInTheDocument()
    })

    it('shows "Present" for current education', () => {
      render(<EducationList education={mockEducation} />)

      expect(screen.getByText(/Sep 2023 - Present/)).toBeInTheDocument()
    })

    it('displays calendar icons for dates', () => {
      render(<EducationList education={mockEducation} />)

      const calendarIcons = screen.getAllByTestId('calendar-icon')
      expect(calendarIcons.length).toBeGreaterThan(0)
    })
  })

  describe('Location and Grade', () => {
    it('displays location when provided', () => {
      render(<EducationList education={mockEducation} />)

      expect(screen.getByText('New York, NY')).toBeInTheDocument()
      expect(screen.getByTestId('mappin-icon')).toBeInTheDocument()
    })

    it('displays GPA when provided', () => {
      render(<EducationList education={mockEducation} />)

      expect(screen.getByText('GPA: 3.8')).toBeInTheDocument()
      expect(screen.getByTestId('award-icon')).toBeInTheDocument()
    })

    it('does not show location when not provided', () => {
      render(<EducationList education={[mockEducation[1]]} />)

      expect(screen.queryByTestId('mappin-icon')).not.toBeInTheDocument()
    })

    it('does not show grade when not provided', () => {
      render(<EducationList education={[mockEducation[1]]} />)

      expect(screen.queryByText(/GPA:/)).not.toBeInTheDocument()
    })
  })

  describe('Description and Achievements', () => {
    it('displays description when provided', () => {
      render(<EducationList education={mockEducation} />)

      expect(
        screen.getByText('Studied computer science fundamentals and advanced topics.')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Advanced studies in machine learning and data analytics.')
      ).toBeInTheDocument()
    })

    it('displays achievements section when provided', () => {
      render(<EducationList education={mockEducation} />)

      expect(screen.getByText('Achievements:')).toBeInTheDocument()
      expect(screen.getByText('Dean\'s List all semesters')).toBeInTheDocument()
      expect(screen.getByText('Published research paper on AI')).toBeInTheDocument()
      expect(screen.getByText('Led development team of 5 students')).toBeInTheDocument()
    })

    it('does not show achievements when not provided', () => {
      render(<EducationList education={[mockEducation[1]]} />)

      expect(screen.queryByText('Achievements:')).not.toBeInTheDocument()
    })

    it('renders achievements as a list', () => {
      const { container } = render(<EducationList education={mockEducation} />)

      const achievementsList = container.querySelector('ul.list-disc')
      expect(achievementsList).toBeInTheDocument()
      
      const achievementItems = achievementsList?.querySelectorAll('li')
      expect(achievementItems).toHaveLength(3)
    })
  })

  describe('Field Display', () => {
    it('shows degree with field when field is provided', () => {
      render(<EducationList education={mockEducation} />)

      expect(screen.getByText('Bachelor of Science - Computer Science')).toBeInTheDocument()
      expect(screen.getByText('Master of Science - Data Science')).toBeInTheDocument()
    })

    it('shows only degree when field is not provided', () => {
      const educationWithoutField = [
        {
          ...mockEducation[0],
          field: '',
        },
      ]

      render(<EducationList education={educationWithoutField} />)

      expect(screen.getByText('Bachelor of Science')).toBeInTheDocument()
      expect(screen.queryByText('Bachelor of Science -')).not.toBeInTheDocument()
    })
  })

  describe('Layout and Structure', () => {
    it('renders education entries in a vertical space-y layout', () => {
      const { container } = render(<EducationList education={mockEducation} />)

      const spaceYContainer = container.querySelector('.space-y-8')
      expect(spaceYContainer).toBeInTheDocument()
    })

    it('wraps each entry in a Card component', () => {
      const { container } = render(<EducationList education={mockEducation} />)

      // Cards should be rendered for each education entry
      const cards = container.querySelectorAll('[class*="rounded"]')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('maintains proper spacing between elements', () => {
      const { container } = render(<EducationList education={mockEducation} />)

      // Check for gap-4 flex layout
      const flexGapElements = container.querySelectorAll('.flex.items-start.gap-4')
      expect(flexGapElements.length).toBeGreaterThan(0)
    })
  })

  describe('Multiple Entries', () => {
    it('renders all education entries', () => {
      render(<EducationList education={mockEducation} />)

      expect(screen.getByText('Test University')).toBeInTheDocument()
      expect(screen.getByText('Online Learning Platform')).toBeInTheDocument()
    })

    it('handles single education entry', () => {
      render(<EducationList education={[mockEducation[0]]} />)

      expect(screen.getByText('Test University')).toBeInTheDocument()
      expect(screen.queryByText('Online Learning Platform')).not.toBeInTheDocument()
    })

    it('orders education entries as provided', () => {
      const { container } = render(<EducationList education={mockEducation} />)

      const institutions = container.querySelectorAll('h3 + p')
      expect(institutions[0]).toHaveTextContent('Test University')
      expect(institutions[1]).toHaveTextContent('Online Learning Platform')
    })
  })
})
