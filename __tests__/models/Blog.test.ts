/**
 * @jest-environment node
 */

import mongoose from 'mongoose';
import Blog from '@/models/Blog';

describe('Blog Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1/test-blog-model');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Blog.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid blog post with required fields', async () => {
      const blogData = {
        title: 'Test Blog Post',
        slug: 'test-blog-post',
        content: 'This is the blog content with at least some text.',
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog._id).toBeDefined();
      expect(savedBlog.title).toBe(blogData.title);
      expect(savedBlog.slug).toBe(blogData.slug);
      expect(savedBlog.content).toBe(blogData.content);
      expect(savedBlog.published).toBe(false); // default value
      expect(savedBlog.author).toBe('Ammar Bin Anwar Fuad'); // default value
      expect(savedBlog.views).toBe(0); // default value
      expect(savedBlog.readTime).toBe(0); // default value
    });

    it('should fail validation when title is missing', async () => {
      const blogData = {
        slug: 'test-blog-post',
        content: 'Content',
      };

      const blog = new Blog(blogData);
      await expect(blog.save()).rejects.toThrow();
    });

    it('should fail validation when slug is missing', async () => {
      const blogData = {
        title: 'Test Blog Post',
        content: 'Content',
      };

      const blog = new Blog(blogData);
      await expect(blog.save()).rejects.toThrow();
    });

    it('should fail validation when content is missing', async () => {
      const blogData = {
        title: 'Test Blog Post',
        slug: 'test-blog-post',
      };

      const blog = new Blog(blogData);
      await expect(blog.save()).rejects.toThrow();
    });
  });

  describe('Unique Constraints', () => {
    it('should enforce unique slug constraint', async () => {
      const blogData1 = {
        title: 'First Post',
        slug: 'duplicate-slug',
        content: 'First content',
      };

      const blogData2 = {
        title: 'Second Post',
        slug: 'duplicate-slug', // Same slug
        content: 'Second content',
      };

      const blog1 = new Blog(blogData1);
      await blog1.save();

      const blog2 = new Blog(blogData2);
      await expect(blog2.save()).rejects.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should set default author name', async () => {
      const blogData = {
        title: 'Test Post',
        slug: 'test-post',
        content: 'Content',
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog.author).toBe('Ammar Bin Anwar Fuad');
    });

    it('should allow custom author name', async () => {
      const blogData = {
        title: 'Guest Post',
        slug: 'guest-post',
        content: 'Content',
        author: 'Guest Author',
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog.author).toBe('Guest Author');
    });

    it('should default published to false', async () => {
      const blogData = {
        title: 'Draft Post',
        slug: 'draft-post',
        content: 'Content',
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog.published).toBe(false);
    });

    it('should default views to 0', async () => {
      const blogData = {
        title: 'New Post',
        slug: 'new-post',
        content: 'Content',
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog.views).toBe(0);
    });

    it('should default readTime to 0', async () => {
      const blogData = {
        title: 'New Post',
        slug: 'new-post',
        content: 'Content',
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog.readTime).toBe(0);
    });
  });

  describe('Optional Fields', () => {
    it('should save blog without optional fields', async () => {
      const blogData = {
        title: 'Minimal Post',
        slug: 'minimal-post',
        content: 'Content',
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog.excerpt).toBeUndefined();
      expect(savedBlog.featuredImage).toBeUndefined();
      expect(savedBlog.category).toBeUndefined();
      expect(savedBlog.publishedDate).toBeUndefined();
    });

    it('should save blog with all optional fields', async () => {
      const publishDate = new Date();
      const blogData = {
        title: 'Complete Post',
        slug: 'complete-post',
        content: 'Full content here',
        excerpt: 'Short excerpt',
        featuredImage: 'https://example.com/image.jpg',
        category: 'Tech',
        publishedDate: publishDate,
        readTime: 5,
        views: 100,
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog.excerpt).toBe('Short excerpt');
      expect(savedBlog.featuredImage).toBe('https://example.com/image.jpg');
      expect(savedBlog.category).toBe('Tech');
      expect(savedBlog.publishedDate).toEqual(publishDate);
      expect(savedBlog.readTime).toBe(5);
      expect(savedBlog.views).toBe(100);
    });
  });

  describe('Array Fields', () => {
    it('should store tags as array of strings', async () => {
      const blogData = {
        title: 'Tagged Post',
        slug: 'tagged-post',
        content: 'Content',
        tags: ['javascript', 'typescript', 'react'],
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog.tags).toEqual(['javascript', 'typescript', 'react']);
      expect(Array.isArray(savedBlog.tags)).toBe(true);
    });

    it('should allow empty tags array', async () => {
      const blogData = {
        title: 'No Tags',
        slug: 'no-tags',
        content: 'Content',
        tags: [],
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog.tags).toEqual([]);
    });
  });

  describe('SEO Fields', () => {
    it('should store SEO metadata', async () => {
      const blogData = {
        title: 'SEO Post',
        slug: 'seo-post',
        content: 'Content',
        seo: {
          metaTitle: 'Custom SEO Title',
          metaDescription: 'Custom meta description for SEO',
        },
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog.seo).toBeDefined();
      expect(savedBlog.seo?.metaTitle).toBe('Custom SEO Title');
      expect(savedBlog.seo?.metaDescription).toBe('Custom meta description for SEO');
    });

    it('should allow undefined SEO fields', async () => {
      const blogData = {
        title: 'No SEO',
        slug: 'no-seo',
        content: 'Content',
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog.seo).toBeUndefined();
    });
  });

  describe('Publishing Workflow', () => {
    it('should create draft post by default', async () => {
      const blogData = {
        title: 'Draft',
        slug: 'draft',
        content: 'Content',
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog.published).toBe(false);
      expect(savedBlog.publishedDate).toBeUndefined();
    });

    it('should allow publishing with publish date', async () => {
      const publishDate = new Date();
      const blogData = {
        title: 'Published Post',
        slug: 'published-post',
        content: 'Content',
        published: true,
        publishedDate: publishDate,
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog.published).toBe(true);
      expect(savedBlog.publishedDate).toEqual(publishDate);
    });
  });

  describe('Timestamps', () => {
    it('should automatically add createdAt and updatedAt', async () => {
      const blogData = {
        title: 'Test Post',
        slug: 'test-post',
        content: 'Content',
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog.createdAt).toBeInstanceOf(Date);
      expect(savedBlog.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const blogData = {
        title: 'Test Post',
        slug: 'test-post',
        content: 'Original content',
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();
      const initialUpdatedAt = savedBlog.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      savedBlog.content = 'Updated content';
      const updatedBlog = await savedBlog.save();

      expect(updatedBlog.updatedAt!.getTime()).toBeGreaterThan(initialUpdatedAt!.getTime());
    });
  });

  describe('View Counter', () => {
    it('should increment view count', async () => {
      const blogData = {
        title: 'Popular Post',
        slug: 'popular-post',
        content: 'Content',
        views: 0,
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      savedBlog.views = (savedBlog.views || 0) + 1;
      await savedBlog.save();

      expect(savedBlog.views).toBe(1);

      savedBlog.views = (savedBlog.views || 0) + 1;
      await savedBlog.save();

      expect(savedBlog.views).toBe(2);
    });
  });

  describe('Complete Blog Post', () => {
    it('should save a blog post with all fields populated', async () => {
      const publishDate = new Date();
      const completeBlogData = {
        title: 'Complete Guide to TypeScript',
        slug: 'complete-guide-to-typescript',
        content: 'Very long content about TypeScript programming language...',
        excerpt: 'Learn TypeScript from basics to advanced concepts',
        featuredImage: 'https://example.com/typescript-guide.jpg',
        author: 'Ammar Bin Anwar Fuad',
        tags: ['typescript', 'javascript', 'programming', 'tutorial'],
        category: 'Programming',
        published: true,
        publishedDate: publishDate,
        readTime: 12,
        views: 1500,
        seo: {
          metaTitle: 'Complete TypeScript Guide 2024',
          metaDescription: 'Master TypeScript with this comprehensive guide covering all concepts',
        },
      };

      const blog = new Blog(completeBlogData);
      const savedBlog = await blog.save();

      expect(savedBlog.title).toBe(completeBlogData.title);
      expect(savedBlog.slug).toBe(completeBlogData.slug);
      expect(savedBlog.content).toBe(completeBlogData.content);
      expect(savedBlog.excerpt).toBe(completeBlogData.excerpt);
      expect(savedBlog.featuredImage).toBe(completeBlogData.featuredImage);
      expect(savedBlog.author).toBe(completeBlogData.author);
      expect(savedBlog.tags).toEqual(completeBlogData.tags);
      expect(savedBlog.category).toBe(completeBlogData.category);
      expect(savedBlog.published).toBe(completeBlogData.published);
      expect(savedBlog.publishedDate).toEqual(completeBlogData.publishedDate);
      expect(savedBlog.readTime).toBe(completeBlogData.readTime);
      expect(savedBlog.views).toBe(completeBlogData.views);
      expect(savedBlog.seo?.metaTitle).toBe(completeBlogData.seo.metaTitle);
      expect(savedBlog.seo?.metaDescription).toBe(completeBlogData.seo.metaDescription);
    });
  });
});
