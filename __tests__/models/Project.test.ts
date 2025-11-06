/**
 * @jest-environment node
 */

import mongoose from 'mongoose';
import Project from '@/models/Project';
import { connectDB } from '@/lib/db';

// Mock the database connection
jest.mock('@/lib/db');

describe('Project Model', () => {
  beforeAll(async () => {
    // Connect to in-memory MongoDB
    await mongoose.connect('mongodb://127.0.0.1/test-project-model');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Project.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid project with required fields', async () => {
      const projectData = {
        title: 'Test Project',
        slug: 'test-project',
        description: 'A test project description',
      };

      const project = new Project(projectData);
      const savedProject = await project.save();

      expect(savedProject._id).toBeDefined();
      expect(savedProject.title).toBe(projectData.title);
      expect(savedProject.slug).toBe(projectData.slug);
      expect(savedProject.description).toBe(projectData.description);
      expect(savedProject.published).toBe(true); // default value
      expect(savedProject.source).toBe('manual'); // default value
      expect(savedProject.featured).toBe(false); // default value
    });

    it('should fail validation when title is missing', async () => {
      const projectData = {
        slug: 'test-project',
        description: 'A test project description',
      };

      const project = new Project(projectData);
      
      await expect(project.save()).rejects.toThrow();
    });

    it('should fail validation when slug is missing', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'A test project description',
      };

      const project = new Project(projectData);
      
      await expect(project.save()).rejects.toThrow();
    });

    it('should fail validation when description is missing', async () => {
      const projectData = {
        title: 'Test Project',
        slug: 'test-project',
      };

      const project = new Project(projectData);
      
      await expect(project.save()).rejects.toThrow();
    });
  });

  describe('Unique Constraints', () => {
    it('should enforce unique slug constraint', async () => {
      const projectData1 = {
        title: 'Test Project 1',
        slug: 'duplicate-slug',
        description: 'First project',
      };

      const projectData2 = {
        title: 'Test Project 2',
        slug: 'duplicate-slug', // Same slug
        description: 'Second project',
      };

      const project1 = new Project(projectData1);
      await project1.save();

      const project2 = new Project(projectData2);
      await expect(project2.save()).rejects.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should set default values for optional fields', async () => {
      const projectData = {
        title: 'Test Project',
        slug: 'test-project',
        description: 'A test project description',
      };

      const project = new Project(projectData);
      const savedProject = await project.save();

      expect(savedProject.published).toBe(true);
      expect(savedProject.featured).toBe(false);
      expect(savedProject.source).toBe('manual');
      expect(savedProject.image).toBe('');
      expect(savedProject.category).toBe('');
      expect(savedProject.topics).toEqual([]);
      expect(savedProject.dateCreated).toBeInstanceOf(Date);
    });

    it('should allow overriding default values', async () => {
      const projectData = {
        title: 'Test Project',
        slug: 'test-project',
        description: 'A test project description',
        published: false,
        featured: true,
        source: 'github' as const,
        image: 'https://example.com/image.jpg',
        category: 'web-app',
      };

      const project = new Project(projectData);
      const savedProject = await project.save();

      expect(savedProject.published).toBe(false);
      expect(savedProject.featured).toBe(true);
      expect(savedProject.source).toBe('github');
      expect(savedProject.image).toBe('https://example.com/image.jpg');
      expect(savedProject.category).toBe('web-app');
    });
  });

  describe('Array Fields', () => {
    it('should store techStack as array of strings', async () => {
      const projectData = {
        title: 'Test Project',
        slug: 'test-project',
        description: 'A test project description',
        techStack: ['React', 'TypeScript', 'Node.js'],
      };

      const project = new Project(projectData);
      const savedProject = await project.save();

      expect(savedProject.techStack).toEqual(['React', 'TypeScript', 'Node.js']);
      expect(Array.isArray(savedProject.techStack)).toBe(true);
    });

    it('should store topics as array of strings', async () => {
      const projectData = {
        title: 'Test Project',
        slug: 'test-project',
        description: 'A test project description',
        topics: ['web-development', 'frontend', 'backend'],
      };

      const project = new Project(projectData);
      const savedProject = await project.save();

      expect(savedProject.topics).toEqual(['web-development', 'frontend', 'backend']);
      expect(Array.isArray(savedProject.topics)).toBe(true);
    });
  });

  describe('Enum Fields', () => {
    it('should accept valid source values', async () => {
      const manualProject = new Project({
        title: 'Manual Project',
        slug: 'manual-project',
        description: 'Description',
        source: 'manual',
      });

      const githubProject = new Project({
        title: 'GitHub Project',
        slug: 'github-project',
        description: 'Description',
        source: 'github',
      });

      const savedManual = await manualProject.save();
      const savedGithub = await githubProject.save();

      expect(savedManual.source).toBe('manual');
      expect(savedGithub.source).toBe('github');
    });

    it('should reject invalid source values', async () => {
      const projectData = {
        title: 'Test Project',
        slug: 'test-project',
        description: 'Description',
        source: 'invalid-source',
      };

      const project = new Project(projectData);
      await expect(project.save()).rejects.toThrow();
    });
  });

  describe('Optional URL Fields', () => {
    it('should store URL fields when provided', async () => {
      const projectData = {
        title: 'Test Project',
        slug: 'test-project',
        description: 'Description',
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com/user/repo',
        videoUrl: 'https://youtube.com/watch?v=123',
      };

      const project = new Project(projectData);
      const savedProject = await project.save();

      expect(savedProject.liveUrl).toBe('https://example.com');
      expect(savedProject.githubUrl).toBe('https://github.com/user/repo');
      expect(savedProject.videoUrl).toBe('https://youtube.com/watch?v=123');
    });

    it('should allow URL fields to be undefined', async () => {
      const projectData = {
        title: 'Test Project',
        slug: 'test-project',
        description: 'Description',
      };

      const project = new Project(projectData);
      const savedProject = await project.save();

      expect(savedProject.liveUrl).toBeUndefined();
      expect(savedProject.githubUrl).toBeUndefined();
      expect(savedProject.videoUrl).toBeUndefined();
    });
  });

  describe('Timestamps', () => {
    it('should automatically add createdAt and updatedAt timestamps', async () => {
      const projectData = {
        title: 'Test Project',
        slug: 'test-project',
        description: 'Description',
      };

      const project = new Project(projectData);
      const savedProject = await project.save();

      expect(savedProject.createdAt).toBeInstanceOf(Date);
      expect(savedProject.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const projectData = {
        title: 'Test Project',
        slug: 'test-project',
        description: 'Description',
      };

      const project = new Project(projectData);
      const savedProject = await project.save();
      const initialUpdatedAt = savedProject.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      savedProject.title = 'Updated Title';
      const updatedProject = await savedProject.save();

      expect(updatedProject.updatedAt.getTime()).toBeGreaterThan(initialUpdatedAt!.getTime());
    });
  });

  describe('Complete Project Data', () => {
    it('should save a project with all fields populated', async () => {
      const completeProjectData = {
        title: 'Complete Portfolio Project',
        slug: 'complete-portfolio-project',
        description: 'A comprehensive portfolio website with admin panel',
        image: 'https://example.com/portfolio.jpg',
        techStack: ['Next.js', 'TypeScript', 'MongoDB', 'TailwindCSS'],
        topics: ['portfolio', 'full-stack', 'web-development'],
        category: 'web-application',
        liveUrl: 'https://portfolio.example.com',
        githubUrl: 'https://github.com/user/portfolio',
        videoUrl: 'https://youtube.com/demo',
        featured: true,
        published: true,
        source: 'github' as const,
      };

      const project = new Project(completeProjectData);
      const savedProject = await project.save();

      expect(savedProject.title).toBe(completeProjectData.title);
      expect(savedProject.slug).toBe(completeProjectData.slug);
      expect(savedProject.description).toBe(completeProjectData.description);
      expect(savedProject.image).toBe(completeProjectData.image);
      expect(savedProject.techStack).toEqual(completeProjectData.techStack);
      expect(savedProject.topics).toEqual(completeProjectData.topics);
      expect(savedProject.category).toBe(completeProjectData.category);
      expect(savedProject.liveUrl).toBe(completeProjectData.liveUrl);
      expect(savedProject.githubUrl).toBe(completeProjectData.githubUrl);
      expect(savedProject.videoUrl).toBe(completeProjectData.videoUrl);
      expect(savedProject.featured).toBe(completeProjectData.featured);
      expect(savedProject.published).toBe(completeProjectData.published);
      expect(savedProject.source).toBe(completeProjectData.source);
    });
  });
});
