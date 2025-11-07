/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET, POST, PUT } from '@/app/api/experience/route'
import { connectDB } from '@/lib/db'
import Experience from '@/models/Experience'
import { getServerSession } from 'next-auth'

// Mock all dependencies
jest.mock('@/lib/db')
jest.mock('@/models/Experience')
jest.mock('@/lib/cache-invalidation', () => ({
  invalidateCacheAfterUpdate: jest.fn(),
}))
jest.mock('next/cache', () => ({
  unstable_cache: (fn: any) => fn,
}))
jest.mock('next-auth')

const mockExperience = {
  _id: '507f1f77bcf86cd799439011',
  company: 'Tech Company Inc.',
  position: 'Senior Software Engineer',
  startDate: '2022-01-01',
  endDate: '2024-06-01',
  current: false,
  description: 'Led development of web applications using Next.js and TypeScript.',
  location: 'Remote',
  employmentType: 'Full-time',
  skills: ['Next.js', 'TypeScript', 'React'],
  order: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('Experience API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/experience', () => {
    it('should return all experiences sorted by order and date', async () => {
      const mockExperienceList = [mockExperience, { ...mockExperience, _id: '2', order: 2 }]

      ;(connectDB as jest.Mock).mockResolvedValue(undefined)
      ;(Experience.find as jest.Mock) = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue(mockExperienceList),
      })

      const response = await GET()

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.experiences).toBeDefined()
      expect(Array.isArray(data.experiences)).toBe(true)
    })

    it('should return empty array when no experiences exist', async () => {
      const Experience = require('@/models/Experience').default

      Experience.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([]),
      })

      const response = await GET()

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.experiences).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      const Experience = require('@/models/Experience').default

      Experience.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockRejectedValue(new Error('Database error')),
      })

      const response = await GET()

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to fetch experiences')
    })

    it('should return proper response structure', async () => {
      const Experience = require('@/models/Experience').default

      Experience.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([mockExperience]),
      })

      const response = await GET()
      const data = await response.json()

      expect(data).toHaveProperty('experiences')
      expect(Array.isArray(data.experiences)).toBe(true)
    })
  })

  describe('POST /api/experience', () => {
    it('should create experience with valid data when authenticated', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const Experience = require('@/models/Experience').default
      Experience.create = jest.fn().mockResolvedValue(mockExperience)

      const request = new NextRequest('http://localhost:3000/api/experience', {
        method: 'POST',
        body: JSON.stringify({
          company: 'Tech Company Inc.',
          position: 'Senior Software Engineer',
          startDate: '2022-01-01',
          endDate: '2024-06-01',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.experience).toBeDefined()
      expect(Experience.create).toHaveBeenCalled()
    })

    it('should reject request when not authenticated', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/experience', {
        method: 'POST',
        body: JSON.stringify({
          company: 'Tech Company Inc.',
          position: 'Senior Software Engineer',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should invalidate cache after creating experience', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const Experience = require('@/models/Experience').default
      Experience.create = jest.fn().mockResolvedValue(mockExperience)

      const { invalidateCacheAfterUpdate } = require('@/lib/cache-invalidation')

      const request = new NextRequest('http://localhost:3000/api/experience', {
        method: 'POST',
        body: JSON.stringify({
          company: 'Tech Company Inc.',
          position: 'Senior Software Engineer',
        }),
      })

      await POST(request)

      expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith('experience')
    })

    it('should handle database errors during creation', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const Experience = require('@/models/Experience').default
      Experience.create = jest.fn().mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/experience', {
        method: 'POST',
        body: JSON.stringify({
          company: 'Tech Company Inc.',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to create experience')
    })
  })

  describe('PUT /api/experience', () => {
    it('should update experience with valid data when authenticated', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const Experience = require('@/models/Experience').default
      const updatedExperience = { ...mockExperience, position: 'Lead Software Engineer' }
      Experience.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedExperience)

      const request = new NextRequest('http://localhost:3000/api/experience', {
        method: 'PUT',
        body: JSON.stringify({
          _id: mockExperience._id,
          position: 'Lead Software Engineer',
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.experience).toBeDefined()
      expect(Experience.findByIdAndUpdate).toHaveBeenCalledWith(
        mockExperience._id,
        { position: 'Lead Software Engineer' },
        { new: true, runValidators: true }
      )
    })

    it('should require experience ID for update', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const request = new NextRequest('http://localhost:3000/api/experience', {
        method: 'PUT',
        body: JSON.stringify({
          position: 'Lead Software Engineer',
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Experience ID is required')
    })

    it('should return 404 when experience not found', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const Experience = require('@/models/Experience').default
      Experience.findByIdAndUpdate = jest.fn().mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/experience', {
        method: 'PUT',
        body: JSON.stringify({
          _id: 'nonexistent-id',
          position: 'Lead Software Engineer',
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Experience not found')
    })

    it('should reject update when not authenticated', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/experience', {
        method: 'PUT',
        body: JSON.stringify({
          _id: mockExperience._id,
          position: 'Lead Software Engineer',
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should invalidate cache after updating experience', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const Experience = require('@/models/Experience').default
      const updatedExperience = { ...mockExperience, position: 'Lead Software Engineer' }
      Experience.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedExperience)

      const { invalidateCacheAfterUpdate } = require('@/lib/cache-invalidation')

      const request = new NextRequest('http://localhost:3000/api/experience', {
        method: 'PUT',
        body: JSON.stringify({
          _id: mockExperience._id,
          position: 'Lead Software Engineer',
        }),
      })

      await PUT(request)

      expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith('experience')
    })

    it('should handle database errors during update', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const Experience = require('@/models/Experience').default
      Experience.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/experience', {
        method: 'PUT',
        body: JSON.stringify({
          _id: mockExperience._id,
          position: 'Lead Software Engineer',
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to update experience')
    })
  })
})
