// ⚡ Performance: Optimized fetcher for SWR
export const fetcher = async (url: string) => {
  const cacheOptions: RequestInit = {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  };
  
  const res = await fetch(url, cacheOptions);
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }
  
  return res.json();
};

