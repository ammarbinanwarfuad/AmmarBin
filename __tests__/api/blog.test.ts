/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/blog/route'
import { connectDB } from '@/lib/db'
import Blog from '@/models/Blog'
import ExternalBlog from '@/models/ExternalBlog'
import { getServerSession } from 'next-auth'

// Mock all dependencies
jest.mock('@/lib/db')
jest.mock('@/models/Blog')
jest.mock('@/models/ExternalBlog')
jest.mock('@/lib/cache-invalidation', () => ({
  invalidateCacheAfterUpdate: jest.fn(),
}))
jest.mock('next/cache', () => ({
  unstable_cache: (fn: any) => fn,
}))
jest.mock('next-auth')

const mockBlog = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Getting Started with Next.js 14',
  slug: 'getting-started-nextjs-14',
  content: '# Introduction\n\nNext.js 14 brings amazing new features...',
  excerpt: 'Learn about the new features in Next.js 14',
  thumbnail: 'https://example.com/blog1.jpg',
  category: 'Web Development',
  published: true,
  publishedDate: '2024-11-20',
  readingTime: 5,
  createdAt: new Date('2024-11-15'),
  updatedAt: new Date('2024-11-15'),
}

const mockExternalBlog = {
  _id: '507f1f77bcf86cd799439012',
  title: 'Building Scalable APIs',
  slug: 'building-scalable-apis',
  excerpt: 'Best practices for API development',
  link: 'https://hashnode.com/@user/building-scalable-apis',
  thumbnail: 'https://hashnode.com/image.jpg',
  source: 'hashnode',
  publishedDate: '2024-11-18',
  createdAt: new Date('2024-11-18'),
}

describe('Blog API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/blog', () => {
    it('should return all blogs (internal + external) sorted by date', async () => {
      const Blog = require('@/models/Blog').default
      const ExternalBlog = require('@/models/ExternalBlog').default

      Blog.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([mockBlog]),
      })

      ExternalBlog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([mockExternalBlog]),
      })

      const request = new NextRequest('http://localhost:3000/api/blog')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.blogs).toBeDefined()
      expect(Array.isArray(data.blogs)).toBe(true)
    })

    it('should return only internal blogs when source=internal', async () => {
      const Blog = require('@/models/Blog').default
      const ExternalBlog = require('@/models/ExternalBlog').default

      Blog.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([mockBlog]),
      })

      ExternalBlog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([]),
      })

      const request = new NextRequest('http://localhost:3000/api/blog?source=internal')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.blogs).toBeDefined()
    })

    it('should filter external blogs by source', async () => {
      const Blog = require('@/models/Blog').default
      const ExternalBlog = require('@/models/ExternalBlog').default

      Blog.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([]),
      })

      ExternalBlog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([mockExternalBlog]),
      })

      const request = new NextRequest('http://localhost:3000/api/blog?source=hashnode')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(ExternalBlog.find).toHaveBeenCalledWith({ source: 'hashnode' })
    })

    it('should return single blog by slug', async () => {
      const Blog = require('@/models/Blog').default

      Blog.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue(mockBlog),
      })

      const request = new NextRequest(
        'http://localhost:3000/api/blog?slug=getting-started-nextjs-14'
      )
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.blog).toBeDefined()
      expect(data.blog.slug).toBe('getting-started-nextjs-14')
    })

    it('should return 404 when blog not found by slug', async () => {
      const Blog = require('@/models/Blog').default

      Blog.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue(null),
      })

      const request = new NextRequest('http://localhost:3000/api/blog?slug=nonexistent')
      const response = await GET(request)

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Blog post not found')
    })

    it('should only return published blogs by default', async () => {
      const Blog = require('@/models/Blog').default
      const ExternalBlog = require('@/models/ExternalBlog').default

      Blog.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([mockBlog]),
      })

      ExternalBlog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([]),
      })

      const request = new NextRequest('http://localhost:3000/api/blog')
      await GET(request)

      expect(Blog.find).toHaveBeenCalledWith({ published: true })
    })

    it('should include unpublished blogs when includeUnpublished=true', async () => {
      const Blog = require('@/models/Blog').default
      const ExternalBlog = require('@/models/ExternalBlog').default

      Blog.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([mockBlog]),
      })

      ExternalBlog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([]),
      })

      const request = new NextRequest(
        'http://localhost:3000/api/blog?includeUnpublished=true'
      )
      await GET(request)

      expect(Blog.find).toHaveBeenCalledWith({})
    })

    it('should handle database errors gracefully', async () => {
      const Blog = require('@/models/Blog').default
      const ExternalBlog = require('@/models/ExternalBlog').default

      Blog.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockRejectedValue(new Error('Database error')),
      })

      ExternalBlog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([]),
      })

      const request = new NextRequest('http://localhost:3000/api/blog')
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to fetch blogs')
    })
  })

  describe('POST /api/blog', () => {
    it('should create blog with valid data', async () => {
      const Blog = require('@/models/Blog').default
      Blog.create = jest.fn().mockResolvedValue(mockBlog)

      const { invalidateCacheAfterUpdate } = require('@/lib/cache-invalidation')

      const request = new NextRequest('http://localhost:3000/api/blog', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Blog Post',
          slug: 'new-blog-post',
          content: 'Content here',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.blog).toBeDefined()
      expect(Blog.create).toHaveBeenCalled()
    })

    it('should auto-publish if scheduled date has passed', async () => {
      const Blog = require('@/models/Blog').default
      Blog.create = jest.fn().mockImplementation((data) =>
        Promise.resolve({ ...mockBlog, ...data })
      )

      const pastDate = new Date(Date.now() - 86400000).toISOString() // Yesterday

      const request = new NextRequest('http://localhost:3000/api/blog', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Blog Post',
          slug: 'new-blog-post',
          content: 'Content here',
          publishedDate: pastDate,
        }),
      })

      await POST(request)

      expect(Blog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          published: true,
        })
      )
    })

    it('should keep as draft if scheduled for future', async () => {
      const Blog = require('@/models/Blog').default
      Blog.create = jest.fn().mockImplementation((data) =>
        Promise.resolve({ ...mockBlog, ...data })
      )

      const futureDate = new Date(Date.now() + 86400000).toISOString() // Tomorrow

      const request = new NextRequest('http://localhost:3000/api/blog', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Blog Post',
          slug: 'new-blog-post',
          content: 'Content here',
          publishedDate: futureDate,
          published: false,
        }),
      })

      await POST(request)

      expect(Blog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          published: false,
        })
      )
    })

    it('should invalidate cache after creating blog', async () => {
      const Blog = require('@/models/Blog').default
      Blog.create = jest.fn().mockResolvedValue(mockBlog)

      const { invalidateCacheAfterUpdate } = require('@/lib/cache-invalidation')

      const request = new NextRequest('http://localhost:3000/api/blog', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Blog Post',
          slug: 'new-blog-post',
          content: 'Content here',
        }),
      })

      await POST(request)

      expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith('blog')
    })

    it('should handle database errors during creation', async () => {
      const Blog = require('@/models/Blog').default
      Blog.create = jest.fn().mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/blog', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Blog Post',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to create blog')
    })
  })
})
