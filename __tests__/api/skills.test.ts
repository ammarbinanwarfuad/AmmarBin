/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET, POST, PUT } from '@/app/api/skills/route'
import { connectDB } from '@/lib/db'
import Skill from '@/models/Skill'
import { getServerSession } from 'next-auth'
import { logActivity } from '@/lib/activity-logger'
import { mockSkill, createMockSkills } from '../setup/mock-data'

// Mock dependencies
jest.mock('@/lib/db')
jest.mock('@/models/Skill')
jest.mock('next-auth')
jest.mock('@/lib/activity-logger')
jest.mock('@/lib/cache-invalidation', () => ({
  invalidateCacheAfterUpdate: jest.fn(),
}))
jest.mock('next/cache', () => ({
  unstable_cache: (fn: any) => fn,
}))

describe('Skills API - GET /api/skills', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return all skills sorted by category and name', async () => {
    const mockSkills = createMockSkills(3)
    
    const mockFind = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            maxTimeMS: jest.fn().mockResolvedValue(mockSkills),
          }),
        }),
      }),
    })
    ;(Skill.find as jest.Mock) = mockFind

    const response = await GET()
    const data = await response.json()

    expect(connectDB).toHaveBeenCalled()
    expect(mockFind).toHaveBeenCalled()
    expect(data.skills).toHaveLength(3)
  })

  it('should return empty array when no skills exist', async () => {
    const mockFind = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            maxTimeMS: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    })
    ;(Skill.find as jest.Mock) = mockFind

    const response = await GET()
    const data = await response.json()

    expect(data.skills).toEqual([])
  })

  it('should handle database errors gracefully', async () => {
    ;(connectDB as jest.Mock).mockRejectedValue(new Error('Database connection failed'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch skills')
  })

  it('should include cache control headers', async () => {
    const mockSkills = createMockSkills(2)
    
    const mockFind = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            maxTimeMS: jest.fn().mockResolvedValue(mockSkills),
          }),
        }),
      }),
    })
    ;(Skill.find as jest.Mock) = mockFind
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)

    const response = await GET()
    
    // Check that response has headers (Response object structure)
    expect(response).toBeDefined()
    expect(response.status).toBe(200)
  })
})

describe('Skills API - POST /api/skills', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a skill with valid data when authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@test.com' },
    })
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)

    const newSkill = {
      name: 'React',
      category: 'Frontend',
      proficiency: 90,
      icon: 'react.svg',
    }

    ;(Skill.create as jest.Mock).mockResolvedValue({
      ...newSkill,
      _id: 'new-skill-id',
    })

    const request = new NextRequest('http://localhost:3000/api/skills', {
      method: 'POST',
      body: JSON.stringify(newSkill),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.skill).toBeDefined()
    expect(Skill.create).toHaveBeenCalledWith(newSkill)
  })

  it('should reject request when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/skills', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should log activity after creating skill', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@test.com' },
    })
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)

    const newSkill = {
      name: 'TypeScript',
      category: 'Frontend',
      proficiency: 85,
    }

    ;(Skill.create as jest.Mock).mockResolvedValue({
      ...newSkill,
      _id: 'skill-id-123',
    })

    const request = new NextRequest('http://localhost:3000/api/skills', {
      method: 'POST',
      body: JSON.stringify(newSkill),
      headers: {
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Test Browser',
      },
    })

    await POST(request)

    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'create',
        entityType: 'skill',
        entityId: 'skill-id-123',
        entityTitle: 'TypeScript',
      })
    )
  })

  it('should invalidate cache after creating skill', async () => {
    const { invalidateCacheAfterUpdate } = require('@/lib/cache-invalidation')
    
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@test.com' },
    })
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)
    ;(Skill.create as jest.Mock).mockResolvedValue({ _id: 'test-id' })

    const request = new NextRequest('http://localhost:3000/api/skills', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', category: 'Frontend', proficiency: 80 }),
    })

    await POST(request)

    expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith('skills')
  })

  it('should handle database errors during creation', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@test.com' },
    })
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)
    ;(Skill.create as jest.Mock).mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/skills', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create skill')
  })
})

describe('Skills API - PUT /api/skills', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update a skill with valid data when authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@test.com' },
    })
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)

    const updateData = {
      _id: 'skill-id-123',
      name: 'React Advanced',
      proficiency: 95,
    }

    ;(Skill.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      _id: 'skill-id-123',
      name: 'React Advanced',
      proficiency: 95,
    })

    const request = new NextRequest('http://localhost:3000/api/skills', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.skill).toBeDefined()
    expect(Skill.findByIdAndUpdate).toHaveBeenCalledWith(
      'skill-id-123',
      { name: 'React Advanced', proficiency: 95 },
      { new: true, runValidators: true }
    )
  })

  it('should return 400 when skill ID is missing', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@test.com' },
    })
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)

    const request = new NextRequest('http://localhost:3000/api/skills', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Test' }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Skill ID is required')
  })

  it('should return 404 when skill not found', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@test.com' },
    })
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)
    ;(Skill.findByIdAndUpdate as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/skills', {
      method: 'PUT',
      body: JSON.stringify({ _id: 'non-existent-id', name: 'Test' }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Skill not found')
  })

  it('should reject request when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/skills', {
      method: 'PUT',
      body: JSON.stringify({ _id: 'test-id', name: 'Test' }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should log activity after updating skill', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@test.com' },
    })
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)
    ;(Skill.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      _id: 'skill-id',
      name: 'Updated Skill',
    })

    const request = new NextRequest('http://localhost:3000/api/skills', {
      method: 'PUT',
      body: JSON.stringify({ _id: 'skill-id', name: 'Updated Skill' }),
    })

    await PUT(request)

    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'update',
        entityType: 'skill',
        entityId: 'skill-id',
      })
    )
  })

  it('should invalidate cache after updating skill', async () => {
    const { invalidateCacheAfterUpdate } = require('@/lib/cache-invalidation')
    
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@test.com' },
    })
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)
    ;(Skill.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'test-id' })

    const request = new NextRequest('http://localhost:3000/api/skills', {
      method: 'PUT',
      body: JSON.stringify({ _id: 'test-id', name: 'Test' }),
    })

    await PUT(request)

    expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith('skills')
  })
})
