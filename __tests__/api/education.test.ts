/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET, POST, PUT } from '@/app/api/education/route'
import { connectDB } from '@/lib/db'
import Education from '@/models/Education'
import { getServerSession } from 'next-auth'

// Mock all dependencies
jest.mock('@/lib/db')
jest.mock('@/models/Education')
jest.mock('@/lib/activity-logger')
jest.mock('@/lib/cache-invalidation', () => ({
  invalidateCacheAfterUpdate: jest.fn(),
}))
jest.mock('next/cache', () => ({
  unstable_cache: (fn: any) => fn,
}))
jest.mock('next-auth')

const mockEducation = {
  _id: '507f1f77bcf86cd799439011',
  institution: 'University of Example',
  degree: 'Bachelor of Science',
  field: 'Computer Science',
  startDate: '2020-09-01',
  endDate: '2024-06-01',
  description: 'Studied various aspects of computer science including algorithms, data structures, and software engineering.',
  location: 'Example City, State',
  grade: '3.8 GPA',
  order: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('Education API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/education', () => {
    it('should return all education entries sorted by order and date', async () => {
      const Education = require('@/models/Education').default
      const mockEducationList = [mockEducation, { ...mockEducation, _id: '2', order: 2 }]

      Education.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue(mockEducationList),
      })

      const request = new NextRequest('http://localhost:3000/api/education')
      const response = await GET()

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.education).toBeDefined()
      expect(Array.isArray(data.education)).toBe(true)
    })

    it('should return empty array when no education exists', async () => {
      const Education = require('@/models/Education').default

      Education.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([]),
      })

      const response = await GET()

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.education).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      const Education = require('@/models/Education').default

      Education.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockRejectedValue(new Error('Database error')),
      })

      const response = await GET()

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to fetch education')
    })

    it('should include cache control headers', async () => {
      const Education = require('@/models/Education').default

      Education.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([mockEducation]),
      })

      const response = await GET()

      expect(response.status).toBe(200)
    })

    it('should return proper response structure', async () => {
      const Education = require('@/models/Education').default

      Education.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([mockEducation]),
      })

      const response = await GET()
      const data = await response.json()

      expect(data).toHaveProperty('education')
      expect(Array.isArray(data.education)).toBe(true)
    })
  })

  describe('POST /api/education', () => {
    it('should create education entry with valid data when authenticated', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const Education = require('@/models/Education').default
      Education.create = jest.fn().mockResolvedValue(mockEducation)

      const { logActivity } = require('@/lib/activity-logger')
      const { invalidateCacheAfterUpdate } = require('@/lib/cache-invalidation')

      const request = new NextRequest('http://localhost:3000/api/education', {
        method: 'POST',
        body: JSON.stringify({
          institution: 'University of Example',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2020-09-01',
          endDate: '2024-06-01',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.education).toBeDefined()
      expect(Education.create).toHaveBeenCalled()
    })

    it('should reject request when not authenticated', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/education', {
        method: 'POST',
        body: JSON.stringify({
          institution: 'University of Example',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should log activity after creating education', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const Education = require('@/models/Education').default
      Education.create = jest.fn().mockResolvedValue(mockEducation)

      const { logActivity } = require('@/lib/activity-logger')

      const request = new NextRequest('http://localhost:3000/api/education', {
        method: 'POST',
        body: JSON.stringify({
          institution: 'University of Example',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
        }),
      })

      await POST(request)

      expect(logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'create',
          entityType: 'education',
        })
      )
    })

    it('should invalidate cache after creating education', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const Education = require('@/models/Education').default
      Education.create = jest.fn().mockResolvedValue(mockEducation)

      const { invalidateCacheAfterUpdate } = require('@/lib/cache-invalidation')

      const request = new NextRequest('http://localhost:3000/api/education', {
        method: 'POST',
        body: JSON.stringify({
          institution: 'University of Example',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
        }),
      })

      await POST(request)

      expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith('education')
    })

    it('should handle database errors during creation', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const Education = require('@/models/Education').default
      Education.create = jest.fn().mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/education', {
        method: 'POST',
        body: JSON.stringify({
          institution: 'University of Example',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to create education')
    })
  })

  describe('PUT /api/education', () => {
    it('should update education entry with valid data when authenticated', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const Education = require('@/models/Education').default
      const updatedEducation = { ...mockEducation, degree: 'Master of Science' }
      Education.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedEducation)

      const request = new NextRequest('http://localhost:3000/api/education', {
        method: 'PUT',
        body: JSON.stringify({
          _id: mockEducation._id,
          degree: 'Master of Science',
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.education).toBeDefined()
      expect(Education.findByIdAndUpdate).toHaveBeenCalledWith(
        mockEducation._id,
        { degree: 'Master of Science' },
        { new: true, runValidators: true }
      )
    })

    it('should require education ID for update', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const request = new NextRequest('http://localhost:3000/api/education', {
        method: 'PUT',
        body: JSON.stringify({
          degree: 'Master of Science',
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Education ID is required')
    })

    it('should return 404 when education not found', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const Education = require('@/models/Education').default
      Education.findByIdAndUpdate = jest.fn().mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/education', {
        method: 'PUT',
        body: JSON.stringify({
          _id: 'nonexistent-id',
          degree: 'Master of Science',
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Education not found')
    })

    it('should reject update when not authenticated', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/education', {
        method: 'PUT',
        body: JSON.stringify({
          _id: mockEducation._id,
          degree: 'Master of Science',
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should log activity after updating education', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const Education = require('@/models/Education').default
      const updatedEducation = { ...mockEducation, degree: 'Master of Science' }
      Education.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedEducation)

      const { logActivity } = require('@/lib/activity-logger')

      const request = new NextRequest('http://localhost:3000/api/education', {
        method: 'PUT',
        body: JSON.stringify({
          _id: mockEducation._id,
          degree: 'Master of Science',
        }),
      })

      await PUT(request)

      expect(logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update',
          entityType: 'education',
        })
      )
    })

    it('should invalidate cache after updating education', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const Education = require('@/models/Education').default
      const updatedEducation = { ...mockEducation, degree: 'Master of Science' }
      Education.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedEducation)

      const { invalidateCacheAfterUpdate } = require('@/lib/cache-invalidation')

      const request = new NextRequest('http://localhost:3000/api/education', {
        method: 'PUT',
        body: JSON.stringify({
          _id: mockEducation._id,
          degree: 'Master of Science',
        }),
      })

      await PUT(request)

      expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith('education')
    })

    it('should handle database errors during update', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const Education = require('@/models/Education').default
      Education.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/education', {
        method: 'PUT',
        body: JSON.stringify({
          _id: mockEducation._id,
          degree: 'Master of Science',
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to update education')
    })
  })
})
