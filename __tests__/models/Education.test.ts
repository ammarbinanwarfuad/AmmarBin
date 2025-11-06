/**
 * @jest-environment node
 */

import mongoose from 'mongoose';
import Education from '@/models/Education';

describe('Education Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1/test-education-model');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Education.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid education entry with required fields', async () => {
      const educationData = {
        institution: 'Test University',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: new Date('2020-09-01'),
      };

      const education = new Education(educationData);
      const savedEducation = await education.save();

      expect(savedEducation._id).toBeDefined();
      expect(savedEducation.institution).toBe(educationData.institution);
      expect(savedEducation.degree).toBe(educationData.degree);
      expect(savedEducation.field).toBe(educationData.field);
      expect(savedEducation.startDate).toEqual(educationData.startDate);
      expect(savedEducation.current).toBe(false); // default value
      expect(savedEducation.order).toBe(0); // default value
    });

    it('should fail validation when institution is missing', async () => {
      const educationData = {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: new Date('2020-09-01'),
      };

      const education = new Education(educationData);
      await expect(education.save()).rejects.toThrow();
    });

    it('should fail validation when degree is missing', async () => {
      const educationData = {
        institution: 'Test University',
        field: 'Computer Science',
        startDate: new Date('2020-09-01'),
      };

      const education = new Education(educationData);
      await expect(education.save()).rejects.toThrow();
    });

    it('should fail validation when field is missing', async () => {
      const educationData = {
        institution: 'Test University',
        degree: 'Bachelor of Science',
        startDate: new Date('2020-09-01'),
      };

      const education = new Education(educationData);
      await expect(education.save()).rejects.toThrow();
    });

    it('should fail validation when startDate is missing', async () => {
      const educationData = {
        institution: 'Test University',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
      };

      const education = new Education(educationData);
      await expect(education.save()).rejects.toThrow();
    });
  });

  describe('Date Fields', () => {
    it('should save education with start and end dates', async () => {
      const educationData = {
        institution: 'Test University',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: new Date('2020-09-01'),
        endDate: new Date('2024-05-15'),
      };

      const education = new Education(educationData);
      const savedEducation = await education.save();

      expect(savedEducation.startDate).toEqual(educationData.startDate);
      expect(savedEducation.endDate).toEqual(educationData.endDate);
    });

    it('should allow endDate to be undefined for current education', async () => {
      const educationData = {
        institution: 'Test University',
        degree: 'Master of Science',
        field: 'AI',
        startDate: new Date('2024-09-01'),
        current: true,
      };

      const education = new Education(educationData);
      const savedEducation = await education.save();

      expect(savedEducation.endDate).toBeUndefined();
      expect(savedEducation.current).toBe(true);
    });
  });

  describe('Current Education Status', () => {
    it('should default current to false', async () => {
      const educationData = {
        institution: 'Past University',
        degree: 'Bachelor',
        field: 'CS',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2024-01-01'),
      };

      const education = new Education(educationData);
      const savedEducation = await education.save();

      expect(savedEducation.current).toBe(false);
    });

    it('should allow setting current to true', async () => {
      const educationData = {
        institution: 'Current University',
        degree: 'PhD',
        field: 'Machine Learning',
        startDate: new Date('2023-01-01'),
        current: true,
      };

      const education = new Education(educationData);
      const savedEducation = await education.save();

      expect(savedEducation.current).toBe(true);
    });
  });

  describe('Optional Fields', () => {
    it('should save without optional fields', async () => {
      const educationData = {
        institution: 'Minimal University',
        degree: 'BSc',
        field: 'Physics',
        startDate: new Date('2020-01-01'),
      };

      const education = new Education(educationData);
      const savedEducation = await education.save();

      expect(savedEducation.institutionLogo).toBeUndefined();
      expect(savedEducation.grade).toBeUndefined();
      expect(savedEducation.location).toBeUndefined();
      expect(savedEducation.description).toBeUndefined();
      expect(savedEducation.endDate).toBeUndefined();
    });

    it('should save with all optional fields', async () => {
      const educationData = {
        institution: 'Complete University',
        institutionLogo: 'https://example.com/logo.png',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: new Date('2020-09-01'),
        endDate: new Date('2024-05-01'),
        current: false,
        grade: '3.9 GPA',
        location: 'New York, USA',
        description: 'Focused on AI and Machine Learning',
        order: 1,
      };

      const education = new Education(educationData);
      const savedEducation = await education.save();

      expect(savedEducation.institutionLogo).toBe(educationData.institutionLogo);
      expect(savedEducation.grade).toBe(educationData.grade);
      expect(savedEducation.location).toBe(educationData.location);
      expect(savedEducation.description).toBe(educationData.description);
      expect(savedEducation.order).toBe(educationData.order);
    });
  });

  describe('Achievements Array', () => {
    it('should store achievements as array of strings', async () => {
      const educationData = {
        institution: 'Achievement University',
        degree: 'BSc',
        field: 'CS',
        startDate: new Date('2020-01-01'),
        achievements: [
          'Dean\'s List - All Semesters',
          'Best Project Award 2023',
          'Published Research Paper',
        ],
      };

      const education = new Education(educationData);
      const savedEducation = await education.save();

      expect(savedEducation.achievements).toEqual(educationData.achievements);
      expect(Array.isArray(savedEducation.achievements)).toBe(true);
      expect(savedEducation.achievements).toHaveLength(3);
    });

    it('should allow empty achievements array', async () => {
      const educationData = {
        institution: 'Test University',
        degree: 'BSc',
        field: 'Physics',
        startDate: new Date('2020-01-01'),
        achievements: [],
      };

      const education = new Education(educationData);
      const savedEducation = await education.save();

      expect(savedEducation.achievements).toEqual([]);
    });
  });

  describe('Order Field', () => {
    it('should default order to 0', async () => {
      const educationData = {
        institution: 'Test University',
        degree: 'BSc',
        field: 'CS',
        startDate: new Date('2020-01-01'),
      };

      const education = new Education(educationData);
      const savedEducation = await education.save();

      expect(savedEducation.order).toBe(0);
    });

    it('should allow custom order values', async () => {
      const education1 = new Education({
        institution: 'First University',
        degree: 'BSc',
        field: 'CS',
        startDate: new Date('2016-01-01'),
        order: 2,
      });

      const education2 = new Education({
        institution: 'Second University',
        degree: 'MSc',
        field: 'AI',
        startDate: new Date('2020-01-01'),
        order: 1,
      });

      const saved1 = await education1.save();
      const saved2 = await education2.save();

      expect(saved1.order).toBe(2);
      expect(saved2.order).toBe(1);
    });
  });

  describe('Timestamps', () => {
    it('should automatically add createdAt and updatedAt', async () => {
      const educationData = {
        institution: 'Test University',
        degree: 'BSc',
        field: 'CS',
        startDate: new Date('2020-01-01'),
      };

      const education = new Education(educationData);
      const savedEducation = await education.save();

      expect(savedEducation.createdAt).toBeInstanceOf(Date);
      expect(savedEducation.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const educationData = {
        institution: 'Test University',
        degree: 'BSc',
        field: 'CS',
        startDate: new Date('2020-01-01'),
      };

      const education = new Education(educationData);
      const savedEducation = await education.save();
      const initialUpdatedAt = savedEducation.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      savedEducation.grade = '4.0 GPA';
      const updatedEducation = await savedEducation.save();

      expect(updatedEducation.updatedAt!.getTime()).toBeGreaterThan(initialUpdatedAt!.getTime());
    });
  });

  describe('Complete Education Entry', () => {
    it('should save a complete education entry with all fields', async () => {
      const completeEducationData = {
        institution: 'Massachusetts Institute of Technology',
        institutionLogo: 'https://example.com/mit-logo.png',
        degree: 'Bachelor of Science',
        field: 'Computer Science and Engineering',
        startDate: new Date('2020-09-01'),
        endDate: new Date('2024-05-15'),
        current: false,
        grade: '4.0 GPA',
        location: 'Cambridge, MA, USA',
        description: 'Specialized in Artificial Intelligence and Machine Learning with focus on Deep Learning',
        achievements: [
          'Summa Cum Laude',
          'President\'s Scholar',
          'Best Undergraduate Thesis Award',
          'Published 3 research papers',
        ],
        order: 1,
      };

      const education = new Education(completeEducationData);
      const savedEducation = await education.save();

      expect(savedEducation.institution).toBe(completeEducationData.institution);
      expect(savedEducation.institutionLogo).toBe(completeEducationData.institutionLogo);
      expect(savedEducation.degree).toBe(completeEducationData.degree);
      expect(savedEducation.field).toBe(completeEducationData.field);
      expect(savedEducation.startDate).toEqual(completeEducationData.startDate);
      expect(savedEducation.endDate).toEqual(completeEducationData.endDate);
      expect(savedEducation.current).toBe(completeEducationData.current);
      expect(savedEducation.grade).toBe(completeEducationData.grade);
      expect(savedEducation.location).toBe(completeEducationData.location);
      expect(savedEducation.description).toBe(completeEducationData.description);
      expect(savedEducation.achievements).toEqual(completeEducationData.achievements);
      expect(savedEducation.order).toBe(completeEducationData.order);
    });
  });
});
