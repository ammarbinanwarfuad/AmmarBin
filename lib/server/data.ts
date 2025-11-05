import { connectDB } from "@/lib/db";
// Pre-warm connection in production for faster first request
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  import('@/lib/db-init').catch(() => {
    // Ignore if initialization fails
  });
}

// ⚡ Performance: Dynamic imports to prevent server-only code in client bundle

// Profile Data
export const getProfile = async () => {
  try {
    await connectDB();
    const Profile = (await import("@/models/Profile")).default;
    // Ultra-optimized query - minimal fields, lean(), indexed query
    // Using hint({}) to ensure index usage and limit(1) for faster query
    let profile = await Profile.findOne()
      .select('name title bio profileImage email location socialLinks heroContent aboutContent languages hobbies resumePDF')
      .lean()
      .limit(1)
      .maxTimeMS(300); // Reduced from 500ms - faster timeout for better TTFB

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
    console.error("Error fetching profile:", error);
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
};

// Projects Data
export const getProjects = async (filters?: { category?: string; featured?: boolean; topics?: string[] }) => {
  try {
    await connectDB();
    const Project = (await import("@/models/Project")).default;
    const query: Record<string, unknown> = { published: true }; // Only show published projects
    
    if (filters?.category) query.category = filters.category;
    if (filters?.featured !== undefined) query.featured = filters.featured;
    if (filters?.topics && filters.topics.length > 0) {
      query.topics = { $all: filters.topics };
    }

    // Use compound index for published + dateCreated queries
    const projects = await Project.find(query)
      .select('title slug description image techStack topics languages category liveUrl githubUrl videoUrl featured dateCreated')
      .sort({ dateCreated: -1 })
      .lean()
      .maxTimeMS(500); // Timeout for faster TTFB
    const result = JSON.parse(JSON.stringify(projects));
    return result;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

// Blog Data
export const getBlogs = async (source?: string) => {
  try {
    await connectDB();
    const Blog = (await import("@/models/Blog")).default;
    const ExternalBlog = (await import("@/models/ExternalBlog")).default;

    // Fetch internal blogs - using compound index for published + publishedDate
    let internalBlogs: Array<Record<string, unknown>> = [];
    if (!source || source === "internal") {
      internalBlogs = await Blog.find({ published: true })
        .select('title slug excerpt featuredImage publishedDate readTime tags createdAt')
        .sort({ publishedDate: -1, createdAt: -1 }) // Use indexed field first
        .lean()
        .maxTimeMS(500); // Timeout for faster TTFB
    }

    // Fetch external blogs
    let externalBlogs: Array<Record<string, unknown>> = [];
    if (!source || source !== "internal") {
      const query = source ? { source } : {};
      externalBlogs = await ExternalBlog.find(query)
        .select('title slug excerpt featuredImage publishedDate readTime tags source url')
        .sort({ publishedDate: -1 })
        .lean();
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
    console.error("Error fetching blogs:", error);
    return [];
  }
};

// Single Blog Post
export const getBlogBySlug = async (slug: string) => {
  try {
    await connectDB();
    const Blog = (await import("@/models/Blog")).default;
    const blog = await Blog.findOne({ slug }).lean();
    
    if (!blog) {
      return null;
    }

    const result = JSON.parse(JSON.stringify(blog));
    return result;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
};

// Experience Data
export const getExperiences = async () => {
  try {
    await connectDB();
    const Experience = (await import("@/models/Experience")).default;
    const experiences = await Experience.find({})
      .select('company companyLogo role startDate endDate current location description responsibilities skills')
      .sort({ startDate: -1 })
      .lean()
      .maxTimeMS(500);
    const result = JSON.parse(JSON.stringify(experiences));
    return result;
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return [];
  }
};

// Participation Data
export const getParticipations = async () => {
  try {
    await connectDB();
    const Participation = (await import("@/models/Participation")).default;
    const participations = await Participation.find({})
      .select('title organization role startDate endDate current location description impact images')
      .sort({ startDate: -1 })
      .lean();
    return JSON.parse(JSON.stringify(participations));
  } catch (error) {
    console.error("Error fetching participations:", error);
    return [];
  }
};

// Education Data
export const getEducation = async () => {
  try {
    await connectDB();
    const Education = (await import("@/models/Education")).default;
    const education = await Education.find({})
      .select('institution institutionLogo degree field startDate endDate current grade location description achievements')
      .sort({ startDate: -1 })
      .lean()
      .maxTimeMS(500);
    const result = JSON.parse(JSON.stringify(education));
    return result;
  } catch (error) {
    console.error("Error fetching education:", error);
    return [];
  }
};

// Skills Data
export const getSkills = async () => {
  try {
    await connectDB();
    const Skill = (await import("@/models/Skill")).default;
    const skills = await Skill.find({})
      .select('name category proficiency icon')
      .sort({ category: 1, proficiency: -1 })
      .lean()
      .maxTimeMS(500);
    
    const result = JSON.parse(JSON.stringify(skills));
    return result;
  } catch (error) {
    console.error("Error fetching skills from MongoDB:", error);
    // Return empty array on error to prevent page crashes
    return [];
  }
};

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
      .select('title issuer category issueDate expiryDate credentialId verificationUrl certificateImage skills description featured')
      .sort({ issueDate: -1 })
      .lean()
      .maxTimeMS(500);
    
    // Calculate stats - only count published certificates
    const publishedQuery: Record<string, unknown> = { published: true };
    const allCertificates = await Certificate.find(publishedQuery)
      .select('category expiryDate published')
      .lean();
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
    console.error("Error fetching certifications:", error);
    return {
      certificates: [],
      stats: { total: 0, active: 0, expired: 0, categories: [] },
    };
  }
};

