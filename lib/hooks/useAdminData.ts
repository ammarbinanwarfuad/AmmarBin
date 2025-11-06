// ⚡ Performance: SWR hooks for admin routes (10x faster navigation)
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { localStorageProvider } from '@/lib/swrLocalStorageProvider';

// SWR Configuration for admin routes
const adminConfig = {
  revalidateOnFocus: true,       // Refetch on tab focus for fresh data
  revalidateOnReconnect: true,   // Refetch on reconnect
  dedupingInterval: 1000,        // Dedupe requests within 1s (shorter for admin)
  refreshInterval: 0,            // No auto-refresh (manual only)
  keepPreviousData: true,        // ✅ Prevent flicker during updates
  provider: localStorageProvider, // ✅ Persist cache across reloads
};

// Projects Hook
export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR('/api/projects', fetcher, adminConfig);
  
  return {
    projects: data?.projects || [],
    isLoading,
    error,
    mutate,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

// Blogs Hook (including unpublished)
export function useBlogs() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/blog?includeUnpublished=true',
    fetcher,
    adminConfig
  );
  
  return {
    blogs: data?.blogs || [],
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

// Skills Hook
export function useSkills() {
  const { data, error, isLoading, mutate } = useSWR('/api/skills', fetcher, adminConfig);
  
  return {
    skills: data?.skills || [],
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

// Experience Hook
export function useExperiences() {
  const { data, error, isLoading, mutate } = useSWR('/api/experience', fetcher, adminConfig);
  
  return {
    experiences: data?.experiences || [],
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

// Education Hook
export function useEducation() {
  // Add admin query param to bypass cache
  const { data, error, isLoading, mutate } = useSWR('/api/education?admin=true', fetcher, adminConfig);
  
  return {
    education: data?.education || [],
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

// Certifications Hook
export function useCertifications() {
  const { data, error, isLoading, mutate } = useSWR('/api/certifications', fetcher, adminConfig);
  
  return {
    certificates: data?.certificates || [],
    stats: data?.stats || { total: 0, active: 0, expired: 0, categories: [] },
    isLoading,
    error,
    mutate,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

// Participation Hook
export function useParticipations() {
  const { data, error, isLoading, mutate} = useSWR('/api/participation', fetcher, adminConfig);
  
  return {
    participations: data?.participations || [],
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

// Messages Hook with polling for real-time updates
export function useMessages() {
  const { data, error, isLoading, mutate } = useSWR('/api/contact', fetcher, {
    ...adminConfig,
    refreshInterval: 5000, // Poll every 5 seconds for new messages
  });
  
  return {
    messages: data?.messages || [],
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

// Profile Hook
export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR('/api/profile', fetcher, adminConfig);
  
  return {
    profile: data?.profile || null,
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

// Activity Hook with polling for real-time updates
export function useActivity(entityType?: string, action?: string) {
  const queryParams = new URLSearchParams();
  if (entityType) queryParams.set("entityType", entityType);
  if (action) queryParams.set("action", action);
  const url = `/api/admin/activity${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    ...adminConfig,
    refreshInterval: 10000, // Poll every 10 seconds for new activity
  });
  
  return {
    activities: data?.activities || [],
    total: data?.total || 0,
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

// Media Hook
export function useMedia(resourceType?: string, search?: string) {
  const queryParams = new URLSearchParams();
  if (resourceType && resourceType !== "all") queryParams.set("resourceType", resourceType);
  if (search) queryParams.set("search", search);
  const url = `/api/admin/media${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, adminConfig);
  
  return {
    resources: data?.resources || [],
    total: data?.total || 0,
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

// Scheduled Tasks Hook
export function useScheduledTasks() {
  const { data, error, isLoading, mutate } = useSWR('/api/admin/scheduled-tasks', fetcher, adminConfig);
  
  return {
    tasks: data?.tasks || [],
    isLoading,
    error,
    refresh: () => mutate(undefined, { revalidate: true }),
  };
}

