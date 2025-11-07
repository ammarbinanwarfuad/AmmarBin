/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/projects/route'
import { connectDB } from '@/lib/db'
import Project from '@/models/Project'
import { getServerSession } from 'next-auth'
import { mockProject, mockUnpublishedProject } from '../setup/mock-data'

// Mock dependencies
jest.mock('@/lib/db')
jest.mock('@/models/Project')
jest.mock('next-auth')
jest.mock('@/lib/cache-invalidation', () => ({
  invalidateCacheAfterUpdate: jest.fn(),
}))
jest.mock('next/cache', () => ({
  unstable_cache: (fn: any) => fn,
}))
jest.mock('@/lib/etag', () => ({
  createETagResponse: jest.fn((data) => 
    new Response(JSON.stringify(data), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  ),
}))

describe('Projects API - GET /api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return only published projects for unauthenticated users', async () => {
    // Mock unauthenticated session
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    
    // Mock database response
    const mockFind = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            maxTimeMS: jest.fn().mockResolvedValue([mockProject]),
          }),
        }),
      }),
    })
    ;(Project.find as jest.Mock) = mockFind

    const request = new NextRequest('http://localhost:3000/api/projects')
    const response = await GET(request)
    const data = await response.json()

    expect(connectDB).toHaveBeenCalled()
    expect(mockFind).toHaveBeenCalledWith({ published: true })
    expect(data.projects).toHaveLength(1)
    expect(data.projects[0].published).toBe(true)
  })

  it('should return all projects (including unpublished) for authenticated admin', async () => {
    // Mock authenticated session
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@test.com' },
    })
    
    const mockFind = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            maxTimeMS: jest.fn().mockResolvedValue([mockProject, mockUnpublishedProject]),
          }),
        }),
      }),
    })
    ;(Project.find as jest.Mock) = mockFind

    const request = new NextRequest('http://localhost:3000/api/projects')
    const response = await GET(request)
    const data = await response.json()

    expect(mockFind).toHaveBeenCalledWith({})
    expect(data.projects).toHaveLength(2)
  })

  it('should filter projects by category when category param provided', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    
    const mockFind = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            maxTimeMS: jest.fn().mockResolvedValue([mockProject]),
          }),
        }),
      }),
    })
    ;(Project.find as jest.Mock) = mockFind

    const request = new NextRequest('http://localhost:3000/api/projects?category=web')
    await GET(request)

    expect(mockFind).toHaveBeenCalledWith({ 
      published: true,
      category: 'web'
    })
  })

  it('should filter featured projects when featured=true', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    
    const mockFind = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            maxTimeMS: jest.fn().mockResolvedValue([mockProject]),
          }),
        }),
      }),
    })
    ;(Project.find as jest.Mock) = mockFind

    const request = new NextRequest('http://localhost:3000/api/projects?featured=true')
    await GET(request)

    expect(mockFind).toHaveBeenCalledWith({ 
      published: true,
      featured: true
    })
  })

  it('should filter by topics using AND semantics', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    
    const mockFind = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            maxTimeMS: jest.fn().mockResolvedValue([mockProject]),
          }),
        }),
      }),
    })
    ;(Project.find as jest.Mock) = mockFind

    const request = new NextRequest('http://localhost:3000/api/projects?topics=react,typescript')
    await GET(request)

    expect(mockFind).toHaveBeenCalledWith({ 
      published: true,
      topics: { $all: ['react', 'typescript'] }
    })
  })

  it('should return empty array when no projects exist', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    
    const mockFind = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            maxTimeMS: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    })
    ;(Project.find as jest.Mock) = mockFind

    const request = new NextRequest('http://localhost:3000/api/projects')
    const response = await GET(request)
    const data = await response.json()

    expect(data.projects).toEqual([])
  })

  it('should handle database errors gracefully', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    ;(connectDB as jest.Mock).mockRejectedValue(new Error('Database connection failed'))

    const request = new NextRequest('http://localhost:3000/api/projects')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch projects')
  })
})

describe('Projects API - POST /api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a project with valid data when authenticated', async () => {
    // Mock authenticated session
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@test.com' },
    })

    const newProjectData = {
      title: 'New Test Project',
      description: 'A new test project',
      techStack: ['React', 'TypeScript'],
    }

    ;(connectDB as jest.Mock).mockResolvedValue(undefined)
    ;(Project.findOne as jest.Mock).mockResolvedValue(null)
    ;(Project.create as jest.Mock).mockResolvedValue({
      ...newProjectData,
      _id: 'new-id',
      slug: 'new-test-project',
    })

    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify(newProjectData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBe('Project created successfully')
    expect(data.project.title).toBe('New Test Project')
    expect(Project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Test Project',
        description: 'A new test project',
        slug: 'new-test-project',
      })
    )
  })

  it('should reject request when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 when title is missing', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@test.com' },
    })
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)

    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify({ description: 'Missing title' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Title and description are required')
  })

  it('should return 400 when description is missing', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@test.com' },
    })
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)

    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify({ title: 'Missing description' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Title and description are required')
  })

  it('should auto-generate slug from title when not provided', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@test.com' },
    })
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)
    ;(Project.findOne as jest.Mock).mockResolvedValue(null)
    ;(Project.create as jest.Mock).mockResolvedValue({
      title: 'My Awesome Project!',
      slug: 'my-awesome-project',
    })

    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        title: 'My Awesome Project!',
        description: 'Description',
      }),
    })

    await POST(request)

    expect(Project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'my-awesome-project',
      })
    )
  })

  it('should ensure unique slug by appending counter', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@test.com' },
    })
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)

    // Mock slug already exists
    ;(Project.findOne as jest.Mock)
      .mockResolvedValueOnce({ slug: 'test-project' })
      .mockResolvedValueOnce(null)

    ;(Project.create as jest.Mock).mockResolvedValue({
      title: 'Test Project',
      slug: 'test-project-1',
    })

    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Project',
        description: 'Description',
      }),
    })

    await POST(request)

    expect(Project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'test-project-1',
      })
    )
  })

  it('should handle database errors during creation', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@test.com' },
    })

    ;(Project.create as jest.Mock).mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Project',
        description: 'Description',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create project')
  })

  it('should invalidate cache after creating project', async () => {
    const { invalidateCacheAfterUpdate } = require('@/lib/cache-invalidation')
    
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@test.com' },
    })
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)
    ;(Project.findOne as jest.Mock).mockResolvedValue(null)
    ;(Project.create as jest.Mock).mockResolvedValue({ _id: 'test-id' })

    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Project',
        description: 'Description',
      }),
    })

    await POST(request)

    expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith('projects')
  })
})
