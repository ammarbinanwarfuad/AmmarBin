/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET, POST, PUT } from '@/app/api/participation/route'
import { connectDB } from '@/lib/db'
import Participation from '@/models/Participation'
import { getServerSession } from 'next-auth'

// Mock all dependencies
jest.mock('@/lib/db')
jest.mock('@/models/Participation')
jest.mock('@/lib/cache-invalidation', () => ({
  invalidateCacheAfterUpdate: jest.fn(),
}))
jest.mock('next/cache', () => ({
  unstable_cache: (fn: any) => fn,
}))
jest.mock('next-auth')

const mockParticipation = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Tech Conference 2024',
  organization: 'Tech Events Inc.',
  role: 'Speaker',
  startDate: '2024-03-15',
  endDate: '2024-03-17',
  description: 'Presented on cloud architecture and microservices',
  location: 'San Francisco, CA',
  certificate: 'https://example.com/cert.pdf',
  order: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('Participation API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/participation', () => {
    it('should return all participations sorted by order and date', async () => {
      const Participation = require('@/models/Participation').default
      const mockParticipationList = [
        mockParticipation,
        { ...mockParticipation, _id: '2', order: 2 },
      ]

      Participation.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockParticipationList),
      })

      const response = await GET()

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.participations).toBeDefined()
      expect(Array.isArray(data.participations)).toBe(true)
    })

    it('should return empty array when no participations exist', async () => {
      const Participation = require('@/models/Participation').default

      Participation.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      })

      const response = await GET()

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.participations).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      const Participation = require('@/models/Participation').default

      Participation.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(new Error('Database error')),
      })

      const response = await GET()

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to fetch participations')
    })

    it('should return proper response structure', async () => {
      const Participation = require('@/models/Participation').default

      Participation.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockParticipation]),
      })

      const response = await GET()
      const data = await response.json()

      expect(data).toHaveProperty('participations')
      expect(Array.isArray(data.participations)).toBe(true)
    })
  })

  describe('POST /api/participation', () => {
    it('should create participation with valid data', async () => {
      const Participation = require('@/models/Participation').default
      Participation.create = jest.fn().mockResolvedValue(mockParticipation)

      const request = new NextRequest('http://localhost:3000/api/participation', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Tech Conference 2024',
          organization: 'Tech Events Inc.',
          role: 'Speaker',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.participation).toBeDefined()
      expect(Participation.create).toHaveBeenCalled()
    })

    it('should invalidate cache after creating participation', async () => {
      const Participation = require('@/models/Participation').default
      Participation.create = jest.fn().mockResolvedValue(mockParticipation)

      const { invalidateCacheAfterUpdate } = require('@/lib/cache-invalidation')

      const request = new NextRequest('http://localhost:3000/api/participation', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test Event' }),
      })

      await POST(request)

      expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith('participation')
    })

    it('should handle database errors during creation', async () => {
      const Participation = require('@/models/Participation').default
      Participation.create = jest.fn().mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/participation', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test Event' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to create participation')
    })
  })

  describe('PUT /api/participation', () => {
    it('should update participation with valid data', async () => {
      const Participation = require('@/models/Participation').default
      const updatedParticipation = { ...mockParticipation, title: 'Updated Conference' }
      Participation.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedParticipation)

      const request = new NextRequest('http://localhost:3000/api/participation', {
        method: 'PUT',
        body: JSON.stringify({
          _id: mockParticipation._id,
          title: 'Updated Conference',
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.participation).toBeDefined()
      expect(Participation.findByIdAndUpdate).toHaveBeenCalledWith(
        mockParticipation._id,
        { title: 'Updated Conference' },
        { new: true, runValidators: true }
      )
    })

    it('should require participation ID for update', async () => {
      const request = new NextRequest('http://localhost:3000/api/participation', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Conference',
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Participation ID is required')
    })

    it('should return 404 when participation not found', async () => {
      const Participation = require('@/models/Participation').default
      Participation.findByIdAndUpdate = jest.fn().mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/participation', {
        method: 'PUT',
        body: JSON.stringify({
          _id: 'nonexistent-id',
          title: 'Updated Conference',
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Participation not found')
    })

    it('should invalidate cache after updating participation', async () => {
      const Participation = require('@/models/Participation').default
      const updatedParticipation = { ...mockParticipation, title: 'Updated Conference' }
      Participation.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedParticipation)

      const { invalidateCacheAfterUpdate } = require('@/lib/cache-invalidation')

      const request = new NextRequest('http://localhost:3000/api/participation', {
        method: 'PUT',
        body: JSON.stringify({
          _id: mockParticipation._id,
          title: 'Updated Conference',
        }),
      })

      await PUT(request)

      expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith('participation')
    })

    it('should handle database errors during update', async () => {
      const Participation = require('@/models/Participation').default
      Participation.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/participation', {
        method: 'PUT',
        body: JSON.stringify({
          _id: mockParticipation._id,
          title: 'Updated Conference',
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to update participation')
    })
  })
})
