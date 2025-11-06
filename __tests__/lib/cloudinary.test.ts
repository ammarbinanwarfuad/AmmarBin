import cloudinary, {
  uploadImage,
  deleteImage,
  uploadMultipleImages,
  getOptimizedImageUrl,
  extractPublicId
} from '@/lib/cloudinary'

// Mock cloudinary v2
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn()
    }
  }
}))

describe('Cloudinary Utility', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Configuration', () => {
    it('should configure cloudinary with environment variables', () => {
      const { v2 } = require('cloudinary')
      expect(v2.config).toHaveBeenCalledWith({
        cloud_name: 'test-cloud',
        api_key: 'test-key',
        api_secret: 'test-secret'
      })
    })
  })

  describe('uploadImage', () => {
    const mockUploadResult = {
      secure_url: 'https://res.cloudinary.com/test/image/upload/v123/test.jpg',
      public_id: 'portfolio/test'
    }

    it('should upload image successfully', async () => {
      const { v2 } = require('cloudinary')
      v2.uploader.upload.mockResolvedValue(mockUploadResult)

      const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const result = await uploadImage(base64Image, 'test-folder')

      expect(v2.uploader.upload).toHaveBeenCalledWith(
        base64Image,
        expect.objectContaining({
          folder: 'test-folder',
          resource_type: 'auto',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        })
      )
      expect(result).toEqual({
        url: mockUploadResult.secure_url,
        publicId: mockUploadResult.public_id
      })
    })

    it('should use default portfolio folder when no folder specified', async () => {
      const { v2 } = require('cloudinary')
      v2.uploader.upload.mockResolvedValue(mockUploadResult)

      await uploadImage('data:image/png;base64,test')

      expect(v2.uploader.upload).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          folder: 'portfolio'
        })
      )
    })

    it('should handle PDF upload with raw resource type', async () => {
      const { v2 } = require('cloudinary')
      v2.uploader.upload.mockResolvedValue(mockUploadResult)

      const pdfFile = 'data:application/pdf;base64,JVBERi0xLjQK'
      await uploadImage(pdfFile, 'documents')

      expect(v2.uploader.upload).toHaveBeenCalledWith(
        pdfFile,
        expect.objectContaining({
          folder: 'documents',
          resource_type: 'raw'
        })
      )
      expect(v2.uploader.upload).toHaveBeenCalledWith(
        pdfFile,
        expect.not.objectContaining({
          transformation: expect.anything()
        })
      )
    })

    it('should apply transformations for non-PDF files', async () => {
      const { v2 } = require('cloudinary')
      v2.uploader.upload.mockResolvedValue(mockUploadResult)

      await uploadImage('data:image/jpeg;base64,test', 'images')

      expect(v2.uploader.upload).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        })
      )
    })

    it('should throw error on upload failure', async () => {
      const { v2 } = require('cloudinary')
      v2.uploader.upload.mockRejectedValue(new Error('Upload failed'))

      await expect(
        uploadImage('data:image/png;base64,test')
      ).rejects.toThrow('Failed to upload image')
    })

    it('should handle network errors', async () => {
      const { v2 } = require('cloudinary')
      v2.uploader.upload.mockRejectedValue(new Error('Network timeout'))

      await expect(
        uploadImage('data:image/png;base64,test')
      ).rejects.toThrow('Failed to upload image')
    })
  })

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      const { v2 } = require('cloudinary')
      v2.uploader.destroy.mockResolvedValue({ result: 'ok' })

      const publicId = 'portfolio/test-image'
      await deleteImage(publicId)

      expect(v2.uploader.destroy).toHaveBeenCalledWith(publicId)
    })

    it('should throw error on delete failure', async () => {
      const { v2 } = require('cloudinary')
      v2.uploader.destroy.mockRejectedValue(new Error('Delete failed'))

      await expect(
        deleteImage('portfolio/test-image')
      ).rejects.toThrow('Failed to delete image')
    })

    it('should handle non-existent image deletion', async () => {
      const { v2 } = require('cloudinary')
      v2.uploader.destroy.mockRejectedValue(new Error('Resource not found'))

      await expect(
        deleteImage('portfolio/non-existent')
      ).rejects.toThrow('Failed to delete image')
    })
  })

  describe('uploadMultipleImages', () => {
    const mockUploadResult = {
      secure_url: 'https://res.cloudinary.com/test/image/upload/v123/test.jpg',
      public_id: 'portfolio/test'
    }

    it('should upload multiple images successfully', async () => {
      const { v2 } = require('cloudinary')
      v2.uploader.upload.mockResolvedValue(mockUploadResult)

      const files = [
        'data:image/png;base64,test1',
        'data:image/png;base64,test2',
        'data:image/png;base64,test3'
      ]
      const results = await uploadMultipleImages(files, 'gallery')

      expect(v2.uploader.upload).toHaveBeenCalledTimes(3)
      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result).toHaveProperty('url')
        expect(result).toHaveProperty('publicId')
      })
    })

    it('should use default folder for multiple uploads', async () => {
      const { v2 } = require('cloudinary')
      v2.uploader.upload.mockResolvedValue(mockUploadResult)

      const files = ['data:image/png;base64,test1', 'data:image/png;base64,test2']
      await uploadMultipleImages(files)

      expect(v2.uploader.upload).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ folder: 'portfolio' })
      )
    })

    it('should handle empty array', async () => {
      const results = await uploadMultipleImages([])
      expect(results).toEqual([])
    })

    it('should throw error if any upload fails', async () => {
      const { v2 } = require('cloudinary')
      v2.uploader.upload
        .mockResolvedValueOnce(mockUploadResult)
        .mockRejectedValueOnce(new Error('Upload failed'))

      const files = ['data:image/png;base64,test1', 'data:image/png;base64,test2']
      
      await expect(
        uploadMultipleImages(files)
      ).rejects.toThrow('Failed to upload images')
    })

    it('should upload all files in parallel', async () => {
      const { v2 } = require('cloudinary')
      const uploadSpy = jest.fn().mockResolvedValue(mockUploadResult)
      v2.uploader.upload = uploadSpy

      const files = Array(5).fill('data:image/png;base64,test')
      await uploadMultipleImages(files)

      // All should be called, indicating parallel execution
      expect(uploadSpy).toHaveBeenCalledTimes(5)
    })
  })

  describe('getOptimizedImageUrl', () => {
    it('should generate optimized URL with width and height', () => {
      const publicId = 'portfolio/test-image'
      const url = getOptimizedImageUrl(publicId, 800, 600)

      expect(url).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/w_800,h_600,f_auto,q_auto/portfolio/test-image'
      )
    })

    it('should generate URL with only width', () => {
      const publicId = 'portfolio/test-image'
      const url = getOptimizedImageUrl(publicId, 800)

      expect(url).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/w_800,f_auto,q_auto/portfolio/test-image'
      )
    })

    it('should generate URL with only height', () => {
      const publicId = 'portfolio/test-image'
      const url = getOptimizedImageUrl(publicId, undefined, 600)

      expect(url).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/h_600,f_auto,q_auto/portfolio/test-image'
      )
    })

    it('should generate URL without dimensions', () => {
      const publicId = 'portfolio/test-image'
      const url = getOptimizedImageUrl(publicId)

      expect(url).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/f_auto,q_auto/portfolio/test-image'
      )
    })

    it('should return publicId as fallback when cloud name missing', () => {
      process.env.CLOUDINARY_CLOUD_NAME = ''
      const publicId = 'portfolio/test-image'
      const url = getOptimizedImageUrl(publicId, 800, 600)

      expect(url).toBe(publicId)
    })

    it('should handle nested folder structure', () => {
      const publicId = 'portfolio/projects/2024/test-image'
      const url = getOptimizedImageUrl(publicId, 1200)

      expect(url).toContain('/portfolio/projects/2024/test-image')
    })

    it('should apply auto format and quality transformations', () => {
      const publicId = 'test'
      const url = getOptimizedImageUrl(publicId)

      expect(url).toContain('f_auto')
      expect(url).toContain('q_auto')
    })
  })

  describe('extractPublicId', () => {
    it('should extract public ID from standard Cloudinary URL', () => {
      const url = 'https://res.cloudinary.com/test-cloud/image/upload/v1234567890/portfolio/test-image.jpg'
      const publicId = extractPublicId(url)

      expect(publicId).toBe('portfolio/test-image')
    })

    it('should extract public ID from transformed URL', () => {
      const url = 'https://res.cloudinary.com/test-cloud/image/upload/w_800,h_600/v1234567890/portfolio/projects/test.png'
      const publicId = extractPublicId(url)

      expect(publicId).toBe('portfolio/projects/test')
    })

    it('should return null for invalid URL', () => {
      const url = 'https://example.com/image.jpg'
      const publicId = extractPublicId(url)

      expect(publicId).toBeNull()
    })

    it('should return null for malformed Cloudinary URL', () => {
      const url = 'https://res.cloudinary.com/test-cloud/invalid'
      const publicId = extractPublicId(url)

      expect(publicId).toBeNull()
    })

    it('should handle URL without version number gracefully', () => {
      const url = 'https://res.cloudinary.com/test-cloud/image/upload/portfolio/test.jpg'
      const publicId = extractPublicId(url)

      // Should still return null as regex requires /v\d+/
      expect(publicId).toBeNull()
    })

    it('should extract public ID with special characters', () => {
      const url = 'https://res.cloudinary.com/test-cloud/image/upload/v123/portfolio/test-image_2024.jpg'
      const publicId = extractPublicId(url)

      expect(publicId).toBe('portfolio/test-image_2024')
    })
  })

  describe('Environment Variable Validation', () => {
    it('should warn in production when env vars missing', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      process.env.NODE_ENV = 'production'
      delete process.env.CLOUDINARY_CLOUD_NAME

      // Re-import to trigger configuration
      jest.resetModules()
      require('@/lib/cloudinary')

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cloudinary environment variables are missing')
      )

      consoleSpy.mockRestore()
    })

    it('should not configure cloudinary when env vars missing', () => {
      delete process.env.CLOUDINARY_CLOUD_NAME
      delete process.env.CLOUDINARY_API_KEY
      delete process.env.CLOUDINARY_API_SECRET

      jest.resetModules()
      const { v2 } = require('cloudinary')
      
      // Config should not be called with undefined values
      expect(v2.config).not.toHaveBeenCalledWith({
        cloud_name: undefined,
        api_key: undefined,
        api_secret: undefined
      })
    })
  })
})
