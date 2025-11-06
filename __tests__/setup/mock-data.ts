import { ObjectId } from 'mongodb'

// Mock Project Data
export const mockProject = {
  _id: new ObjectId('507f1f77bcf86cd799439011'),
  title: 'Test Project',
  description: 'This is a test project description',
  longDescription: 'A longer description with more details about the project',
  techStack: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
  githubUrl: 'https://github.com/test/project',
  liveUrl: 'https://test-project.vercel.app',
  imageUrl: 'https://res.cloudinary.com/test/image.jpg',
  featured: true,
  published: true,
  tags: ['web', 'frontend'],
  dateCreated: new Date('2024-01-01'),
  dateUpdated: new Date('2024-01-15'),
}

export const mockUnpublishedProject = {
  ...mockProject,
  _id: new ObjectId('507f1f77bcf86cd799439012'),
  title: 'Unpublished Project',
  published: false,
}

// Mock Skill Data
export const mockSkill = {
  _id: new ObjectId('507f1f77bcf86cd799439013'),
  name: 'React',
  category: 'Frontend',
  proficiency: 90,
  icon: 'react-icon.svg',
}

// Mock Experience Data
export const mockExperience = {
  _id: new ObjectId('507f1f77bcf86cd799439014'),
  company: 'Test Company',
  position: 'Senior Developer',
  startDate: new Date('2023-01-01'),
  endDate: null,
  current: true,
  description: 'Working on amazing projects',
  technologies: ['React', 'Node.js'],
}

// Mock Education Data
export const mockEducation = {
  _id: new ObjectId('507f1f77bcf86cd799439015'),
  institution: 'Test University',
  degree: 'Bachelor of Computer Science',
  field: 'Computer Science',
  startDate: new Date('2019-01-01'),
  endDate: new Date('2023-05-01'),
  description: 'Studied computer science fundamentals',
}

// Mock Certificate Data
export const mockCertificate = {
  _id: new ObjectId('507f1f77bcf86cd799439016'),
  name: 'AWS Certified Developer',
  issuer: 'Amazon Web Services',
  dateIssued: new Date('2023-06-01'),
  credentialUrl: 'https://aws.amazon.com/verification/test',
  imageUrl: 'https://res.cloudinary.com/test/cert.jpg',
  published: true,
}

// Mock Blog Data
export const mockBlog = {
  _id: new ObjectId('507f1f77bcf86cd799439017'),
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  excerpt: 'This is a test blog excerpt',
  content: '# Test Blog\n\nThis is the content of the test blog post.',
  coverImage: 'https://res.cloudinary.com/test/blog.jpg',
  published: true,
  tags: ['testing', 'development'],
  datePublished: new Date('2024-01-01'),
  dateUpdated: new Date('2024-01-01'),
}

// Mock External Blog Data
export const mockExternalBlog = {
  _id: new ObjectId('507f1f77bcf86cd799439018'),
  title: 'External Blog Post',
  slug: 'external-blog-post',
  excerpt: 'This is an external blog excerpt',
  url: 'https://hashnode.dev/test-post',
  source: 'Hashnode',
  coverImage: 'https://hashnode.dev/image.jpg',
  datePublished: new Date('2024-01-01'),
  tags: ['hashnode', 'external'],
}

// Mock Message Data
export const mockMessage = {
  _id: new ObjectId('507f1f77bcf86cd799439019'),
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Test Message',
  message: 'This is a test message from the contact form',
  read: false,
  dateReceived: new Date('2024-01-01'),
}

// Mock User Data
export const mockUser = {
  _id: new ObjectId('507f1f77bcf86cd799439020'),
  email: 'admin@test.com',
  password: '$2a$10$XYZ...', // bcrypt hashed password
  name: 'Admin User',
  role: 'admin',
  createdAt: new Date('2023-01-01'),
}

// Mock Profile/Settings Data
export const mockProfile = {
  _id: new ObjectId('507f1f77bcf86cd799439021'),
  name: 'Ammar Bin Anwar',
  title: 'Full Stack Developer',
  email: 'contact@example.com',
  phone: '+1234567890',
  location: 'New York, USA',
  bio: 'Passionate developer with 5 years of experience',
  profileImage: 'https://res.cloudinary.com/test/profile.jpg',
  resumeUrl: 'https://res.cloudinary.com/test/resume.pdf',
  languages: 'English, Spanish, Arabic',
  hobbies: 'Coding, Reading, Gaming',
  socialLinks: {
    github: 'https://github.com/test',
    linkedin: 'https://linkedin.com/in/test',
    twitter: 'https://twitter.com/test',
  },
  heroContent: {
    heading: 'Hi, I\'m Ammar',
    subheading: 'Full Stack Developer',
    description: 'Building amazing web applications',
  },
}

// Mock Activity Log Data
export const mockActivity = {
  _id: new ObjectId('507f1f77bcf86cd799439022'),
  action: 'CREATE',
  entityType: 'Project',
  entityId: new ObjectId('507f1f77bcf86cd799439011'),
  userId: new ObjectId('507f1f77bcf86cd799439020'),
  details: 'Created project: Test Project',
  timestamp: new Date('2024-01-01'),
  ipAddress: '127.0.0.1',
}

// Mock Page View Data
export const mockPageView = {
  _id: new ObjectId('507f1f77bcf86cd799439023'),
  page: '/',
  timestamp: new Date('2024-01-01'),
  userAgent: 'Mozilla/5.0...',
  country: 'US',
  device: 'desktop',
}

// Mock Web Vital Data
export const mockWebVital = {
  _id: new ObjectId('507f1f77bcf86cd799439024'),
  name: 'LCP',
  page: '/',
  value: 1234,
  rating: 'good',
  timestamp: new Date('2024-01-01'),
}

// Helper function to create multiple mock items
export const createMockProjects = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    ...mockProject,
    _id: new ObjectId(),
    title: `Test Project ${i + 1}`,
  }))
}

export const createMockSkills = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    ...mockSkill,
    _id: new ObjectId(),
    name: `Skill ${i + 1}`,
  }))
}

export const createMockMessages = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    ...mockMessage,
    _id: new ObjectId(),
    subject: `Test Message ${i + 1}`,
  }))
}
