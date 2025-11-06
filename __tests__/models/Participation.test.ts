/**
 * @jest-environment node
 */

import Participation from '@/models/Participation'
import { connectToMockDB, closeMockDB, clearMockDB } from '../setup/mongodb-handler'

describe('Participation Model', () => {
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
    it('creates a valid participation with required fields', () => {
      const validData = {
        title: 'Open Source Contributor',
        organization: 'React Team',
        role: 'Contributor',
        startDate: new Date('2023-01-01'),
      }

      const participation = new Participation(validData)
      const validation = participation.validateSync()

      expect(validation).toBeUndefined()
      expect(participation.title).toBe('Open Source Contributor')
      expect(participation.organization).toBe('React Team')
      expect(participation.role).toBe('Contributor')
    })

    it('requires title field', () => {
      const invalidData = {
        organization: 'Test Org',
        role: 'Participant',
        startDate: new Date('2023-01-01'),
      }

      const participation = new Participation(invalidData)
      const validation = participation.validateSync()

      expect(validation).toBeDefined()
      expect(validation?.errors.title).toBeDefined()
    })

    it('requires organization field', () => {
      const invalidData = {
        title: 'Test Activity',
        role: 'Participant',
        startDate: new Date('2023-01-01'),
      }

      const participation = new Participation(invalidData)
      const validation = participation.validateSync()

      expect(validation).toBeDefined()
      expect(validation?.errors.organization).toBeDefined()
    })

    it('requires role field', () => {
      const invalidData = {
        title: 'Test Activity',
        organization: 'Test Org',
        startDate: new Date('2023-01-01'),
      }

      const participation = new Participation(invalidData)
      const validation = participation.validateSync()

      expect(validation).toBeDefined()
      expect(validation?.errors.role).toBeDefined()
    })

    it('requires startDate field', () => {
      const invalidData = {
        title: 'Test Activity',
        organization: 'Test Org',
        role: 'Participant',
      }

      const participation = new Participation(invalidData)
      const validation = participation.validateSync()

      expect(validation).toBeDefined()
      expect(validation?.errors.startDate).toBeDefined()
    })

    it('accepts optional endDate field', () => {
      const validData = {
        title: 'Test Activity',
        organization: 'Test Org',
        role: 'Participant',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      }

      const participation = new Participation(validData)
      const validation = participation.validateSync()

      expect(validation).toBeUndefined()
      expect(participation.endDate).toEqual(new Date('2023-12-31'))
    })

    it('accepts optional current field with default false', () => {
      const validData = {
        title: 'Test Activity',
        organization: 'Test Org',
        role: 'Participant',
        startDate: new Date('2023-01-01'),
      }

      const participation = new Participation(validData)

      expect(participation.current).toBe(false)
    })

    it('accepts optional location field', () => {
      const validData = {
        title: 'Community Organizer',
        organization: 'Tech Meetup',
        role: 'Organizer',
        startDate: new Date('2023-01-01'),
        location: 'New York, NY',
      }

      const participation = new Participation(validData)
      const validation = participation.validateSync()

      expect(validation).toBeUndefined()
      expect(participation.location).toBe('New York, NY')
    })

    it('accepts optional description field', () => {
      const validData = {
        title: 'Hackathon Participant',
        organization: 'TechCon 2023',
        role: 'Developer',
        startDate: new Date('2023-06-01'),
        description: 'Built innovative web application',
      }

      const participation = new Participation(validData)
      const validation = participation.validateSync()

      expect(validation).toBeUndefined()
      expect(participation.description).toBe('Built innovative web application')
    })

    it('accepts optional impact field', () => {
      const validData = {
        title: 'Mentorship Program',
        organization: 'Code Academy',
        role: 'Mentor',
        startDate: new Date('2023-01-01'),
        impact: 'Mentored 20+ students',
      }

      const participation = new Participation(validData)
      const validation = participation.validateSync()

      expect(validation).toBeUndefined()
      expect(participation.impact).toBe('Mentored 20+ students')
    })

    it('accepts array of images', () => {
      const validData = {
        title: 'Conference Speaker',
        organization: 'DevConf 2023',
        role: 'Speaker',
        startDate: new Date('2023-05-01'),
        images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      }

      const participation = new Participation(validData)
      const validation = participation.validateSync()

      expect(validation).toBeUndefined()
      expect(participation.images).toHaveLength(2)
      expect(participation.images).toContain('https://example.com/img1.jpg')
    })

    it('accepts optional order field with default 0', () => {
      const validData = {
        title: 'Test Activity',
        organization: 'Test Org',
        role: 'Participant',
        startDate: new Date('2023-01-01'),
      }

      const participation = new Participation(validData)

      expect(participation.order).toBe(0)
    })

    it('accepts custom order value', () => {
      const validData = {
        title: 'Test Activity',
        organization: 'Test Org',
        role: 'Participant',
        startDate: new Date('2023-01-01'),
        order: 3,
      }

      const participation = new Participation(validData)

      expect(participation.order).toBe(3)
    })
  })

  describe('Data Types', () => {
    it('accepts Date objects for dates', () => {
      const validData = {
        title: 'Test Activity',
        organization: 'Test Org',
        role: 'Participant',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      }

      const participation = new Participation(validData)

      expect(participation.startDate).toBeInstanceOf(Date)
      expect(participation.endDate).toBeInstanceOf(Date)
    })

    it('accepts boolean for current field', () => {
      const validData = {
        title: 'Test Activity',
        organization: 'Test Org',
        role: 'Participant',
        startDate: new Date('2023-01-01'),
        current: true,
      }

      const participation = new Participation(validData)

      expect(typeof participation.current).toBe('boolean')
      expect(participation.current).toBe(true)
    })

    it('accepts number for order field', () => {
      const validData = {
        title: 'Test Activity',
        organization: 'Test Org',
        role: 'Participant',
        startDate: new Date('2023-01-01'),
        order: 5,
      }

      const participation = new Participation(validData)

      expect(typeof participation.order).toBe('number')
      expect(participation.order).toBe(5)
    })

    it('accepts empty images array', () => {
      const validData = {
        title: 'Test Activity',
        organization: 'Test Org',
        role: 'Participant',
        startDate: new Date('2023-01-01'),
        images: [],
      }

      const participation = new Participation(validData)

      expect(Array.isArray(participation.images)).toBe(true)
      expect(participation.images).toHaveLength(0)
    })
  })

  describe('Timestamps', () => {
    it('includes timestamps', () => {
      const validData = {
        title: 'Test Activity',
        organization: 'Test Org',
        role: 'Participant',
        startDate: new Date('2023-01-01'),
      }

      const participation = new Participation(validData)

      expect(participation.schema.options.timestamps).toBe(true)
    })
  })

  describe('Indexes', () => {
    it('has index on order and startDate', () => {
      const indexes = Participation.schema.indexes()
      const orderStartDateIndex = indexes.find(
        (index) => index[0].order === 1 && index[0].startDate === -1
      )

      expect(orderStartDateIndex).toBeDefined()
    })

    it('has index on startDate', () => {
      const indexes = Participation.schema.indexes()
      const startDateIndex = indexes.find(
        (index) => index[0].startDate === -1 && !index[0].order
      )

      expect(startDateIndex).toBeDefined()
    })

    it('has index on organization', () => {
      const indexes = Participation.schema.indexes()
      const organizationIndex = indexes.find((index) => index[0].organization === 1)

      expect(organizationIndex).toBeDefined()
    })
  })

  describe('Full Document Creation', () => {
    it('creates complete participation document with all fields', () => {
      const completeData = {
        title: 'Open Source Maintainer',
        organization: 'Apache Foundation',
        role: 'Core Contributor',
        startDate: new Date('2022-06-01'),
        endDate: new Date('2023-12-31'),
        current: false,
        location: 'Remote',
        description: 'Maintained critical infrastructure',
        impact: 'Improved performance by 40%',
        images: [
          'https://example.com/contribution1.jpg',
          'https://example.com/contribution2.jpg',
        ],
        order: 2,
      }

      const participation = new Participation(completeData)
      const validation = participation.validateSync()

      expect(validation).toBeUndefined()
      expect(participation.title).toBe('Open Source Maintainer')
      expect(participation.organization).toBe('Apache Foundation')
      expect(participation.role).toBe('Core Contributor')
      expect(participation.impact).toBe('Improved performance by 40%')
      expect(participation.images).toHaveLength(2)
    })
  })
})
