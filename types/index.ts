import { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  lastLogin?: Date;
  lastLoginIp?: string;
  loginAttempts?: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProfile extends Document {
  name: string;
  title: string;
  bio: string;
  profileImage: string;
  resumePDF: string;
  email: string;
  phone: string;
  location: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    hashnode?: string;
    portfolio?: string;
  };
  heroContent: {
    heading: string;
    subheading: string;
    description: string;
  };
  aboutContent: string;
  languages: string[];
  hobbies: string[];
  updatedAt: Date;
}

export interface ISkill extends Document {
  name: string;
  category: string;
  proficiency: number;
  icon?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject extends Document {
  title: string;
  slug: string;
  description: string;
  image: string;
  techStack: string[];
  topics?: string[];
  category: string;
  liveUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  featured: boolean;
  published: boolean;
  source: string;
  dateCreated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExperience extends Document {
  company: string;
  companyLogo?: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  location: string;
  description: string;
  responsibilities: string[];
  skills: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEducation extends Document {
  institution: string;
  institutionLogo?: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  grade?: string;
  location?: string;
  description?: string;
  achievements?: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IParticipation extends Document {
  title: string;
  organization: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  location?: string;
  description: string;
  impact?: string;
  images?: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICertificate extends Document {
  title: string;
  issuer: string;
  category: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  verificationUrl?: string;
  certificateImage?: string;
  skills?: string[];
  description?: string;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  author: string;
  tags: string[];
  category: string;
  published: boolean;
  publishedDate: Date;
  readTime: number;
  views: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IExternalBlog extends Document {
  source: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  author: string;
  url: string;
  publishedDate: Date;
  readTime: number;
  tags: string[];
  lastFetched: Date;
  createdAt: Date;
}

export interface IMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  replied: boolean;
  createdAt: Date;
}

export interface ISetting extends Document {
  key: string;
  value: unknown;
  updatedAt: Date;
}

