/**
 * @jest-environment node
 */

import mongoose from 'mongoose';
import Skill from '@/models/Skill';

describe('Skill Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1/test-skill-model');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Skill.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid skill with required fields', async () => {
      const skillData = {
        name: 'TypeScript',
        category: 'Frontend',
        proficiency: 90,
      };

      const skill = new Skill(skillData);
      const savedSkill = await skill.save();

      expect(savedSkill._id).toBeDefined();
      expect(savedSkill.name).toBe(skillData.name);
      expect(savedSkill.category).toBe(skillData.category);
      expect(savedSkill.proficiency).toBe(skillData.proficiency);
      expect(savedSkill.order).toBe(0); // default value
    });

    it('should fail validation when name is missing', async () => {
      const skillData = {
        category: 'Frontend',
        proficiency: 90,
      };

      const skill = new Skill(skillData);
      await expect(skill.save()).rejects.toThrow();
    });

    it('should fail validation when category is missing', async () => {
      const skillData = {
        name: 'TypeScript',
        proficiency: 90,
      };

      const skill = new Skill(skillData);
      await expect(skill.save()).rejects.toThrow();
    });

    it('should fail validation when proficiency is missing', async () => {
      const skillData = {
        name: 'TypeScript',
        category: 'Frontend',
      };

      const skill = new Skill(skillData);
      await expect(skill.save()).rejects.toThrow();
    });
  });

  describe('Proficiency Validation', () => {
    it('should accept proficiency of 0', async () => {
      const skillData = {
        name: 'New Skill',
        category: 'Learning',
        proficiency: 0,
      };

      const skill = new Skill(skillData);
      const savedSkill = await skill.save();

      expect(savedSkill.proficiency).toBe(0);
    });

    it('should accept proficiency of 100', async () => {
      const skillData = {
        name: 'Expert Skill',
        category: 'Frontend',
        proficiency: 100,
      };

      const skill = new Skill(skillData);
      const savedSkill = await skill.save();

      expect(savedSkill.proficiency).toBe(100);
    });

    it('should reject proficiency less than 0', async () => {
      const skillData = {
        name: 'Invalid Skill',
        category: 'Frontend',
        proficiency: -10,
      };

      const skill = new Skill(skillData);
      await expect(skill.save()).rejects.toThrow();
    });

    it('should reject proficiency greater than 100', async () => {
      const skillData = {
        name: 'Invalid Skill',
        category: 'Frontend',
        proficiency: 150,
      };

      const skill = new Skill(skillData);
      await expect(skill.save()).rejects.toThrow();
    });

    it('should accept proficiency values between 0 and 100', async () => {
      const testCases = [25, 50, 75, 33, 67, 99];

      for (const proficiency of testCases) {
        const skill = new Skill({
          name: `Skill ${proficiency}`,
          category: 'Test',
          proficiency,
        });

        const savedSkill = await skill.save();
        expect(savedSkill.proficiency).toBe(proficiency);
      }
    });
  });

  describe('Optional Fields', () => {
    it('should save skill without icon field', async () => {
      const skillData = {
        name: 'TypeScript',
        category: 'Frontend',
        proficiency: 90,
      };

      const skill = new Skill(skillData);
      const savedSkill = await skill.save();

      expect(savedSkill.icon).toBeUndefined();
    });

    it('should save skill with icon field', async () => {
      const skillData = {
        name: 'TypeScript',
        category: 'Frontend',
        proficiency: 90,
        icon: 'typescript-icon.svg',
      };

      const skill = new Skill(skillData);
      const savedSkill = await skill.save();

      expect(savedSkill.icon).toBe('typescript-icon.svg');
    });

    it('should set default order to 0', async () => {
      const skillData = {
        name: 'TypeScript',
        category: 'Frontend',
        proficiency: 90,
      };

      const skill = new Skill(skillData);
      const savedSkill = await skill.save();

      expect(savedSkill.order).toBe(0);
    });

    it('should allow custom order value', async () => {
      const skillData = {
        name: 'TypeScript',
        category: 'Frontend',
        proficiency: 90,
        order: 5,
      };

      const skill = new Skill(skillData);
      const savedSkill = await skill.save();

      expect(savedSkill.order).toBe(5);
    });
  });

  describe('Timestamps', () => {
    it('should automatically add createdAt and updatedAt', async () => {
      const skillData = {
        name: 'TypeScript',
        category: 'Frontend',
        proficiency: 90,
      };

      const skill = new Skill(skillData);
      const savedSkill = await skill.save();

      expect(savedSkill.createdAt).toBeInstanceOf(Date);
      expect(savedSkill.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const skillData = {
        name: 'TypeScript',
        category: 'Frontend',
        proficiency: 90,
      };

      const skill = new Skill(skillData);
      const savedSkill = await skill.save();
      const initialUpdatedAt = savedSkill.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      savedSkill.proficiency = 95;
      const updatedSkill = await savedSkill.save();

      expect(updatedSkill.updatedAt!.getTime()).toBeGreaterThan(initialUpdatedAt!.getTime());
    });
  });

  describe('Category Organization', () => {
    it('should allow multiple skills in same category', async () => {
      const frontendSkills = [
        { name: 'React', category: 'Frontend', proficiency: 95 },
        { name: 'Vue', category: 'Frontend', proficiency: 80 },
        { name: 'Angular', category: 'Frontend', proficiency: 70 },
      ];

      for (const skillData of frontendSkills) {
        const skill = new Skill(skillData);
        await skill.save();
      }

      const savedSkills = await Skill.find({ category: 'Frontend' });
      expect(savedSkills).toHaveLength(3);
    });

    it('should support different categories', async () => {
      const skills = [
        { name: 'React', category: 'Frontend', proficiency: 95 },
        { name: 'Node.js', category: 'Backend', proficiency: 90 },
        { name: 'Docker', category: 'DevOps', proficiency: 85 },
        { name: 'Git', category: 'Tools', proficiency: 100 },
      ];

      for (const skillData of skills) {
        const skill = new Skill(skillData);
        await skill.save();
      }

      const categories = await Skill.distinct('category');
      expect(categories).toHaveLength(4);
      expect(categories).toContain('Frontend');
      expect(categories).toContain('Backend');
      expect(categories).toContain('DevOps');
      expect(categories).toContain('Tools');
    });
  });

  describe('Complete Skill Data', () => {
    it('should save a skill with all fields populated', async () => {
      const completeSkillData = {
        name: 'TypeScript',
        category: 'Frontend',
        proficiency: 95,
        icon: 'typescript.svg',
        order: 1,
      };

      const skill = new Skill(completeSkillData);
      const savedSkill = await skill.save();

      expect(savedSkill.name).toBe(completeSkillData.name);
      expect(savedSkill.category).toBe(completeSkillData.category);
      expect(savedSkill.proficiency).toBe(completeSkillData.proficiency);
      expect(savedSkill.icon).toBe(completeSkillData.icon);
      expect(savedSkill.order).toBe(completeSkillData.order);
      expect(savedSkill.createdAt).toBeInstanceOf(Date);
      expect(savedSkill.updatedAt).toBeInstanceOf(Date);
    });
  });
});
