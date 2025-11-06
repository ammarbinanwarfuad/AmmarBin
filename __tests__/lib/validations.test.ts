import {
  loginSchema,
  contactSchema,
  skillSchema,
  projectSchema,
  blogSchema
} from '@/lib/validations'
import { z } from 'zod'

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validLogin = {
        email: 'admin@example.com',
        password: 'password123'
      }

      const result = loginSchema.safeParse(validLogin)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email format', () => {
      const invalidLogin = {
        email: 'invalid-email',
        password: 'password123'
      }

      const result = loginSchema.safeParse(invalidLogin)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address')
      }
    })

    it('should reject password shorter than 6 characters', () => {
      const invalidLogin = {
        email: 'admin@example.com',
        password: '12345'
      }

      const result = loginSchema.safeParse(invalidLogin)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 6 characters')
      }
    })

    it('should reject missing email', () => {
      const invalidLogin = {
        password: 'password123'
      }

      const result = loginSchema.safeParse(invalidLogin)
      expect(result.success).toBe(false)
    })

    it('should reject missing password', () => {
      const invalidLogin = {
        email: 'admin@example.com'
      }

      const result = loginSchema.safeParse(invalidLogin)
      expect(result.success).toBe(false)
    })

    it('should accept password exactly 6 characters', () => {
      const validLogin = {
        email: 'test@example.com',
        password: '123456'
      }

      const result = loginSchema.safeParse(validLogin)
      expect(result.success).toBe(true)
    })
  })

  describe('contactSchema', () => {
    it('should validate correct contact data', () => {
      const validContact = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Project Inquiry',
        message: 'I would like to discuss a project with you.'
      }

      const result = contactSchema.safeParse(validContact)
      expect(result.success).toBe(true)
    })

    it('should accept contact without subject', () => {
      const validContact = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        message: 'This is a test message for contact.'
      }

      const result = contactSchema.safeParse(validContact)
      expect(result.success).toBe(true)
    })

    it('should reject name shorter than 2 characters', () => {
      const invalidContact = {
        name: 'J',
        email: 'john@example.com',
        message: 'Test message content here.'
      }

      const result = contactSchema.safeParse(invalidContact)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters')
      }
    })

    it('should reject invalid email', () => {
      const invalidContact = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'Test message content here.'
      }

      const result = contactSchema.safeParse(invalidContact)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address')
      }
    })

    it('should reject message shorter than 10 characters', () => {
      const invalidContact = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Short'
      }

      const result = contactSchema.safeParse(invalidContact)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 10 characters')
      }
    })

    it('should accept message exactly 10 characters', () => {
      const validContact = {
        name: 'John Doe',
        email: 'john@example.com',
        message: '1234567890'
      }

      const result = contactSchema.safeParse(validContact)
      expect(result.success).toBe(true)
    })

    it('should handle very long messages', () => {
      const validContact = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'a'.repeat(5000)
      }

      const result = contactSchema.safeParse(validContact)
      expect(result.success).toBe(true)
    })
  })

  describe('skillSchema', () => {
    it('should validate correct skill data', () => {
      const validSkill = {
        name: 'TypeScript',
        category: 'Programming Languages',
        proficiency: 85,
        icon: 'typescript',
        order: 1
      }

      const result = skillSchema.safeParse(validSkill)
      expect(result.success).toBe(true)
    })

    it('should accept skill without optional fields', () => {
      const validSkill = {
        name: 'React',
        category: 'Frontend',
        proficiency: 90
      }

      const result = skillSchema.safeParse(validSkill)
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const invalidSkill = {
        name: '',
        category: 'Frontend',
        proficiency: 80
      }

      const result = skillSchema.safeParse(invalidSkill)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name is required')
      }
    })

    it('should reject empty category', () => {
      const invalidSkill = {
        name: 'JavaScript',
        category: '',
        proficiency: 75
      }

      const result = skillSchema.safeParse(invalidSkill)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Category is required')
      }
    })

    it('should reject proficiency below 0', () => {
      const invalidSkill = {
        name: 'CSS',
        category: 'Frontend',
        proficiency: -5
      }

      const result = skillSchema.safeParse(invalidSkill)
      expect(result.success).toBe(false)
    })

    it('should reject proficiency above 100', () => {
      const invalidSkill = {
        name: 'HTML',
        category: 'Frontend',
        proficiency: 150
      }

      const result = skillSchema.safeParse(invalidSkill)
      expect(result.success).toBe(false)
    })

    it('should accept proficiency at boundaries (0 and 100)', () => {
      const skill1 = { name: 'Skill1', category: 'Cat1', proficiency: 0 }
      const skill2 = { name: 'Skill2', category: 'Cat2', proficiency: 100 }

      expect(skillSchema.safeParse(skill1).success).toBe(true)
      expect(skillSchema.safeParse(skill2).success).toBe(true)
    })
  })

  describe('projectSchema', () => {
    it('should validate correct project data', () => {
      const validProject = {
        title: 'Portfolio Website',
        slug: 'portfolio-website',
        description: 'A modern portfolio built with Next.js',
        image: 'https://example.com/image.jpg',
        techStack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
        category: 'Web Development',
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com/user/repo',
        videoUrl: 'https://youtube.com/watch?v=123',
        featured: true,
        dateCreated: '2024-01-01'
      }

      const result = projectSchema.safeParse(validProject)
      expect(result.success).toBe(true)
    })

    it('should accept minimal project data', () => {
      const minimalProject = {
        title: 'Simple Project',
        slug: 'simple-project',
        description: 'A simple project description',
        techStack: ['JavaScript']
      }

      const result = projectSchema.safeParse(minimalProject)
      expect(result.success).toBe(true)
    })

    it('should reject empty title', () => {
      const invalidProject = {
        title: '',
        slug: 'test-project',
        description: 'Description',
        techStack: ['React']
      }

      const result = projectSchema.safeParse(invalidProject)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required')
      }
    })

    it('should reject empty slug', () => {
      const invalidProject = {
        title: 'Test Project',
        slug: '',
        description: 'Description',
        techStack: ['React']
      }

      const result = projectSchema.safeParse(invalidProject)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Slug is required')
      }
    })

    it('should reject empty description', () => {
      const invalidProject = {
        title: 'Test Project',
        slug: 'test-project',
        description: '',
        techStack: ['React']
      }

      const result = projectSchema.safeParse(invalidProject)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Description is required')
      }
    })

    it('should accept empty category', () => {
      const validProject = {
        title: 'Test',
        slug: 'test',
        description: 'Desc',
        techStack: ['React'],
        category: ''
      }

      const result = projectSchema.safeParse(validProject)
      expect(result.success).toBe(true)
    })

    it('should accept empty URL strings', () => {
      const validProject = {
        title: 'Test',
        slug: 'test',
        description: 'Desc',
        techStack: ['React'],
        liveUrl: '',
        githubUrl: '',
        videoUrl: ''
      }

      const result = projectSchema.safeParse(validProject)
      expect(result.success).toBe(true)
    })

    it('should reject invalid URL format', () => {
      const invalidProject = {
        title: 'Test',
        slug: 'test',
        description: 'Desc',
        techStack: ['React'],
        liveUrl: 'not-a-valid-url'
      }

      const result = projectSchema.safeParse(invalidProject)
      expect(result.success).toBe(false)
    })

    it('should accept techStack as empty array', () => {
      const project = {
        title: 'Test',
        slug: 'test',
        description: 'Desc',
        techStack: []
      }

      const result = projectSchema.safeParse(project)
      expect(result.success).toBe(true)
    })

    it('should accept date as string or Date object', () => {
      const project1 = {
        title: 'Test',
        slug: 'test',
        description: 'Desc',
        techStack: ['React'],
        dateCreated: '2024-01-01'
      }
      const project2 = {
        title: 'Test',
        slug: 'test',
        description: 'Desc',
        techStack: ['React'],
        dateCreated: new Date('2024-01-01')
      }

      expect(projectSchema.safeParse(project1).success).toBe(true)
      expect(projectSchema.safeParse(project2).success).toBe(true)
    })
  })

  describe('blogSchema', () => {
    it('should validate correct blog data', () => {
      const validBlog = {
        title: 'My First Blog Post',
        slug: 'my-first-blog-post',
        content: 'This is the full content of the blog post.',
        excerpt: 'A brief excerpt',
        featuredImage: 'https://example.com/image.jpg',
        tags: ['javascript', 'react', 'nextjs'],
        category: 'Web Development',
        published: true,
        publishedDate: '2024-01-01',
        seo: {
          metaTitle: 'SEO Title',
          metaDescription: 'SEO description for this post'
        }
      }

      const result = blogSchema.safeParse(validBlog)
      expect(result.success).toBe(true)
    })

    it('should accept minimal blog data', () => {
      const minimalBlog = {
        title: 'Simple Blog',
        slug: 'simple-blog',
        content: 'Blog content goes here.'
      }

      const result = blogSchema.safeParse(minimalBlog)
      expect(result.success).toBe(true)
    })

    it('should reject empty title', () => {
      const invalidBlog = {
        title: '',
        slug: 'test-blog',
        content: 'Content'
      }

      const result = blogSchema.safeParse(invalidBlog)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required')
      }
    })

    it('should reject empty slug', () => {
      const invalidBlog = {
        title: 'Test Blog',
        slug: '',
        content: 'Content'
      }

      const result = blogSchema.safeParse(invalidBlog)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Slug is required')
      }
    })

    it('should reject empty content', () => {
      const invalidBlog = {
        title: 'Test Blog',
        slug: 'test-blog',
        content: ''
      }

      const result = blogSchema.safeParse(invalidBlog)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Content is required')
      }
    })

    it('should accept tags as empty array', () => {
      const validBlog = {
        title: 'Test',
        slug: 'test',
        content: 'Content',
        tags: []
      }

      const result = blogSchema.safeParse(validBlog)
      expect(result.success).toBe(true)
    })

    it('should accept blog without SEO fields', () => {
      const validBlog = {
        title: 'Test',
        slug: 'test',
        content: 'Content'
      }

      const result = blogSchema.safeParse(validBlog)
      expect(result.success).toBe(true)
    })

    it('should accept partial SEO data', () => {
      const validBlog = {
        title: 'Test',
        slug: 'test',
        content: 'Content',
        seo: {
          metaTitle: 'Only title'
        }
      }

      const result = blogSchema.safeParse(validBlog)
      expect(result.success).toBe(true)
    })

    it('should accept publishedDate as string or Date', () => {
      const blog1 = {
        title: 'Test',
        slug: 'test',
        content: 'Content',
        publishedDate: '2024-01-01'
      }
      const blog2 = {
        title: 'Test',
        slug: 'test',
        content: 'Content',
        publishedDate: new Date('2024-01-01')
      }

      expect(blogSchema.safeParse(blog1).success).toBe(true)
      expect(blogSchema.safeParse(blog2).success).toBe(true)
    })

    it('should accept published as boolean', () => {
      const published = {
        title: 'Test',
        slug: 'test',
        content: 'Content',
        published: true
      }
      const draft = {
        title: 'Test',
        slug: 'test',
        content: 'Content',
        published: false
      }

      expect(blogSchema.safeParse(published).success).toBe(true)
      expect(blogSchema.safeParse(draft).success).toBe(true)
    })
  })

  describe('Error Messages', () => {
    it('should provide clear error messages', () => {
      const result = contactSchema.safeParse({
        name: 'J',
        email: 'invalid',
        message: 'short'
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
        result.error.issues.forEach(issue => {
          expect(issue.message).toBeTruthy()
          expect(typeof issue.message).toBe('string')
        })
      }
    })

    it('should include field path in errors', () => {
      const result = skillSchema.safeParse({
        name: '',
        category: '',
        proficiency: 150
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(issue => issue.path[0])
        expect(paths).toContain('name')
        expect(paths).toContain('category')
        expect(paths).toContain('proficiency')
      }
    })
  })

  describe('Type Safety', () => {
    it('should infer correct types from schemas', () => {
      type LoginData = z.infer<typeof loginSchema>
      type ContactData = z.infer<typeof contactSchema>
      type SkillData = z.infer<typeof skillSchema>
      type ProjectData = z.infer<typeof projectSchema>
      type BlogData = z.infer<typeof blogSchema>

      const login: LoginData = { email: 'test@example.com', password: '123456' }
      const contact: ContactData = { name: 'John', email: 'john@example.com', message: 'Hello there!' }
      const skill: SkillData = { name: 'React', category: 'Frontend', proficiency: 90 }
      const project: ProjectData = { title: 'Test', slug: 'test', description: 'Desc', techStack: [] }
      const blog: BlogData = { title: 'Blog', slug: 'blog', content: 'Content' }

      expect(login).toBeDefined()
      expect(contact).toBeDefined()
      expect(skill).toBeDefined()
      expect(project).toBeDefined()
      expect(blog).toBeDefined()
    })
  })
})
