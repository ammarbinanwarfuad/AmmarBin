/**
 * @jest-environment node
 */

import Experience from '@/models/Experience'
import { connectToMockDB, closeMockDB, clearMockDB } from '../setup/mongodb-handler'

describe('Experience Model', () => {
  beforeAll(async () => {
    await connectToMockDB()
  })

  afterAll(async () => {
    await closeMockDB()
  })

  afterEach(async () => {
    await clearMockDB()
  })

  describe('Schema Validation', () => {
    it('creates a valid experience with required fields', () => {
      const validData = {
        company: 'Test Company',
        role: 'Senior Developer',
        startDate: new Date('2023-01-01'),
        current: false,
      }

      const experience = new Experience(validData)
      const validation = experience.validateSync()

      expect(validation).toBeUndefined()
      expect(experience.company).toBe('Test Company')
      expect(experience.role).toBe('Senior Developer')
    })

    it('requires company field', () => {
      const invalidData = {
        role: 'Developer',
        startDate: new Date('2023-01-01'),
      }

      const experience = new Experience(invalidData)
      const validation = experience.validateSync()

      expect(validation).toBeDefined()
      expect(validation?.errors.company).toBeDefined()
    })

    it('requires role field', () => {
      const invalidData = {
        company: 'Test Company',
        startDate: new Date('2023-01-01'),
      }

      const experience = new Experience(invalidData)
      const validation = experience.validateSync()

      expect(validation).toBeDefined()
      expect(validation?.errors.role).toBeDefined()
    })

    it('requires startDate field', () => {
      const invalidData = {
        company: 'Test Company',
        role: 'Developer',
      }

      const experience = new Experience(invalidData)
      const validation = experience.validateSync()

      expect(validation).toBeDefined()
      expect(validation?.errors.startDate).toBeDefined()
    })

    it('accepts optional endDate field', () => {
      const validData = {
        company: 'Test Company',
        role: 'Developer',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      }

      const experience = new Experience(validData)
      const validation = experience.validateSync()

      expect(validation).toBeUndefined()
      expect(experience.endDate).toEqual(new Date('2023-12-31'))
    })

    it('accepts optional current field with default false', () => {
      const validData = {
        company: 'Test Company',
        role: 'Developer',
        startDate: new Date('2023-01-01'),
      }

      const experience = new Experience(validData)

      expect(experience.current).toBe(false)
    })

    it('accepts optional location field', () => {
      const validData = {
        company: 'Test Company',
        role: 'Developer',
        startDate: new Date('2023-01-01'),
        location: 'New York, NY',
      }

      const experience = new Experience(validData)
      const validation = experience.validateSync()

      expect(validation).toBeUndefined()
      expect(experience.location).toBe('New York, NY')
    })

    it('accepts optional description field', () => {
      const validData = {
        company: 'Test Company',
        role: 'Developer',
        startDate: new Date('2023-01-01'),
        description: 'Led development of web applications',
      }

      const experience = new Experience(validData)
      const validation = experience.validateSync()

      expect(validation).toBeUndefined()
      expect(experience.description).toBe('Led development of web applications')
    })

    it('accepts array of responsibilities', () => {
      const validData = {
        company: 'Test Company',
        role: 'Developer',
        startDate: new Date('2023-01-01'),
        responsibilities: ['Developed features', 'Code reviews', 'Mentoring'],
      }

      const experience = new Experience(validData)
      const validation = experience.validateSync()

      expect(validation).toBeUndefined()
      expect(experience.responsibilities).toHaveLength(3)
      expect(experience.responsibilities).toContain('Developed features')
    })

    it('accepts array of skills', () => {
      const validData = {
        company: 'Test Company',
        role: 'Developer',
        startDate: new Date('2023-01-01'),
        skills: ['React', 'Node.js', 'TypeScript'],
      }

      const experience = new Experience(validData)
      const validation = experience.validateSync()

      expect(validation).toBeUndefined()
      expect(experience.skills).toHaveLength(3)
      expect(experience.skills).toContain('React')
    })

    it('accepts optional order field with default 0', () => {
      const validData = {
        company: 'Test Company',
        role: 'Developer',
        startDate: new Date('2023-01-01'),
      }

      const experience = new Experience(validData)

      expect(experience.order).toBe(0)
    })

    it('accepts custom order value', () => {
      const validData = {
        company: 'Test Company',
        role: 'Developer',
        startDate: new Date('2023-01-01'),
        order: 5,
      }

      const experience = new Experience(validData)

      expect(experience.order).toBe(5)
    })
  })

  describe('Data Types', () => {
    it('accepts Date objects for dates', () => {
      const validData = {
        company: 'Test Company',
        role: 'Developer',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      }

      const experience = new Experience(validData)

      expect(experience.startDate).toBeInstanceOf(Date)
      expect(experience.endDate).toBeInstanceOf(Date)
    })

    it('accepts boolean for current field', () => {
      const validData = {
        company: 'Test Company',
        role: 'Developer',
        startDate: new Date('2023-01-01'),
        current: true,
      }

      const experience = new Experience(validData)

      expect(typeof experience.current).toBe('boolean')
      expect(experience.current).toBe(true)
    })

    it('accepts number for order field', () => {
      const validData = {
        company: 'Test Company',
        role: 'Developer',
        startDate: new Date('2023-01-01'),
        order: 10,
      }

      const experience = new Experience(validData)

      expect(typeof experience.order).toBe('number')
      expect(experience.order).toBe(10)
    })
  })

  describe('Timestamps', () => {
    it('includes timestamps', () => {
      const validData = {
        company: 'Test Company',
        role: 'Developer',
        startDate: new Date('2023-01-01'),
      }

      const experience = new Experience(validData)

      expect(experience.schema.options.timestamps).toBe(true)
    })
  })

  describe('Indexes', () => {
    it('has index on order and startDate', () => {
      const indexes = Experience.schema.indexes()
      const orderStartDateIndex = indexes.find(
        (index) => index[0].order === 1 && index[0].startDate === -1
      )

      expect(orderStartDateIndex).toBeDefined()
    })

    it('has index on startDate', () => {
      const indexes = Experience.schema.indexes()
      const startDateIndex = indexes.find((index) => index[0].startDate === -1 && !index[0].order)

      expect(startDateIndex).toBeDefined()
    })

    it('has index on company', () => {
      const indexes = Experience.schema.indexes()
      const companyIndex = indexes.find((index) => index[0].company === 1)

      expect(companyIndex).toBeDefined()
    })
  })

  describe('Full Document Creation', () => {
    it('creates complete experience document with all fields', () => {
      const completeData = {
        company: 'Tech Corp',
        companyLogo: 'https://example.com/logo.png',
        role: 'Senior Full Stack Developer',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31'),
        current: false,
        location: 'San Francisco, CA',
        description: 'Led development team of 5 engineers',
        responsibilities: [
          'Architected microservices',
          'Mentored junior developers',
          'Conducted code reviews',
        ],
        skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
        order: 1,
      }

      const experience = new Experience(completeData)
      const validation = experience.validateSync()

      expect(validation).toBeUndefined()
      expect(experience.company).toBe('Tech Corp')
      expect(experience.role).toBe('Senior Full Stack Developer')
      expect(experience.responsibilities).toHaveLength(3)
      expect(experience.skills).toHaveLength(4)
    })
  })
})
