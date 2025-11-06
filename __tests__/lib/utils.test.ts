import { cn, formatDate, calculateReadTime, slugify, truncate } from '@/lib/utils'

describe('Utils - cn (classnames)', () => {
  it('should merge class names correctly', () => {
    const result = cn('class1', 'class2')
    expect(result).toContain('class1')
    expect(result).toContain('class2')
  })

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'active', false && 'hidden')
    expect(result).toContain('base')
    expect(result).toContain('active')
    expect(result).not.toContain('hidden')
  })

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null)
    expect(result).toContain('base')
  })

  it('should override Tailwind classes correctly', () => {
    // Tailwind merge should override conflicting classes
    const result = cn('p-4', 'p-8')
    expect(result).toBe('p-8')
  })
})

describe('Utils - formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2025-11-25')
    const result = formatDate(date)
    expect(result).toContain('November')
    expect(result).toContain('25')
    expect(result).toContain('2025')
  })

  it('should handle string dates', () => {
    const result = formatDate('2025-11-25')
    expect(result).toContain('November')
  })
})

describe('Utils - calculateReadTime', () => {
  it('should calculate read time correctly', () => {
    const shortContent = 'This is a short test content.'
    expect(calculateReadTime(shortContent)).toBe(1)
  })

  it('should round up read time', () => {
    // 400 words at 200 words/min = 2 minutes
    const content = Array(400).fill('word').join(' ')
    expect(calculateReadTime(content)).toBe(2)
  })

  it('should handle empty content', () => {
    expect(calculateReadTime('')).toBe(0)
  })
})

describe('Utils - slugify', () => {
  it('should convert text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('should remove special characters', () => {
    expect(slugify('Hello! World?')).toBe('hello-world')
  })

  it('should handle multiple spaces', () => {
    expect(slugify('Hello    World')).toBe('hello-world')
  })

  it('should trim dashes', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world')
  })
})

describe('Utils - truncate', () => {
  it('should truncate long text', () => {
    const text = 'This is a very long text that needs to be truncated'
    const result = truncate(text, 20)
    expect(result).toBe('This is a very long ...')
    expect(result.length).toBe(23) // 20 chars + '...'
  })

  it('should not truncate short text', () => {
    const text = 'Short text'
    expect(truncate(text, 20)).toBe('Short text')
  })

  it('should handle exact length', () => {
    const text = 'Exactly twenty chars'
    expect(truncate(text, 20)).toBe('Exactly twenty chars')
  })
})
