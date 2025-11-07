import { render, screen } from '../setup/test-utils'
import { BlogGrid } from '@/components/BlogGrid'

const mockBlogs = [
  {
    _id: '1',
    title: 'Getting Started with Next.js 14',
    slug: 'getting-started-nextjs-14',
    excerpt: 'Learn about the amazing new features in Next.js 14',
    featuredImage: 'https://example.com/blog1.jpg',
    publishedDate: new Date('2024-11-20'),
    readTime: 5,
    tags: ['Next.js', 'React', 'Web Development'],
    source: 'internal',
    url: '',
  },
  {
    _id: '2',
    title: 'Building Scalable APIs with Node.js',
    slug: 'building-scalable-apis-nodejs',
    excerpt: 'Best practices for creating robust and scalable APIs',
    featuredImage: 'https://example.com/blog2.jpg',
    publishedDate: new Date('2024-11-15'),
    readTime: 8,
    tags: ['Node.js', 'API', 'Backend'],
    source: 'hashnode',
    url: 'https://hashnode.com/@user/building-scalable-apis',
  },
  {
    _id: '3',
    title: 'TypeScript Best Practices',
    slug: 'typescript-best-practices',
    excerpt: 'Essential TypeScript patterns for better code quality',
    featuredImage: 'https://example.com/blog3.jpg',
    publishedDate: new Date('2024-11-10'),
    readTime: 6,
    tags: ['TypeScript', 'JavaScript'],
    source: 'gucc',
    url: 'https://gucc.com/blog/typescript-best-practices',
  },
]

describe('BlogGrid', () => {
  it('should render all blog posts', () => {
    render(<BlogGrid blogs={mockBlogs} />)

    expect(screen.getByText('Getting Started with Next.js 14')).toBeInTheDocument()
    expect(screen.getByText('Building Scalable APIs with Node.js')).toBeInTheDocument()
    expect(screen.getByText('TypeScript Best Practices')).toBeInTheDocument()
  })

  it('should render blog excerpts', () => {
    render(<BlogGrid blogs={mockBlogs} />)

    expect(
      screen.getByText('Learn about the amazing new features in Next.js 14')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Best practices for creating robust and scalable APIs')
    ).toBeInTheDocument()
  })

  it('should render blog images', () => {
    const { container } = render(<BlogGrid blogs={mockBlogs} />)

    const images = container.querySelectorAll('img')
    expect(images.length).toBe(3)
  })

  it('should display source labels correctly', () => {
    render(<BlogGrid blogs={mockBlogs} />)

    expect(screen.getByText('Personal Blog')).toBeInTheDocument()
    expect(screen.getByText('Hashnode')).toBeInTheDocument()
    expect(screen.getByText('GUCC Blog')).toBeInTheDocument()
  })

  it('should display published dates', () => {
    render(<BlogGrid blogs={mockBlogs} />)

    // Check that dates are rendered (format may vary)
    expect(screen.getByText(/November/i)).toBeInTheDocument()
  })

  it('should display read time for blogs', () => {
    render(<BlogGrid blogs={mockBlogs} />)

    expect(screen.getByText('5 min read')).toBeInTheDocument()
    expect(screen.getByText('8 min read')).toBeInTheDocument()
    expect(screen.getByText('6 min read')).toBeInTheDocument()
  })

  it('should render Read More link for internal blogs', () => {
    render(<BlogGrid blogs={mockBlogs} />)

    const readMoreButton = screen.getByText('Read More')
    expect(readMoreButton).toBeInTheDocument()
  })

  it('should render external links for non-internal blogs', () => {
    render(<BlogGrid blogs={mockBlogs} />)

    expect(screen.getByText('Read on Hashnode')).toBeInTheDocument()
    expect(screen.getByText('Read on GUCC Blog')).toBeInTheDocument()
  })

  it('should link to correct internal blog URLs', () => {
    const { container } = render(<BlogGrid blogs={mockBlogs} />)

    const internalLink = container.querySelector('a[href="/blog/getting-started-nextjs-14"]')
    expect(internalLink).toBeInTheDocument()
  })

  it('should link to correct external blog URLs', () => {
    const { container } = render(<BlogGrid blogs={mockBlogs} />)

    const hashnodeLink = container.querySelector(
      'a[href="https://hashnode.com/@user/building-scalable-apis"]'
    )
    const guccLink = container.querySelector(
      'a[href="https://gucc.com/blog/typescript-best-practices"]'
    )

    expect(hashnodeLink).toBeInTheDocument()
    expect(guccLink).toBeInTheDocument()
  })

  it('should open external links in new tab', () => {
    const { container } = render(<BlogGrid blogs={mockBlogs} />)

    const externalLinks = container.querySelectorAll('a[target="_blank"]')
    expect(externalLinks.length).toBe(2) // Hashnode and GUCC links

    externalLinks.forEach((link) => {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('should render empty state when no blogs', () => {
    render(<BlogGrid blogs={[]} />)

    expect(
      screen.getByText('No blog posts found. Check back soon for new content!')
    ).toBeInTheDocument()
  })

  it('should use grid layout', () => {
    const { container } = render(<BlogGrid blogs={mockBlogs} />)

    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
  })

  it('should render cards with hover effect', () => {
    const { container } = render(<BlogGrid blogs={mockBlogs} />)

    const cards = container.querySelectorAll('.hover\\:shadow-lg')
    expect(cards.length).toBe(3)
  })

  it('should render calendar icon for dates', () => {
    const { container } = render(<BlogGrid blogs={mockBlogs} />)

    // Calendar icons should be present (one per blog)
    const calendarIcons = container.querySelectorAll('.h-4.w-4')
    expect(calendarIcons.length).toBeGreaterThan(0)
  })

  it('should handle blogs without featured images', () => {
    const blogsWithoutImages = [
      {
        ...mockBlogs[0],
        featuredImage: '',
      },
    ]

    const { container } = render(<BlogGrid blogs={blogsWithoutImages} />)
    const images = container.querySelectorAll('img')
    expect(images.length).toBe(0)
  })

  it('should handle blogs without read time', () => {
    const blogsWithoutReadTime = [
      {
        ...mockBlogs[0],
        readTime: 0,
      },
    ]

    render(<BlogGrid blogs={blogsWithoutReadTime} />)
    expect(screen.queryByText('min read')).not.toBeInTheDocument()
  })

  it('should render blog cards in correct order', () => {
    const { container } = render(<BlogGrid blogs={mockBlogs} />)

    const titles = Array.from(container.querySelectorAll('h3')).map(
      (el) => el.textContent
    )

    expect(titles[0]).toBe('Getting Started with Next.js 14')
    expect(titles[1]).toBe('Building Scalable APIs with Node.js')
    expect(titles[2]).toBe('TypeScript Best Practices')
  })
})
