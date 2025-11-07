// Mock lucide-react icons before importing component
jest.mock('lucide-react', () => ({
  Send: (props: any) => <svg data-testid="send-icon" {...props} />,
}))

import { render, screen, fireEvent, waitFor } from '../setup/test-utils'
import { ContactForm } from '@/components/ContactForm'
import { submitContactForm } from '@/app/actions/contact'
import toast from 'react-hot-toast'

// Mock dependencies
jest.mock('@/app/actions/contact', () => ({
  submitContactForm: jest.fn(),
}))

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('ContactForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all form fields', () => {
    render(<ContactForm />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  it('should show validation error when name is empty', async () => {
    render(<ContactForm />)

    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })
  })

  it('should show validation error when email is invalid', async () => {
    render(<ContactForm />)

    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it('should show validation error when message is empty', async () => {
    render(<ContactForm />)

    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/message is required/i)).toBeInTheDocument()
    })
  })

  it('should submit form with valid data', async () => {
    (submitContactForm as jest.Mock).mockResolvedValue({ success: true })

    render(<ContactForm />)

    // Fill in all required fields
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const messageInput = screen.getByLabelText(/message/i)

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(messageInput, { target: { value: 'Hello, this is a test message!' } })

    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(submitContactForm).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Hello, this is a test message!',
        })
      )
    })
  })

  it('should show success message on successful submission', async () => {
    (submitContactForm as jest.Mock).mockResolvedValue({ success: true })

    render(<ContactForm />)

    // Fill in form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining("Message sent successfully")
      )
    })
  })

  it('should show error message on submission failure', async () => {
    (submitContactForm as jest.Mock).mockResolvedValue({ 
      success: false, 
      error: 'Server error' 
    })

    render(<ContactForm />)

    // Fill in form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server error')
    })
  })

  it('should clear form after successful submission', async () => {
    (submitContactForm as jest.Mock).mockResolvedValue({ success: true })

    render(<ContactForm />)

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const messageInput = screen.getByLabelText(/message/i) as HTMLTextAreaElement

    // Fill in form
    fireEvent.change(nameInput, { target: { value: 'John' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(messageInput, { target: { value: 'Test message' } })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(nameInput.value).toBe('')
      expect(emailInput.value).toBe('')
      expect(messageInput.value).toBe('')
    })
  })

  it('should disable submit button while submitting', async () => {
    (submitContactForm as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    )

    render(<ContactForm />)

    // Fill in form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } })

    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)

    // Button should be disabled during submission
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(screen.getByText('Sending...')).toBeInTheDocument()
    })
  })

  it('should handle network errors gracefully', async () => {
    (submitContactForm as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<ContactForm />)

    // Fill in form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error')
    })
  })

  it('should include optional subject field in submission', async () => {
    (submitContactForm as jest.Mock).mockResolvedValue({ success: true })

    render(<ContactForm />)

    // Fill in all fields including subject
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Job Inquiry' } })
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } })

    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(submitContactForm).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Job Inquiry',
        })
      )
    })
  })
})
