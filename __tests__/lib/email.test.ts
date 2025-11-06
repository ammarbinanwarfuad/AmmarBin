import {
  sendEmail,
  sendContactNotification,
  sendContactConfirmation,
  EmailOptions
} from '@/lib/email'
import nodemailer from 'nodemailer'

// Mock nodemailer
jest.mock('nodemailer')

describe('Email Utility', () => {
  const originalEnv = process.env
  let mockSendMail: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockSendMail = jest.fn()
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail
    })

    process.env = {
      ...originalEnv,
      EMAIL_HOST: 'smtp.gmail.com',
      EMAIL_PORT: '587',
      EMAIL_USER: 'test@example.com',
      EMAIL_PASSWORD: 'test-app-password',
      EMAIL_FROM: 'noreply@example.com',
      ADMIN_EMAIL: 'admin@example.com'
    }
  })

  afterEach(() => {
    process.env = originalEnv
    jest.resetModules()
  })

  describe('Transporter Configuration', () => {
    it('should create transporter with correct SMTP settings', () => {
      jest.resetModules()
      require('@/lib/email')

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'test-app-password'
        }
      })
    })

    it('should use default port 587 when EMAIL_PORT not set', () => {
      delete process.env.EMAIL_PORT
      jest.resetModules()
      require('@/lib/email')

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 587
        })
      )
    })

    it('should not create transporter when email not configured', () => {
      delete process.env.EMAIL_HOST
      jest.resetModules()
      
      jest.clearAllMocks()
      require('@/lib/email')

      expect(nodemailer.createTransport).not.toHaveBeenCalled()
    })

    it('should not create transporter with placeholder password', () => {
      process.env.EMAIL_PASSWORD = 'your-app-specific-password'
      jest.resetModules()
      
      jest.clearAllMocks()
      require('@/lib/email')

      expect(nodemailer.createTransport).not.toHaveBeenCalled()
    })
  })

  describe('sendEmail', () => {
    const emailOptions: EmailOptions = {
      to: 'recipient@example.com',
      subject: 'Test Email',
      html: '<p>Test message</p>'
    }

    it('should send email successfully', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg-123' })
      jest.resetModules()
      const { sendEmail } = require('@/lib/email')

      const result = await sendEmail(emailOptions)

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: 'recipient@example.com',
        subject: 'Test Email',
        html: '<p>Test message</p>'
      })
      expect(result).toEqual({
        success: true,
        messageId: 'msg-123'
      })
    })

    it('should send email with text content', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg-456' })
      jest.resetModules()
      const { sendEmail } = require('@/lib/email')

      const textOptions: EmailOptions = {
        to: 'user@example.com',
        subject: 'Plain text email',
        text: 'This is plain text'
      }

      const result = await sendEmail(textOptions)

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'This is plain text'
        })
      )
      expect(result.success).toBe(true)
    })

    it('should send email with both text and html', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'msg-789' })
      jest.resetModules()
      const { sendEmail } = require('@/lib/email')

      const mixedOptions: EmailOptions = {
        to: 'user@example.com',
        subject: 'Mixed content',
        text: 'Plain text version',
        html: '<p>HTML version</p>'
      }

      await sendEmail(mixedOptions)

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Plain text version',
          html: '<p>HTML version</p>'
        })
      )
    })

    it('should handle email sending failure', async () => {
      const error = new Error('SMTP connection failed')
      mockSendMail.mockRejectedValue(error)
      jest.resetModules()
      const { sendEmail } = require('@/lib/email')

      const result = await sendEmail(emailOptions)

      expect(result).toEqual({
        success: false,
        error
      })
    })

    it('should return error when email not configured', async () => {
      delete process.env.EMAIL_HOST
      jest.resetModules()
      const { sendEmail } = require('@/lib/email')

      const result = await sendEmail(emailOptions)

      expect(result).toEqual({
        success: false,
        error: 'Email not configured'
      })
      expect(mockSendMail).not.toHaveBeenCalled()
    })

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Connection timeout')
      mockSendMail.mockRejectedValue(timeoutError)
      jest.resetModules()
      const { sendEmail } = require('@/lib/email')

      const result = await sendEmail(emailOptions)

      expect(result.success).toBe(false)
      expect(result.error).toBe(timeoutError)
    })

    it('should handle authentication errors', async () => {
      const authError = new Error('Invalid login credentials')
      mockSendMail.mockRejectedValue(authError)
      jest.resetModules()
      const { sendEmail } = require('@/lib/email')

      const result = await sendEmail(emailOptions)

      expect(result.success).toBe(false)
      expect(result.error).toBe(authError)
    })
  })

  describe('sendContactNotification', () => {
    const contactData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Project Inquiry',
      message: 'I would like to discuss a project with you.'
    }

    it('should send contact notification to admin', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'notif-123' })
      jest.resetModules()
      const { sendContactNotification } = require('@/lib/email')

      const result = await sendContactNotification(contactData)

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: 'admin@example.com',
        subject: 'New Contact: Project Inquiry',
        html: expect.stringContaining('New Contact Form Submission')
      })
      expect(result.success).toBe(true)
    })

    it('should include all contact data in email', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'notif-456' })
      jest.resetModules()
      const { sendContactNotification } = require('@/lib/email')

      await sendContactNotification(contactData)

      const sentHtml = mockSendMail.mock.calls[0][0].html
      expect(sentHtml).toContain('John Doe')
      expect(sentHtml).toContain('john@example.com')
      expect(sentHtml).toContain('Project Inquiry')
      expect(sentHtml).toContain('I would like to discuss a project with you.')
    })

    it('should handle missing subject field', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'notif-789' })
      jest.resetModules()
      const { sendContactNotification } = require('@/lib/email')

      const dataWithoutSubject = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        message: 'Hello!'
      }

      await sendContactNotification(dataWithoutSubject)

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'New Contact: No subject'
        })
      )
      const sentHtml = mockSendMail.mock.calls[0][0].html
      expect(sentHtml).toContain('No subject')
    })

    it('should fallback to EMAIL_USER if ADMIN_EMAIL not set', async () => {
      delete process.env.ADMIN_EMAIL
      mockSendMail.mockResolvedValue({ messageId: 'notif-fallback' })
      jest.resetModules()
      const { sendContactNotification } = require('@/lib/email')

      await sendContactNotification(contactData)

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com'
        })
      )
    })

    it('should handle HTML special characters in message', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'notif-special' })
      jest.resetModules()
      const { sendContactNotification } = require('@/lib/email')

      const dataWithSpecialChars = {
        ...contactData,
        message: 'Test <script>alert("xss")</script>'
      }

      await sendContactNotification(dataWithSpecialChars)

      const sentHtml = mockSendMail.mock.calls[0][0].html
      // Should contain the raw message (HTML escaping would be done by email client)
      expect(sentHtml).toContain('Test <script>alert("xss")</script>')
    })
  })

  describe('sendContactConfirmation', () => {
    it('should send confirmation email to user', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'confirm-123' })
      jest.resetModules()
      const { sendContactConfirmation } = require('@/lib/email')

      const result = await sendContactConfirmation('john@example.com', 'John Doe')

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: 'john@example.com',
        subject: 'Thank you for your message',
        html: expect.stringContaining('Thank you for contacting me!')
      })
      expect(result.success).toBe(true)
    })

    it('should personalize confirmation with user name', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'confirm-456' })
      jest.resetModules()
      const { sendContactConfirmation } = require('@/lib/email')

      await sendContactConfirmation('jane@example.com', 'Jane Smith')

      const sentHtml = mockSendMail.mock.calls[0][0].html
      expect(sentHtml).toContain('Hi Jane Smith,')
      expect(sentHtml).toContain("I've received your message")
      expect(sentHtml).toContain('Ammar Bin Anwar Fuad')
    })

    it('should handle confirmation sending failure', async () => {
      mockSendMail.mockRejectedValue(new Error('Send failed'))
      jest.resetModules()
      const { sendContactConfirmation } = require('@/lib/email')

      const result = await sendContactConfirmation('user@example.com', 'User')

      expect(result.success).toBe(false)
    })
  })

  describe('Email Templates', () => {
    it('should format notification email as HTML', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'template-123' })
      jest.resetModules()
      const { sendContactNotification } = require('@/lib/email')

      await sendContactNotification({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test message'
      })

      const sentHtml = mockSendMail.mock.calls[0][0].html
      expect(sentHtml).toContain('<h2>New Contact Form Submission</h2>')
      expect(sentHtml).toContain('<strong>Name:</strong>')
      expect(sentHtml).toContain('<strong>Email:</strong>')
      expect(sentHtml).toContain('<strong>Subject:</strong>')
      expect(sentHtml).toContain('<strong>Message:</strong>')
    })

    it('should format confirmation email as HTML', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'template-456' })
      jest.resetModules()
      const { sendContactConfirmation } = require('@/lib/email')

      await sendContactConfirmation('user@example.com', 'Test')

      const sentHtml = mockSendMail.mock.calls[0][0].html
      expect(sentHtml).toContain('<h2>Thank you for contacting me!</h2>')
      expect(sentHtml).toContain('<p>Hi Test,</p>')
      expect(sentHtml).toContain('Best regards,<br>Ammar Bin Anwar Fuad')
    })
  })

  describe('Error Handling', () => {
    it('should log email sent successfully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      mockSendMail.mockResolvedValue({ messageId: 'log-123' })
      jest.resetModules()
      const { sendEmail } = require('@/lib/email')

      await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: 'Test'
      })

      expect(consoleSpy).toHaveBeenCalledWith('Email sent:', 'log-123')
      consoleSpy.mockRestore()
    })

    it('should log error when email sending fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('SMTP error')
      mockSendMail.mockRejectedValue(error)
      jest.resetModules()
      const { sendEmail } = require('@/lib/email')

      await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: 'Test'
      })

      expect(consoleSpy).toHaveBeenCalledWith('Error sending email:', error)
      consoleSpy.mockRestore()
    })

    it('should log when email not configured', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      delete process.env.EMAIL_HOST
      jest.resetModules()
      const { sendEmail } = require('@/lib/email')

      await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: 'Test'
      })

      expect(consoleSpy).toHaveBeenCalledWith('Email not configured - skipping email send')
      consoleSpy.mockRestore()
    })
  })
})
