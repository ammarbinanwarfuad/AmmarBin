import { connectDB } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { logger } from "@/lib/logger";
// Pre-warm connection in production for faster first request
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  import('@/lib/db-init').catch(() => {
    // Ignore if initialization fails
  });
}

// ⚡ Performance: Dynamic imports to prevent server-only code in client bundle

// Profile Data with aggressive caching
export const getProfile = unstable_cache(
  async () => {
  try {
    await connectDB();
    const Profile = (await import("@/models/Profile")).default;
    // Ultra-optimized query - minimal fields, lean(), indexed query
    // Using hint({}) to ensure index usage and limit(1) for faster query
    let profile = await Profile.findOne()
      .select('name title bio profileImage email location socialLinks heroContent aboutContent languages hobbies resumePDF')
      .lean()
      .limit(1)
      .maxTimeMS(200); // Ultra-fast timeout for instant response

    if (!profile) {
      // Create default profile if none exists
      profile = await Profile.create({
        name: "Ammar Bin Anwar Fuad",
        title: "Software Engineer & Developer",
        bio: "A tech enthusiast studying Computer Science and Engineering",
        email: "ammarbinanwarfuad@gmail.com",
        location: "Dhaka, Bangladesh",
        socialLinks: {
          github: "https://github.com/ammarbinanwarfuad",
          linkedin: "https://linkedin.com/in/ammarbinanwarfuad",
        },
        heroContent: {
          heading: "Hi, I'm Ammar",
          subheading: "Software Engineer & Developer",
          description:
            "A tech enthusiast studying Computer Science and Engineering at Green University of Bangladesh",
        },
        aboutContent:
          "I am a passionate software developer with experience in full-stack development.",
        languages: ["English", "Bengali"],
        hobbies: ["Coding", "Reading", "Technology"],
      });
    }

    const result = JSON.parse(JSON.stringify(profile));
    return result;
  } catch (error) {
    logger.error("Failed to fetch profile", error);
    // Return default profile on error
    const defaultProfile = {
      name: "Ammar Bin Anwar Fuad",
      title: "Software Engineer & Developer",
      bio: "A tech enthusiast studying Computer Science and Engineering",
      email: "ammarbinanwarfuad@gmail.com",
      location: "Dhaka, Bangladesh",
      profileImage: "https://res.cloudinary.com/ammarbin/image/upload/v1762075570/profile/fshoacntppx9mgjwvlca.jpg",
      socialLinks: {},
      heroContent: {
        heading: "Hi, I'm Ammar",
        subheading: "Software Engineer & Developer",
        description:
          "A tech enthusiast studying Computer Science and Engineering at Green University of Bangladesh",
      },
      aboutContent:
        "I am a passionate software developer with experience in full-stack development.",
      languages: ["English", "Bengali"],
      hobbies: ["Coding", "Reading", "Technology"],
    };
    return defaultProfile;
  }
  },
  ['profile'],
  {
    tags: ['profile'],
    revalidate: 3600, // 1 hour - aggressive caching for instant loads
  }
);

// Projects Data with caching
export const getProjects = unstable_cache(
  async (filters?: { category?: string; featured?: boolean; techStack?: string[]; includeUnpublished?: boolean }) => {
    try {
      await connectDB();
      const Project = (await import("@/models/Project")).default;
      const query: Record<string, unknown> = {};
      
      // Only filter by published if not explicitly including unpublished
      if (!filters?.includeUnpublished) {
        query.published = true;
      }
      
      if (filters?.category) query.category = filters.category;
      if (filters?.featured !== undefined) query.featured = filters.featured;
      if (filters?.techStack && filters.techStack.length > 0) {
        query.techStack = { $all: filters.techStack };
      }

      const projects = await Project.find(query)
        .select('title slug description image techStack category liveUrl githubUrl videoUrl featured dateCreated published')
        .sort({ dateCreated: -1 })
        .lean()
        .maxTimeMS(200);
      const result = JSON.parse(JSON.stringify(projects));
      return result;
    } catch (error) {
      logger.error("Failed to fetch projects", error);
      return [];
    }
  },
  ['projects'],
  { tags: ['projects'], revalidate: 3600 }
);

// Blog Data with caching
export const getBlogs = unstable_cache(
  async (source?: string, includeUnpublished?: boolean) => {
    try {
      await connectDB();
      const Blog = (await import("@/models/Blog")).default;
      const ExternalBlog = (await import("@/models/ExternalBlog")).default;

      // Fetch internal blogs
      let internalBlogs: Array<Record<string, unknown>> = [];
      if (!source || source === "internal") {
        const query = includeUnpublished ? {} : { published: true };
        internalBlogs = await Blog.find(query)
          .select('title slug excerpt featuredImage publishedDate readTime tags createdAt published')
          .sort({ publishedDate: -1, createdAt: -1 })
          .lean()
          .maxTimeMS(200);
      }

      // Fetch external blogs
      let externalBlogs: Array<Record<string, unknown>> = [];
      if (!source || source !== "internal") {
        const query = source ? { source } : {};
        externalBlogs = await ExternalBlog.find(query)
          .select('title slug excerpt featuredImage publishedDate readTime tags source url')
          .sort({ publishedDate: -1 })
          .lean()
          .maxTimeMS(200);
      }

      // Combine and add source field
      const allBlogs = [
        ...internalBlogs.map((blog) => ({ ...blog, source: "internal" })),
        ...externalBlogs.map((blog) => ({
          ...blog,
          source: blog.source || "external",
          published: true,
        })),
      ].sort((a, b) => {
        const dateA = new Date(((a as Record<string, unknown>).publishedDate || (a as Record<string, unknown>).createdAt || 0) as string | number);
        const dateB = new Date(((b as Record<string, unknown>).publishedDate || (b as Record<string, unknown>).createdAt || 0) as string | number);
        return dateB.getTime() - dateA.getTime();
      });

      const result = JSON.parse(JSON.stringify(allBlogs));
      return result;
    } catch (error) {
      logger.error("Failed to fetch blogs", error);
      return [];
    }
  },
  ['blogs'],
  { tags: ['blogs'], revalidate: 1800 } // 30 minutes for blogs
);

// Single Blog Post
export const getBlogBySlug = async (slug: string) => {
  try {
    await connectDB();
    const Blog = (await import("@/models/Blog")).default;
    const blog = await Blog.findOne({ slug })
      .lean()
      .maxTimeMS(500); // Timeout for faster TTFB
    
    if (!blog) {
      return null;
    }

    const result = JSON.parse(JSON.stringify(blog));
    return result;
  } catch (error) {
    logger.error("Failed to fetch blog", error);
    return null;
  }
};

// Experience Data with caching
export const getExperiences = unstable_cache(
  async () => {
    try {
      await connectDB();
      const Experience = (await import("@/models/Experience")).default;
      const experiences = await Experience.find({})
        .select('company companyLogo role startDate endDate current location description responsibilities skills')
        .sort({ startDate: -1 })
        .lean()
        .maxTimeMS(200);
      const result = JSON.parse(JSON.stringify(experiences));
      return result;
    } catch (error) {
      logger.error("Failed to fetch experiences", error);
      return [];
    }
  },
  ['experience'],
  { tags: ['experience'], revalidate: 3600 }
);

// Participation Data with caching
export const getParticipations = unstable_cache(
  async () => {
    try {
      await connectDB();
      const Participation = (await import("@/models/Participation")).default;
      const participations = await Participation.find({})
        .select('title organization role startDate endDate current location description impact images')
        .sort({ startDate: -1 })
        .lean()
        .maxTimeMS(200);
      return JSON.parse(JSON.stringify(participations));
    } catch (error) {
      logger.error("Failed to fetch participations", error);
      return [];
    }
  },
  ['participation'],
  { tags: ['participation'], revalidate: 3600 }
);

// Education Data with caching
export const getEducation = unstable_cache(
  async () => {
    try {
      await connectDB();
      const Education = (await import("@/models/Education")).default;
      const education = await Education.find({})
        .select('institution institutionLogo degree field startDate endDate current grade location description achievements')
        .sort({ startDate: -1 })
        .lean()
        .maxTimeMS(200);
      const result = JSON.parse(JSON.stringify(education));
      return result;
    } catch (error) {
      logger.error("Failed to fetch education", error);
      return [];
    }
  },
  ['education'],
  { tags: ['education'], revalidate: 3600 }
);

// Skills Data with caching
export const getSkills = unstable_cache(
  async () => {
    try {
      await connectDB();
      const Skill = (await import("@/models/Skill")).default;
      const skills = await Skill.find({})
        .select('name category proficiency icon')
        .sort({ category: 1, proficiency: -1 })
        .lean()
        .maxTimeMS(200);
      
      const result = JSON.parse(JSON.stringify(skills));
      return result;
    } catch (error) {
      logger.error("Failed to fetch skills", error);
      return [];
    }
  },
  ['skills'],
  { tags: ['skills'], revalidate: 3600 }
);

// Certifications Data
export const getCertifications = async (filters?: { category?: string; search?: string }): Promise<{
  certificates: Array<Record<string, unknown>>;
  stats: {
    total: number;
    active: number;
    expired: number;
    categories: Array<{ _id: string; count: number }>;
  };
}> => {
  try {
    await connectDB();
    const Certificate = (await import("@/models/Certificate")).default;
    
    const query: Record<string, unknown> = { published: true }; // Only show published certificates
    if (filters?.category) query.category = filters.category;
    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { issuer: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    const certificates = await Certificate.find(query)
      .select('_id title issuer category issueDate expiryDate credentialId verificationUrl certificateImage skills description featured')
      .sort({ issueDate: -1 })
      .lean()
      .maxTimeMS(200);
    
    // Calculate stats - only count published certificates
    const publishedQuery: Record<string, unknown> = { published: true };
    const allCertificates = await Certificate.find(publishedQuery)
      .select('category expiryDate published')
      .lean()
      .maxTimeMS(200);
    const now = new Date();
    // Active: published certificates with no expiry date OR expiry date in the future
    const active = allCertificates.filter(c => !c.expiryDate || new Date(c.expiryDate as Date) > now).length;
    const expired = allCertificates.filter(c => c.expiryDate && new Date(c.expiryDate as Date) <= now).length;
    
    const categoryCounts = allCertificates.reduce((acc: Record<string, number>, cert: Record<string, unknown>) => {
      const category = cert.category as string;
      if (category) {
        acc[category] = (acc[category] || 0) + 1;
      }
      return acc;
    }, {});
    
    const stats = {
      total: allCertificates.length,
      active,
      expired,
      categories: Object.entries(categoryCounts).map(([_id, count]) => ({ _id, count })),
    };

    const result = {
      certificates: JSON.parse(JSON.stringify(certificates)),
      stats,
    };
    return result;
  } catch (error) {
    logger.error("Failed to fetch certifications", error);
    return {
      certificates: [],
      stats: { total: 0, active: 0, expired: 0, categories: [] },
    };
  }
};

