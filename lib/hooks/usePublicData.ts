// ⚡ Performance: SWR hooks for public routes
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

// SWR Configuration for public routes (longer cache, less frequent revalidation)
const publicConfig = {
  revalidateOnFocus: false,      // Don't refetch on tab focus (public data doesn't change often)
  revalidateOnReconnect: false,   // Don't refetch on reconnect
  dedupingInterval: 5000,         // Dedupe requests within 5s
  refreshInterval: 0,             // No auto-refresh
  keepPreviousData: true,         // Prevent flicker during updates
  revalidateIfStale: false,       // Use cached data if available
};

// Blog Hook (for public pages)
interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: string;
  publishedDate: Date;
  readTime: number;
  tags: string[];
  createdAt: Date;
}

export function useBlog(slug?: string) {
  const url = slug ? `/api/blog?slug=${slug}` : '/api/blog';
  const { data, error, isLoading, mutate } = useSWR<{ blog?: Blog; blogs?: Blog[] }>(url, fetcher, publicConfig);
  
  return {
    blog: data?.blog || null,
    blogs: data?.blogs || [],
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

// Participation Hook (for public pages)
interface Participation {
  _id: string;
  programName: string;
  organization: string;
  role: string;
  startDate: Date;
  endDate: Date;
  location: string;
  description: string;
  impact: string;
  images: string[];
}

export function useParticipations() {
  const { data, error, isLoading, mutate } = useSWR<{ participations: Participation[] }>('/api/participation', fetcher, publicConfig);
  
  return {
    participations: data?.participations || [],
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

// Projects Hook (for public pages)
export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR('/api/projects', fetcher, publicConfig);
  
  return {
    projects: data?.projects || [],
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

// Education Hook (for public pages)
export function useEducation() {
  const { data, error, isLoading, mutate } = useSWR('/api/education', fetcher, publicConfig);
  
  return {
    education: data?.education || [],
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

// Experience Hook (for public pages)
export function useExperiences() {
  const { data, error, isLoading, mutate } = useSWR('/api/experience', fetcher, publicConfig);
  
  return {
    experiences: data?.experiences || [],
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

// Certifications Hook (for public pages)
export function useCertifications() {
  const { data, error, isLoading, mutate } = useSWR('/api/certifications', fetcher, publicConfig);
  
  return {
    certificates: data?.certificates || [],
    stats: data?.stats || { total: 0, active: 0, expired: 0, categories: [] },
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

