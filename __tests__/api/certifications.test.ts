/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET, POST, PUT } from '@/app/api/certifications/route'
import { connectDB } from '@/lib/db'
import Certificate from '@/models/Certificate'
import { getServerSession } from 'next-auth'

// Mock all dependencies
jest.mock('@/lib/db')
jest.mock('@/models/Certificate')
jest.mock('@/lib/cache-invalidation', () => ({
  invalidateCacheAfterUpdate: jest.fn(),
}))
jest.mock('next/cache', () => ({
  unstable_cache: (fn: any) => fn,
}))
jest.mock('next-auth')

const mockCertificate = {
  _id: '507f1f77bcf86cd799439011',
  title: 'AWS Certified Solutions Architect',
  issuer: 'Amazon Web Services',
  category: 'Cloud Computing',
  issueDate: '2024-01-15',
  expiryDate: '2027-01-15',
  credentialId: 'AWS-12345-XYZ',
  credentialUrl: 'https://aws.amazon.com/verify/12345',
  thumbnail: 'https://example.com/cert.jpg',
  description: 'Professional certification for AWS architecture',
  skills: ['AWS', 'Cloud', 'Architecture'],
  featured: true,
  published: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('Certifications API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/certifications', () => {
    it('should return all published certifications for unauthenticated users', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue(null)

      const Certificate = require('@/models/Certificate').default
      const mockCertList = [mockCertificate, { ...mockCertificate, _id: '2', published: true }]

      Certificate.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue(mockCertList),
      })

      Certificate.countDocuments = jest.fn().mockResolvedValue(2)
      Certificate.aggregate = jest.fn().mockResolvedValue([
        { _id: 'Cloud Computing', count: 1 },
      ])

      const request = new NextRequest('http://localhost:3000/api/certifications')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.certificates).toBeDefined()
      expect(data.stats).toBeDefined()
    })

    it('should return all certifications including unpublished for admin', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue({ user: { email: 'admin@example.com' } })

      const Certificate = require('@/models/Certificate').default
      const mockCertList = [
        mockCertificate,
        { ...mockCertificate, _id: '2', published: false },
      ]

      Certificate.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue(mockCertList),
      })

      Certificate.countDocuments = jest.fn().mockResolvedValue(2)
      Certificate.aggregate = jest.fn().mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/certifications')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.certificates).toBeDefined()
    })

    it('should filter certifications by category', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue(null)

      const Certificate = require('@/models/Certificate').default

      Certificate.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([mockCertificate]),
      })

      Certificate.countDocuments = jest.fn().mockResolvedValue(1)
      Certificate.aggregate = jest.fn().mockResolvedValue([])

      const request = new NextRequest(
        'http://localhost:3000/api/certifications?category=Cloud Computing'
      )
      const response = await GET(request)

      expect(response.status).toBe(200)
    })

    it('should filter featured certifications', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue(null)

      const Certificate = require('@/models/Certificate').default

      Certificate.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([mockCertificate]),
      })

      Certificate.countDocuments = jest.fn().mockResolvedValue(1)
      Certificate.aggregate = jest.fn().mockResolvedValue([])

      const request = new NextRequest(
        'http://localhost:3000/api/certifications?featured=true'
      )
      const response = await GET(request)

      expect(response.status).toBe(200)
    })

    it('should search certifications by title, issuer, or skills', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue(null)

      const Certificate = require('@/models/Certificate').default

      Certificate.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([mockCertificate]),
      })

      Certificate.countDocuments = jest.fn().mockResolvedValue(1)
      Certificate.aggregate = jest.fn().mockResolvedValue([])

      const request = new NextRequest(
        'http://localhost:3000/api/certifications?search=AWS'
      )
      const response = await GET(request)

      expect(response.status).toBe(200)
    })

    it('should return empty array when no certifications exist', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue(null)

      const Certificate = require('@/models/Certificate').default

      Certificate.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockResolvedValue([]),
      })

      Certificate.countDocuments = jest.fn().mockResolvedValue(0)
      Certificate.aggregate = jest.fn().mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/certifications')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.certificates).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      const { getServerSession } = require('next-auth')
      getServerSession.mockResolvedValue(null)

      const Certificate = require('@/models/Certificate').default

      Certificate.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        maxTimeMS: jest.fn().mockRejectedValue(new Error('Database error')),
      })

      const request = new NextRequest('http://localhost:3000/api/certifications')
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to fetch certificates')
    })
  })

  describe('POST /api/certifications', () => {
    it('should create certification with valid data', async () => {
      const Certificate = require('@/models/Certificate').default
      Certificate.create = jest.fn().mockResolvedValue(mockCertificate)

      const { invalidateCacheAfterUpdate } = require('@/lib/cache-invalidation')

      const request = new NextRequest('http://localhost:3000/api/certifications', {
        method: 'POST',
        body: JSON.stringify({
          title: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          category: 'Cloud Computing',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.certificate).toBeDefined()
      expect(Certificate.create).toHaveBeenCalled()
    })

    it('should invalidate cache after creating certification', async () => {
      const Certificate = require('@/models/Certificate').default
      Certificate.create = jest.fn().mockResolvedValue(mockCertificate)

      const { invalidateCacheAfterUpdate } = require('@/lib/cache-invalidation')

      const request = new NextRequest('http://localhost:3000/api/certifications', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test Cert' }),
      })

      await POST(request)

      expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith('certifications')
    })

    it('should handle database errors during creation', async () => {
      const Certificate = require('@/models/Certificate').default
      Certificate.create = jest.fn().mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/certifications', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test Cert' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to create certificate')
    })
  })

  describe('PUT /api/certifications', () => {
    it('should update certification with valid data', async () => {
      const Certificate = require('@/models/Certificate').default
      const updatedCert = { ...mockCertificate, title: 'Updated Title' }
      Certificate.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedCert)

      const request = new NextRequest('http://localhost:3000/api/certifications', {
        method: 'PUT',
        body: JSON.stringify({
          _id: mockCertificate._id,
          title: 'Updated Title',
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.certificate).toBeDefined()
      expect(Certificate.findByIdAndUpdate).toHaveBeenCalledWith(
        mockCertificate._id,
        { title: 'Updated Title' },
        { new: true, runValidators: true }
      )
    })

    it('should return 404 when certification not found', async () => {
      const Certificate = require('@/models/Certificate').default
      Certificate.findByIdAndUpdate = jest.fn().mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/certifications', {
        method: 'PUT',
        body: JSON.stringify({
          _id: 'nonexistent-id',
          title: 'Updated Title',
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Certificate not found')
    })

    it('should invalidate cache after updating certification', async () => {
      const Certificate = require('@/models/Certificate').default
      const updatedCert = { ...mockCertificate, title: 'Updated Title' }
      Certificate.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedCert)

      const { invalidateCacheAfterUpdate } = require('@/lib/cache-invalidation')

      const request = new NextRequest('http://localhost:3000/api/certifications', {
        method: 'PUT',
        body: JSON.stringify({
          _id: mockCertificate._id,
          title: 'Updated Title',
        }),
      })

      await PUT(request)

      expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith('certifications')
    })

    it('should handle database errors during update', async () => {
      const Certificate = require('@/models/Certificate').default
      Certificate.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/certifications', {
        method: 'PUT',
        body: JSON.stringify({
          _id: mockCertificate._id,
          title: 'Updated Title',
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to update certificate')
    })
  })
})
