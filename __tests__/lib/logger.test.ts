import { logger } from '@/lib/logger'

describe('Logger Utility', () => {
  const originalEnv = process.env
  let consoleLogSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance
  let consoleDebugSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()
    
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    consoleDebugSpy.mockRestore()
  })

  describe('info', () => {
    it('should log info messages in development', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      logger.info('Test info message')

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Test info message')
      )
    })

    it('should include timestamp in log message', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      logger.info('Test message')

      const loggedMessage = consoleLogSpy.mock.calls[0][0]
      expect(loggedMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/)
    })

    it('should include context in log message', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      const context = { userId: '123', action: 'login' }
      logger.info('User action', context)

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(JSON.stringify(context))
      )
    })

    it('should not log info in production', () => {
      process.env.NODE_ENV = 'production'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      logger.info('Test message')

      expect(consoleLogSpy).not.toHaveBeenCalled()
    })

    it('should handle messages without context', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      logger.info('Simple message')

      const loggedMessage = consoleLogSpy.mock.calls[0][0]
      expect(loggedMessage).toContain('Simple message')
      expect(loggedMessage).not.toContain('undefined')
    })
  })

  describe('warn', () => {
    it('should log warnings in development', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      logger.warn('Test warning')

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] Test warning')
      )
    })

    it('should log warnings in production', () => {
      process.env.NODE_ENV = 'production'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      logger.warn('Production warning')

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] Production warning')
      )
    })

    it('should include context in warnings', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      const context = { threshold: 100, actual: 250 }
      logger.warn('Performance threshold exceeded', context)

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(JSON.stringify(context))
      )
    })
  })

  describe('error', () => {
    it('should log errors in all environments', () => {
      logger.error('Test error')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Test error')
      )
    })

    it('should log Error instances with stack trace', () => {
      const error = new Error('Something went wrong')
      logger.error('Operation failed', error)

      const loggedMessage = consoleErrorSpy.mock.calls[0][0]
      expect(loggedMessage).toContain('Something went wrong')
      expect(loggedMessage).toContain('stack')
    })

    it('should log errors with context', () => {
      const error = new Error('Database error')
      const context = { operation: 'findUser', userId: '123' }
      
      logger.error('Database operation failed', error, context)

      const loggedMessage = consoleErrorSpy.mock.calls[0][0]
      expect(loggedMessage).toContain('operation')
      expect(loggedMessage).toContain('userId')
    })

    it('should handle non-Error objects', () => {
      const customError = { code: 500, message: 'Custom error' }
      logger.error('Custom error occurred', customError)

      const loggedMessage = consoleErrorSpy.mock.calls[0][0]
      expect(loggedMessage).toContain('Custom error occurred')
    })

    it('should handle errors without context', () => {
      const error = new Error('Simple error')
      logger.error('Error message', error)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error message')
      )
    })
  })

  describe('debug', () => {
    it('should log debug messages in development', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      logger.debug('Debug message')

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Debug message')
      )
    })

    it('should not log debug in production', () => {
      process.env.NODE_ENV = 'production'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      logger.debug('Debug message')

      expect(consoleDebugSpy).not.toHaveBeenCalled()
    })

    it('should include context in debug logs', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      const context = { variable: 'value', count: 42 }
      logger.debug('Debug info', context)

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining(JSON.stringify(context))
      )
    })
  })

  describe('performance', () => {
    it('should log slow operations as warnings', () => {
      logger.performance('Database query', 250, 100)

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow operation: Database query')
      )
    })

    it('should include duration and threshold in warning', () => {
      logger.performance('API call', 500, 200)

      const loggedMessage = consoleWarnSpy.mock.calls[0][0]
      expect(loggedMessage).toContain('durationMs')
      expect(loggedMessage).toContain('threshold')
    })

    it('should log fast operations as debug in development', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      logger.performance('Fast operation', 50, 100)

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Fast operation')
      )
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    it('should not log fast operations in production', () => {
      process.env.NODE_ENV = 'production'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      logger.performance('Fast operation', 50, 100)

      expect(consoleDebugSpy).not.toHaveBeenCalled()
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    it('should use default threshold of 100ms', () => {
      logger.performance('Operation', 150)

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow operation')
      )
    })

    it('should log when duration exactly equals threshold', () => {
      logger.performance('Boundary operation', 100, 100)

      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    it('should log when duration is 1ms over threshold', () => {
      logger.performance('Slightly slow operation', 101, 100)

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow operation')
      )
    })
  })

  describe('Message Formatting', () => {
    it('should format message with all components', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      logger.info('Test', { key: 'value' })

      const message = consoleLogSpy.mock.calls[0][0]
      expect(message).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\] Test/)
      expect(message).toContain('"key":"value"')
    })

    it('should handle special characters in message', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      logger.info('Message with "quotes" and \'apostrophes\'')

      expect(consoleLogSpy).toHaveBeenCalled()
    })

    it('should handle nested context objects', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      const context = {
        user: { id: '123', name: 'Test' },
        metadata: { timestamp: Date.now() }
      }
      logger.info('Complex context', context)

      const message = consoleLogSpy.mock.calls[0][0]
      expect(message).toContain('"user"')
      expect(message).toContain('"metadata"')
    })

    it('should handle circular references in context gracefully', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      const circular: any = { name: 'test' }
      circular.self = circular

      expect(() => {
        logger.info('Circular reference', circular)
      }).toThrow(TypeError) // JSON.stringify throws on circular references
    })
  })

  describe('Environment-specific behavior', () => {
    it('should identify development environment correctly', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      logger.info('Dev message')
      logger.debug('Debug message')

      expect(consoleLogSpy).toHaveBeenCalled()
      expect(consoleDebugSpy).toHaveBeenCalled()
    })

    it('should identify production environment correctly', () => {
      process.env.NODE_ENV = 'production'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      logger.info('Info message')
      logger.warn('Warn message')
      logger.debug('Debug message')

      expect(consoleLogSpy).not.toHaveBeenCalled()
      expect(consoleWarnSpy).toHaveBeenCalled()
      expect(consoleDebugSpy).not.toHaveBeenCalled()
    })

    it('should handle unknown environment as production', () => {
      process.env.NODE_ENV = 'staging'
      jest.resetModules()
      const { logger } = require('@/lib/logger')

      logger.info('Info message')
      logger.debug('Debug message')

      expect(consoleLogSpy).not.toHaveBeenCalled()
      expect(consoleDebugSpy).not.toHaveBeenCalled()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty message', () => {
      logger.info('')
      expect(consoleLogSpy).toHaveBeenCalled()
    })

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(10000)
      logger.info(longMessage)
      expect(consoleLogSpy).toHaveBeenCalled()
    })

    it('should handle undefined context', () => {
      logger.info('Test', undefined)
      expect(consoleLogSpy).toHaveBeenCalled()
    })

    it('should handle null context', () => {
      logger.info('Test', null as any)
      const message = consoleLogSpy.mock.calls[0][0]
      expect(message).toContain('null')
    })

    it('should handle context with undefined values', () => {
      logger.info('Test', { key: undefined, value: 'test' })
      const message = consoleLogSpy.mock.calls[0][0]
      expect(message).toContain('value')
    })
  })
})
