import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Import models
import User from "../models/User";
import Profile from "../models/Profile";
import Skill from "../models/Skill";
import Experience from "../models/Experience";
import Education from "../models/Education";
import Participation from "../models/Participation";
import Blog from "../models/Blog";
import Project from "../models/Project";
import Certificate from "../models/Certificate";

const MONGODB_URI = process.env.MONGODB_URI || "";

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Skill.deleteMany({});
    await Experience.deleteMany({});
    await Education.deleteMany({});
    await Participation.deleteMany({});
    await Blog.deleteMany({});
    await Project.deleteMany({});
    await Certificate.deleteMany({});

    // Create admin user (KEEP ACTUAL CREDENTIALS)
    console.log("Creating admin user...");
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "admin123",
      10
    );
    await User.create({
      username: process.env.ADMIN_USERNAME || "admin",
      email: process.env.ADMIN_EMAIL || "ammarbinanwarfuad@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    // Create profile (DUMMY DATA)
    console.log("Creating profile...");
    await Profile.create({
      name: "John Doe",
      title: "Full Stack Developer",
      bio: "A passionate developer with expertise in modern web technologies. Enthusiastic about building scalable applications and learning new technologies.",
      email: "john.doe@example.com",
      location: "San Francisco, CA",
      profileImage: "https://via.placeholder.com/400",
      socialLinks: {
        github: "https://github.com/johndoe",
        linkedin: "https://linkedin.com/in/johndoe",
        hashnode: "https://johndoe.hashnode.dev",
        facebook: "https://www.facebook.com/johndoe",
        instagram: "https://www.instagram.com/johndoe/",
        twitter: "https://x.com/johndoe",
      },
      heroContent: {
        heading: "Hi, I'm John",
        subheading: "Full Stack Developer & Tech Enthusiast",
        description:
          "A passionate developer with expertise in modern web technologies. Building scalable applications and sharing knowledge through writing.",
      },
      aboutContent:
        "I'm a full-stack developer based in San Francisco, CA. I have a passion for creating beautiful and functional web applications. I enjoy working with modern technologies and am always eager to learn new things. In my free time, I contribute to open-source projects and write technical blog posts.",
      languages: ["English", "Spanish"],
      hobbies: ["Reading", "Coding", "Photography", "Traveling"],
    });

    // Create skills (DUMMY DATA)
    console.log("Creating skills...");
    const skills = [
      // Frontend Development
      { name: "HTML", category: "Frontend Development", proficiency: 95, order: 1 },
      { name: "CSS", category: "Frontend Development", proficiency: 90, order: 2 },
      { name: "JavaScript", category: "Frontend Development", proficiency: 90, order: 3 },
      { name: "React", category: "Frontend Development", proficiency: 85, order: 4 },
      { name: "Next.js", category: "Frontend Development", proficiency: 85, order: 5 },
      { name: "TypeScript", category: "Frontend Development", proficiency: 80, order: 6 },
      { name: "Tailwind CSS", category: "Frontend Development", proficiency: 90, order: 7 },

      // Backend Development
      { name: "Node.js", category: "Backend Development", proficiency: 85, order: 1 },
      { name: "Express.js", category: "Backend Development", proficiency: 80, order: 2 },
      { name: "MongoDB", category: "Backend Development", proficiency: 75, order: 3 },
      { name: "PostgreSQL", category: "Backend Development", proficiency: 70, order: 4 },
      { name: "REST APIs", category: "Backend Development", proficiency: 85, order: 5 },

      // Programming Languages
      { name: "C", category: "Programming Languages", proficiency: 75, order: 1 },
      { name: "C++", category: "Programming Languages", proficiency: 80, order: 2 },
      { name: "JavaScript", category: "Programming Languages", proficiency: 90, order: 3 },
      { name: "TypeScript", category: "Programming Languages", proficiency: 80, order: 4 },
      { name: "Python", category: "Programming Languages", proficiency: 70, order: 5 },

      // Tools & Technologies
      { name: "Git", category: "Tools & Technologies", proficiency: 85, order: 1 },
      { name: "GitHub", category: "Tools & Technologies", proficiency: 85, order: 2 },
      { name: "VS Code", category: "Tools & Technologies", proficiency: 90, order: 3 },
      { name: "Postman", category: "Tools & Technologies", proficiency: 80, order: 4 },
      { name: "Docker", category: "Tools & Technologies", proficiency: 65, order: 5 },

      // CMS
      { name: "WordPress", category: "CMS", proficiency: 75, order: 1 },
      { name: "Blogger", category: "CMS", proficiency: 70, order: 2 },

      // Design Tools
      { name: "Canva", category: "Design Tools", proficiency: 80, order: 1 },
      { name: "Adobe Premiere Pro", category: "Design Tools", proficiency: 70, order: 2 },
      { name: "Camtasia", category: "Design Tools", proficiency: 75, order: 3 },

      // Other Skills
      { name: "SEO", category: "Other Skills", proficiency: 70, order: 1 },
      { name: "Digital Marketing", category: "Other Skills", proficiency: 65, order: 2 },
    ];
    await Skill.insertMany(skills);

    // Create experience (DUMMY DATA)
    console.log("Creating experience...");
    await Experience.create({
      company: "Tech Solutions Inc",
      role: "Senior Software Engineer",
      startDate: new Date("2020-01-01"),
      current: true,
      location: "San Francisco, CA",
      description:
        "Leading development of web applications and managing a team of developers. Working on scalable solutions for enterprise clients.",
      responsibilities: [
        "Lead development of web applications",
        "Manage and mentor junior developers",
        "Coordinate with clients and stakeholders",
        "Ensure code quality and best practices",
      ],
      skills: ["React", "Node.js", "MongoDB", "Team Management"],
      order: 1,
    });

    await Experience.create({
      company: "StartupXYZ",
      role: "Full Stack Developer",
      startDate: new Date("2018-06-01"),
      endDate: new Date("2019-12-31"),
      current: false,
      location: "Remote",
      description:
        "Developed and maintained full-stack applications using modern technologies. Collaborated with cross-functional teams to deliver high-quality products.",
      responsibilities: [
        "Developed RESTful APIs",
        "Built responsive frontend components",
        "Optimized database queries",
        "Participated in code reviews",
      ],
      skills: ["React", "Node.js", "PostgreSQL", "AWS"],
      order: 2,
    });

    // Create education (DUMMY DATA)
    console.log("Creating education...");
    await Education.create({
      institution: "University of Technology",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: new Date("2016-09-01"),
      endDate: new Date("2020-06-30"),
      current: false,
      grade: "3.8",
      location: "San Francisco, CA",
      description:
        "Completed Bachelor's degree in Computer Science with focus on software engineering and web development.",
      achievements: [
        "Dean's List",
        "Active member of programming club",
        "Participated in various hackathons",
      ],
      order: 1,
    });

    await Education.create({
      institution: "Tech High School",
      degree: "High School Diploma",
      field: "Science",
      startDate: new Date("2012-09-01"),
      endDate: new Date("2016-06-30"),
      gpa: "4.0",
      location: "San Francisco, CA",
      description: "Completed high school with excellent grades in Science and Mathematics.",
      achievements: ["GPA 4.0 out of 4.0", "Merit position in school"],
      order: 2,
    });

    // Create participation (DUMMY DATA)
    console.log("Creating participation...");
    await Participation.create({
      title: "Open Source Contributor",
      organization: "GitHub Community",
      role: "Active Contributor",
      startDate: new Date("2019-01-01"),
      current: true,
      location: "Remote",
      description:
        "Active contributor to various open-source projects. Collaborate with developers worldwide to improve software and share knowledge.",
      impact:
        "Contributed to 50+ open-source projects. Mentored new contributors and helped maintain popular repositories.",
      order: 1,
    });

    await Participation.create({
      title: "Tech Meetup Organizer",
      organization: "Local Developer Community",
      role: "Organizer",
      startDate: new Date("2020-03-01"),
      current: true,
      location: "San Francisco, CA",
      description:
        "Organize monthly tech meetups for local developers. Host talks, workshops, and networking events.",
      impact:
        "Organized 30+ successful meetups with 100+ attendees each. Helped build a strong local developer community.",
      order: 2,
    });

    // Create blogs (DUMMY DATA)
    console.log("Creating blogs...");
    const blogs = [
      {
        title: "Getting Started with Next.js 14",
        slug: "getting-started-with-nextjs-14",
        content: `# Getting Started with Next.js 14

Next.js 14 brings exciting new features and improvements. In this comprehensive guide, we'll explore the latest updates and how to get started.

## What's New in Next.js 14

Next.js 14 introduces several key features:
- Improved App Router
- Enhanced Server Components
- Better performance optimizations
- New developer experience improvements

## Installation

\`\`\`bash
npx create-next-app@latest my-app
\`\`\`

## Conclusion

Next.js 14 is a powerful framework for building modern web applications. Start exploring today!`,
        excerpt: "A comprehensive guide to getting started with Next.js 14 and its new features.",
        featuredImage: "https://via.placeholder.com/1200x600",
        author: "John Doe",
        tags: ["Next.js", "React", "Web Development"],
        category: "Web Development",
        published: true,
        publishedDate: new Date("2024-01-15"),
        readTime: 5,
        views: 1250,
        seo: {
          metaTitle: "Getting Started with Next.js 14 - Complete Guide",
          metaDescription: "Learn how to get started with Next.js 14 and explore its new features in this comprehensive guide.",
        },
      },
      {
        title: "Understanding React Hooks",
        slug: "understanding-react-hooks",
        content: `# Understanding React Hooks

React Hooks revolutionized how we write React components. Let's dive deep into understanding hooks.

## What are React Hooks?

React Hooks are functions that let you use state and other React features in functional components.

## Common Hooks

### useState
\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

### useEffect
\`\`\`javascript
useEffect(() => {
  // Side effects here
}, [dependencies]);
\`\`\`

## Best Practices

- Only call hooks at the top level
- Don't call hooks inside loops or conditions
- Use custom hooks to share logic

## Conclusion

React Hooks make functional components more powerful and easier to work with.`,
        excerpt: "A deep dive into React Hooks and how to use them effectively in your applications.",
        featuredImage: "https://via.placeholder.com/1200x600",
        author: "John Doe",
        tags: ["React", "JavaScript", "Frontend"],
        category: "Frontend Development",
        published: true,
        publishedDate: new Date("2024-02-10"),
        readTime: 8,
        views: 2100,
        seo: {
          metaTitle: "Understanding React Hooks - Complete Guide",
          metaDescription: "Learn everything about React Hooks and how to use them effectively in your React applications.",
        },
      },
      {
        title: "Building RESTful APIs with Node.js",
        slug: "building-restful-apis-with-nodejs",
        content: `# Building RESTful APIs with Node.js

Learn how to build robust RESTful APIs using Node.js and Express.

## Setting Up the Project

\`\`\`bash
npm init -y
npm install express mongoose
\`\`\`

## Creating Routes

\`\`\`javascript
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});
\`\`\`

## Error Handling

Proper error handling is crucial for production APIs.

## Security Best Practices

- Use authentication
- Validate input
- Rate limiting
- CORS configuration

## Conclusion

Building RESTful APIs with Node.js is straightforward with the right tools and practices.`,
        excerpt: "A guide to building secure and scalable RESTful APIs using Node.js and Express.",
        featuredImage: "https://via.placeholder.com/1200x600",
        author: "John Doe",
        tags: ["Node.js", "API", "Backend"],
        category: "Backend Development",
        published: true,
        publishedDate: new Date("2024-03-05"),
        readTime: 10,
        views: 1800,
        seo: {
          metaTitle: "Building RESTful APIs with Node.js - Complete Tutorial",
          metaDescription: "Learn how to build secure and scalable RESTful APIs using Node.js and Express framework.",
        },
      },
    ];
    await Blog.insertMany(blogs);

    // Create projects (DUMMY DATA)
    console.log("Creating projects...");
    const projects = [
      {
        title: "E-Commerce Platform",
        slug: "ecommerce-platform",
        description:
          "A full-stack e-commerce platform built with Next.js, Node.js, and MongoDB. Features include user authentication, product management, shopping cart, and payment integration.",
        image: "https://via.placeholder.com/800x600",
        techStack: ["Next.js", "Node.js", "MongoDB", "Stripe", "Tailwind CSS"],
        topics: ["E-Commerce", "Full Stack", "Payment Integration"],
        category: "Web Application",
        liveUrl: "https://example-ecommerce.com",
        githubUrl: "https://github.com/johndoe/ecommerce-platform",
        featured: true,
        published: true,
        source: "manual",
        dateCreated: new Date("2024-01-01"),
      },
      {
        title: "Task Management App",
        slug: "task-management-app",
        description:
          "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
        image: "https://via.placeholder.com/800x600",
        techStack: ["React", "Node.js", "Socket.io", "PostgreSQL"],
        topics: ["Productivity", "Real-time", "Collaboration"],
        category: "Web Application",
        liveUrl: "https://example-tasks.com",
        githubUrl: "https://github.com/johndoe/task-manager",
        featured: true,
        published: true,
        source: "manual",
        dateCreated: new Date("2023-11-15"),
      },
      {
        title: "Weather Dashboard",
        slug: "weather-dashboard",
        description:
          "A beautiful weather dashboard that displays current weather conditions and forecasts for multiple cities using a weather API.",
        image: "https://via.placeholder.com/800x600",
        techStack: ["React", "TypeScript", "OpenWeather API", "Chart.js"],
        topics: ["Weather", "API Integration", "Data Visualization"],
        category: "Web Application",
        liveUrl: "https://example-weather.com",
        githubUrl: "https://github.com/johndoe/weather-dashboard",
        featured: false,
        published: true,
        source: "manual",
        dateCreated: new Date("2023-09-20"),
      },
    ];
    await Project.insertMany(projects);

    // Create certificates (DUMMY DATA)
    console.log("Creating certificates...");
    const certificates = [
      {
        title: "Full Stack Web Development",
        issuer: "Tech Academy",
        category: "Web Development",
        issueDate: new Date("2023-06-15"),
        expiryDate: null,
        credentialId: "TECH-FSWD-2023-001",
        verificationUrl: "https://techacademy.com/verify/TECH-FSWD-2023-001",
        certificateImage: "https://via.placeholder.com/600x400",
        skills: ["React", "Node.js", "MongoDB", "Express"],
        description: "Comprehensive full-stack web development certification covering modern web technologies.",
        featured: true,
        published: true,
        order: 1,
      },
      {
        title: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        category: "Cloud Computing",
        issueDate: new Date("2023-03-10"),
        expiryDate: new Date("2026-03-10"),
        credentialId: "AWS-CSA-2023-ABC123",
        verificationUrl: "https://aws.amazon.com/verification",
        certificateImage: "https://via.placeholder.com/600x400",
        skills: ["AWS", "Cloud Architecture", "DevOps"],
        description: "AWS Certified Solutions Architect - Associate level certification.",
        featured: true,
        published: true,
        order: 2,
      },
      {
        title: "React Advanced Patterns",
        issuer: "Frontend Masters",
        category: "Frontend Development",
        issueDate: new Date("2023-09-01"),
        expiryDate: null,
        credentialId: "FEM-REACT-ADV-2023",
        verificationUrl: "https://frontendmasters.com/certificates",
        certificateImage: "https://via.placeholder.com/600x400",
        skills: ["React", "Advanced Patterns", "Performance Optimization"],
        description: "Advanced React patterns and performance optimization techniques.",
        featured: false,
        published: true,
        order: 3,
      },
    ];
    await Certificate.insertMany(certificates);

    console.log("Seed data created successfully!");
    console.log("Admin credentials:");
    console.log(
      "Email:",
      process.env.ADMIN_EMAIL || "ammarbinanwarfuad@gmail.com"
    );
    console.log("Password:", process.env.ADMIN_PASSWORD || "admin123");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();

