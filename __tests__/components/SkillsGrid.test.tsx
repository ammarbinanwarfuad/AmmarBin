import { render, screen } from '../setup/test-utils'
import { SkillsGrid } from '@/components/SkillsGrid'

const mockSkills = [
  {
    _id: '1',
    name: 'React',
    category: 'Frontend Development',
    proficiency: 90,
    icon: 'react-icon.svg',
  },
  {
    _id: '2',
    name: 'Next.js',
    category: 'Frontend Development',
    proficiency: 85,
    icon: 'nextjs-icon.svg',
  },
  {
    _id: '3',
    name: 'Node.js',
    category: 'Backend Development',
    proficiency: 80,
    icon: 'nodejs-icon.svg',
  },
  {
    _id: '4',
    name: 'MongoDB',
    category: 'Backend Development',
    proficiency: 75,
    icon: 'mongodb-icon.svg',
  },
  {
    _id: '5',
    name: 'Docker',
    category: 'Tools & Technologies',
    proficiency: 70,
    icon: 'docker-icon.svg',
  },
]

const mockCategories = ['Frontend Development', 'Backend Development', 'Tools & Technologies']

describe('SkillsGrid', () => {
  it('should render all categories', () => {
    render(<SkillsGrid skills={mockSkills} categories={mockCategories} />)

    expect(screen.getByText('Frontend Development')).toBeInTheDocument()
    expect(screen.getByText('Backend Development')).toBeInTheDocument()
    expect(screen.getByText('Tools & Technologies')).toBeInTheDocument()
  })

  it('should render all skills', () => {
    render(<SkillsGrid skills={mockSkills} categories={mockCategories} />)

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Next.js')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
    expect(screen.getByText('MongoDB')).toBeInTheDocument()
    expect(screen.getByText('Docker')).toBeInTheDocument()
  })

  it('should group skills by category', () => {
    const { container } = render(<SkillsGrid skills={mockSkills} categories={mockCategories} />)

    // Check that there are 3 category sections
    const categoryHeaders = screen.getAllByRole('heading', { level: 2 })
    expect(categoryHeaders).toHaveLength(3)
  })

  it('should render proficiency bars for each skill', () => {
    const { container } = render(<SkillsGrid skills={mockSkills} categories={mockCategories} />)

    // Check for progress bars
    const progressBars = container.querySelectorAll('.h-2\\.5.rounded-full')
    expect(progressBars.length).toBeGreaterThan(0)
  })

  it('should not render empty categories', () => {
    const categoriesWithEmpty = [...mockCategories, 'Empty Category']
    render(<SkillsGrid skills={mockSkills} categories={categoriesWithEmpty} />)

    expect(screen.queryByText('Empty Category')).not.toBeInTheDocument()
  })

  it('should use grid layout for skills', () => {
    const { container } = render(<SkillsGrid skills={mockSkills} categories={mockCategories} />)

    const grids = container.querySelectorAll('.grid')
    expect(grids.length).toBe(3) // One grid per category
  })

  it('should render cards for each skill', () => {
    const { container } = render(<SkillsGrid skills={mockSkills} categories={mockCategories} />)

    // Each skill should be in a card
    const cards = container.querySelectorAll('.p-6')
    expect(cards.length).toBe(5) // 5 skills total
  })

  it('should handle single category', () => {
    const singleCategory = ['Frontend Development']
    const frontendSkills = mockSkills.filter(
      (skill) => skill.category === 'Frontend Development'
    )

    render(<SkillsGrid skills={frontendSkills} categories={singleCategory} />)

    expect(screen.getByText('Frontend Development')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Next.js')).toBeInTheDocument()
  })

  it('should handle empty skills array', () => {
    const { container } = render(<SkillsGrid skills={[]} categories={mockCategories} />)

    // No categories should be rendered since there are no skills
    const categoryHeaders = container.querySelectorAll('h2')
    expect(categoryHeaders).toHaveLength(0)
  })

  it('should render skills in correct order within category', () => {
    const { container } = render(<SkillsGrid skills={mockSkills} categories={mockCategories} />)

    const skillNames = Array.from(container.querySelectorAll('.font-semibold')).map(
      (el) => el.textContent
    )

    // Frontend skills should come before Backend skills
    const reactIndex = skillNames.indexOf('React')
    const nodeIndex = skillNames.indexOf('Node.js')
    expect(reactIndex).toBeLessThan(nodeIndex)
  })

  it('should apply category-specific colors', () => {
    const { container } = render(<SkillsGrid skills={mockSkills} categories={mockCategories} />)

    // Check that progress bars have background colors
    const progressBars = container.querySelectorAll(
      '.h-2\\.5.rounded-full.transition-all'
    )
    expect(progressBars.length).toBe(5)

    progressBars.forEach((bar) => {
      const backgroundColor = (bar as HTMLElement).style.backgroundColor
      expect(backgroundColor).toBeTruthy()
    })
  })

  it('should have responsive grid classes', () => {
    const { container } = render(<SkillsGrid skills={mockSkills} categories={mockCategories} />)

    const grids = container.querySelectorAll('.grid')
    grids.forEach((grid) => {
      expect(grid).toHaveClass('grid-cols-1')
      expect(grid).toHaveClass('sm:grid-cols-2')
      expect(grid).toHaveClass('lg:grid-cols-4')
    })
  })

  it('should render with proper spacing between categories', () => {
    const { container } = render(<SkillsGrid skills={mockSkills} categories={mockCategories} />)

    const mainContainer = container.querySelector('.space-y-12')
    expect(mainContainer).toBeInTheDocument()
  })
})
