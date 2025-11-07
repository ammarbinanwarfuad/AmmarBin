import { render, screen } from '../setup/test-utils'
import ProjectsGrid from '@/components/ProjectsGrid'

const mockProjects = [
  {
    _id: '1',
    title: 'E-Commerce Platform',
    slug: 'ecommerce-platform',
    description: 'A full-stack e-commerce platform built with Next.js',
    image: 'https://example.com/project1.jpg',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    topics: ['Next.js', 'TypeScript', 'E-commerce'],
    category: 'Web Application',
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com/user/project',
    videoUrl: 'https://youtube.com/watch',
    featured: true,
  },
  {
    _id: '2',
    title: 'Task Management App',
    slug: 'task-app',
    description: 'A productivity app for managing tasks and projects',
    image: 'https://example.com/project2.jpg',
    techStack: ['React', 'Node.js'],
    topics: ['React', 'Node.js'],
    category: 'Web Application',
    githubUrl: 'https://github.com/user/task-app',
    featured: false,
  },
]

describe('ProjectsGrid', () => {
  it('should render all projects', () => {
    render(<ProjectsGrid projects={mockProjects} />)

    expect(screen.getByText('E-Commerce Platform')).toBeInTheDocument()
    expect(screen.getByText('Task Management App')).toBeInTheDocument()
  })

  it('should render project descriptions', () => {
    render(<ProjectsGrid projects={mockProjects} />)

    expect(
      screen.getByText('A full-stack e-commerce platform built with Next.js')
    ).toBeInTheDocument()
    expect(
      screen.getByText('A productivity app for managing tasks and projects')
    ).toBeInTheDocument()
  })

  it('should render project topics as tags', () => {
    render(<ProjectsGrid projects={mockProjects} />)

    expect(screen.getAllByText('Next.js')[0]).toBeInTheDocument()
    expect(screen.getAllByText('TypeScript')[0]).toBeInTheDocument()
    expect(screen.getAllByText('E-commerce')[0]).toBeInTheDocument()
  })

  it('should render Live button for projects with liveUrl', () => {
    render(<ProjectsGrid projects={mockProjects} />)

    const liveButtons = screen.getAllByText('Live')
    expect(liveButtons).toHaveLength(1)
  })

  it('should render Code button for projects with githubUrl', () => {
    render(<ProjectsGrid projects={mockProjects} />)

    const codeButtons = screen.getAllByText('Code')
    expect(codeButtons).toHaveLength(2) // Both projects have GitHub URLs
  })

  it('should render Video button for projects with videoUrl', () => {
    render(<ProjectsGrid projects={mockProjects} />)

    const videoButtons = screen.getAllByText('Video')
    expect(videoButtons).toHaveLength(1)
  })

  it('should render links with correct hrefs', () => {
    const { container } = render(<ProjectsGrid projects={mockProjects} />)

    const liveLink = container.querySelector('a[href="https://example.com"]')
    const githubLink = container.querySelector('a[href="https://github.com/user/project"]')
    const videoLink = container.querySelector('a[href="https://youtube.com/watch"]')

    expect(liveLink).toBeInTheDocument()
    expect(githubLink).toBeInTheDocument()
    expect(videoLink).toBeInTheDocument()
  })

  it('should open external links in new tab', () => {
    const { container } = render(<ProjectsGrid projects={mockProjects} />)

    const externalLinks = container.querySelectorAll('a[target="_blank"]')
    expect(externalLinks.length).toBeGreaterThan(0)

    externalLinks.forEach((link) => {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('should render images for projects', () => {
    const { container } = render(<ProjectsGrid projects={mockProjects} />)

    const images = container.querySelectorAll('img')
    expect(images.length).toBe(2)
  })

  it('should render empty state when no projects', () => {
    render(<ProjectsGrid projects={[]} />)

    expect(
      screen.getByText('No projects found. Projects will be added soon.')
    ).toBeInTheDocument()
  })

  it('should use grid layout', () => {
    const { container } = render(<ProjectsGrid projects={mockProjects} />)

    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
  })

  it('should render cards with hover effect', () => {
    const { container } = render(<ProjectsGrid projects={mockProjects} />)

    const cards = container.querySelectorAll('.hover\\:shadow-lg')
    expect(cards.length).toBe(2)
  })

  it('should handle projects without images', () => {
    const projectsWithoutImages = [
      {
        ...mockProjects[0],
        image: '',
      },
    ]

    const { container } = render(<ProjectsGrid projects={projectsWithoutImages} />)
    const images = container.querySelectorAll('img')
    expect(images.length).toBe(0)
  })

  it('should handle projects without topics', () => {
    const projectsWithoutTopics = [
      {
        ...mockProjects[0],
        topics: [],
      },
    ]

    render(<ProjectsGrid projects={projectsWithoutTopics} />)
    expect(screen.getByText('E-Commerce Platform')).toBeInTheDocument()
  })

  it('should render all action buttons when all URLs are provided', () => {
    const fullProject = [mockProjects[0]]
    render(<ProjectsGrid projects={fullProject} />)

    expect(screen.getByText('Live')).toBeInTheDocument()
    expect(screen.getByText('Code')).toBeInTheDocument()
    expect(screen.getByText('Video')).toBeInTheDocument()
  })
})
