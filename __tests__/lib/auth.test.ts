/**
 * @jest-environment node
 */

import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit'

// Mock dependencies
jest.mock('bcryptjs')
jest.mock('@/lib/db')
jest.mock('@/models/User')
jest.mock('@/lib/rate-limit')

describe('Auth Utility', () => {
  const mockUser = {
    _id: 'user123',
    email: 'admin@example.com',
    username: 'Admin',
    password: 'hashed_password123',
    role: 'admin',
    loginAttempts: 0,
    lockUntil: undefined,
    lastLogin: undefined,
    lastLoginIp: undefined,
    save: jest.fn()
  }

  const validCredentials = {
    email: 'admin@example.com',
    password: 'correct_password'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)
    ;(checkRateLimit as jest.Mock).mockReturnValue({
      allowed: true,
      remaining: 5
    })
  })

  describe('authOptions configuration', () => {
    it('should have CredentialsProvider configured', () => {
      expect(authOptions.providers).toHaveLength(1)
      expect(authOptions.providers[0].name).toBe('Credentials')
    })

    it('should have custom sign-in page', () => {
      expect(authOptions.pages?.signIn).toBe('/admin/login')
    })

    it('should use JWT strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt')
    })

    it('should have 2-hour session max age', () => {
      expect(authOptions.session?.maxAge).toBe(2 * 60 * 60)
    })
  })

  describe('authorize - Successful Authentication', () => {
    it('should authenticate user with valid credentials', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const provider = authOptions.providers[0] as any
      const result = await provider.authorize(validCredentials, {})

      expect(connectDB).toHaveBeenCalled()
      expect(User.findOne).toHaveBeenCalledWith({ email: validCredentials.email })
      expect(bcrypt.compare).toHaveBeenCalledWith(
        validCredentials.password,
        mockUser.password
      )
      expect(result).toEqual({
        id: mockUser._id.toString(),
        email: mockUser.email,
        name: mockUser.username,
        role: mockUser.role
      })
    })

    it('should reset login attempts on successful login', async () => {
      const userWithAttempts = { ...mockUser, loginAttempts: 3 }
      ;(User.findOne as jest.Mock).mockResolvedValue(userWithAttempts)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const provider = authOptions.providers[0] as any
      await provider.authorize(validCredentials, {})

      expect(userWithAttempts.loginAttempts).toBe(0)
      expect(userWithAttempts.lockUntil).toBeUndefined()
      expect(userWithAttempts.save).toHaveBeenCalled()
    })

    it('should update lastLogin timestamp', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const provider = authOptions.providers[0] as any
      await provider.authorize(validCredentials, {})

      expect(mockUser.lastLogin).toBeInstanceOf(Date)
      expect(mockUser.save).toHaveBeenCalled()
    })

    it('should capture IP address from x-forwarded-for header', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const provider = authOptions.providers[0] as any
      const req = {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1'
        }
      }
      await provider.authorize(validCredentials, req)

      expect(mockUser.lastLoginIp).toBe('192.168.1.1')
    })

    it('should reset rate limit on successful login', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const provider = authOptions.providers[0] as any
      await provider.authorize(validCredentials, {})

      expect(resetRateLimit).toHaveBeenCalledWith(validCredentials.email)
    })
  })

  describe('authorize - Failed Authentication', () => {
    it('should reject missing email', async () => {
      const provider = authOptions.providers[0] as any
      
      await expect(
        provider.authorize({ password: 'test' }, {})
      ).rejects.toThrow('Invalid credentials')
    })

    it('should reject missing password', async () => {
      const provider = authOptions.providers[0] as any
      
      await expect(
        provider.authorize({ email: 'test@example.com' }, {})
      ).rejects.toThrow('Invalid credentials')
    })

    it('should reject non-existent user', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValue(null)

      const provider = authOptions.providers[0] as any
      
      await expect(
        provider.authorize(validCredentials, {})
      ).rejects.toThrow('Invalid credentials')
    })

    it('should reject user without password', async () => {
      const userWithoutPassword = { ...mockUser, password: undefined }
      ;(User.findOne as jest.Mock).mockResolvedValue(userWithoutPassword)

      const provider = authOptions.providers[0] as any
      
      await expect(
        provider.authorize(validCredentials, {})
      ).rejects.toThrow('Invalid credentials')
    })

    it('should reject incorrect password', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const provider = authOptions.providers[0] as any
      
      await expect(
        provider.authorize(validCredentials, {})
      ).rejects.toThrow('Invalid credentials')
    })

    it('should increment login attempts on wrong password', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const provider = authOptions.providers[0] as any
      
      try {
        await provider.authorize(validCredentials, {})
      } catch (error) {
        // Expected to throw
      }

      expect(mockUser.loginAttempts).toBe(1)
      expect(mockUser.save).toHaveBeenCalled()
    })
  })

  describe('authorize - Account Locking', () => {
    it('should lock account after max attempts', async () => {
      const userWithMaxAttempts = { ...mockUser, loginAttempts: 4 }
      ;(User.findOne as jest.Mock).mockResolvedValue(userWithMaxAttempts)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const provider = authOptions.providers[0] as any
      
      try {
        await provider.authorize(validCredentials, {})
      } catch (error) {
        // Expected to throw
      }

      expect(userWithMaxAttempts.loginAttempts).toBe(5)
      expect(userWithMaxAttempts.lockUntil).toBeInstanceOf(Date)
      expect(userWithMaxAttempts.save).toHaveBeenCalled()
    })

    it('should reject login for locked account', async () => {
      const lockedUser = {
        ...mockUser,
        lockUntil: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
      }
      ;(User.findOne as jest.Mock).mockResolvedValue(lockedUser)

      const provider = authOptions.providers[0] as any
      
      await expect(
        provider.authorize(validCredentials, {})
      ).rejects.toThrow(/Account is locked/)
    })

    it('should allow login after lock expires', async () => {
      const expiredLockUser = {
        ...mockUser,
        lockUntil: new Date(Date.now() - 1000) // 1 second ago
      }
      ;(User.findOne as jest.Mock).mockResolvedValue(expiredLockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const provider = authOptions.providers[0] as any
      const result = await provider.authorize(validCredentials, {})

      expect(result).toBeDefined()
      expect(result.email).toBe(mockUser.email)
    })
  })

  describe('authorize - Rate Limiting', () => {
    it('should check rate limit before authentication', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const provider = authOptions.providers[0] as any
      await provider.authorize(validCredentials, {})

      expect(checkRateLimit).toHaveBeenCalledWith(
        validCredentials.email,
        expect.objectContaining({
          maxAttempts: 5,
          windowMs: 15 * 60 * 1000,
          lockoutDurationMs: 5 * 60 * 1000
        })
      )
    })

    it('should reject when rate limit exceeded', async () => {
      ;(checkRateLimit as jest.Mock).mockReturnValue({
        allowed: false,
        lockedUntil: new Date(Date.now() + 5 * 60 * 1000)
      })

      const provider = authOptions.providers[0] as any
      
      await expect(
        provider.authorize(validCredentials, {})
      ).rejects.toThrow(/Too many login attempts/)
    })
  })

  describe('authorize - Database Errors', () => {
    it('should handle database connection failures', async () => {
      ;(connectDB as jest.Mock).mockRejectedValue(new Error('Connection failed'))

      const provider = authOptions.providers[0] as any
      
      await expect(
        provider.authorize(validCredentials, {})
      ).rejects.toThrow(/Database connection failed/)
    })

    it('should handle network errors with user-friendly message', async () => {
      ;(connectDB as jest.Mock).mockRejectedValue(new Error('network timeout'))

      const provider = authOptions.providers[0] as any
      
      await expect(
        provider.authorize(validCredentials, {})
      ).rejects.toThrow(/Unable to connect to database/)
    })

    it('should handle database user query errors', async () => {
      ;(User.findOne as jest.Mock).mockRejectedValue(new Error('Query failed'))

      const provider = authOptions.providers[0] as any
      
      await expect(
        provider.authorize(validCredentials, {})
      ).rejects.toThrow()
    })
  })

  describe('JWT callback', () => {
    it('should add user data to token on sign in', async () => {
      const token = { sub: 'user123' }
      const user = {
        id: 'user123',
        email: 'admin@example.com',
        name: 'Admin',
        role: 'admin'
      }

      const result = await authOptions.callbacks!.jwt!({ token, user } as any)

      expect(result.id).toBe(user.id)
      expect(result.email).toBe(user.email)
      expect(result.role).toBe(user.role)
    })

    it('should preserve token when no user data', async () => {
      const token = {
        sub: 'user123',
        id: 'user123',
        email: 'admin@example.com',
        role: 'admin'
      }

      const result = await authOptions.callbacks!.jwt!({ token } as any)

      expect(result).toEqual(token)
    })
  })

  describe('Session callback', () => {
    it('should add user data from token to session', async () => {
      const session = {
        user: {
          name: 'Admin'
        },
        expires: '2025-12-31'
      }
      const token = {
        id: 'user123',
        email: 'admin@example.com',
        role: 'admin'
      }

      const result = await authOptions.callbacks!.session!({ 
        session, 
        token 
      } as any)

      expect((result.user as any).id).toBe(token.id)
      expect((result.user as any).email).toBe(token.email)
      expect((result.user as any).role).toBe(token.role)
    })

    it('should handle missing session user gracefully', async () => {
      const session = { expires: '2025-12-31' }
      const token = { id: 'user123', email: 'test@example.com' }

      const result = await authOptions.callbacks!.session!({ 
        session: session as any, 
        token 
      } as any)

      expect(result).toBeDefined()
    })
  })
})
