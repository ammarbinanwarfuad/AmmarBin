export interface GitHubRepo {
  name: string;
  description: string;
  html_url: string;
  homepage: string;
  created_at: string;
  updated_at: string;
  language: string;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
}

interface GitHubApiRepoResponse {
  name: string;
  description: string;
  html_url: string;
  homepage: string;
  created_at: string;
  updated_at: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  owner?: {
    login: string;
  };
}

export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  const token = process.env.GITHUB_PAT;
  const API_TIMEOUT = 30000; // 30 seconds (increased for pagination)
  const PER_PAGE = 100;

  try {
    // If token exists, use /user/repos to fetch ALL repos (public + private)
    // Otherwise, fall back to /users/{username}/repos for public only
    const baseUrl = token 
      ? `https://api.github.com/user/repos` // Returns ALL repos (public + private) for authenticated user
      : `https://api.github.com/users/${username}/repos`; // Public repos only

    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    if (token) {
      headers.Authorization = token.startsWith('ghp_') || token.startsWith('github_pat_') 
        ? `Bearer ${token}` 
        : `token ${token}`;
    }

    // Fetch all pages (GitHub limits to 100 per page)
    let allRepos: GitHubRepo[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const url = `${baseUrl}?sort=updated&per_page=${PER_PAGE}&page=${page}&affiliation=owner`;
      
      const response = await fetch(url, {
        headers,
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`GitHub API error: ${response.status} ${response.statusText}`, errorText);
        
        // If 401/403 with token, it might be a permission issue
        if (token && (response.status === 401 || response.status === 403)) {
          throw new Error(`GitHub API authentication error: ${response.status}. Check your token permissions. Fine-grained tokens need 'Metadata: Read' and 'Contents: Read' permissions for repositories.`);
        }
        
        throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
      }

      const repos: GitHubApiRepoResponse[] = await response.json();
      
      // Filter repos by username if using /user/repos endpoint
      // This ensures we only get repos owned by the specified username
      const filteredByOwner = token 
        ? repos.filter((repo) => {
            // Extract owner from owner.login field (GitHub API includes this)
            const repoOwner = repo.owner?.login?.toLowerCase() || 
                             repo.html_url?.split('/')[3]?.toLowerCase();
            return repoOwner === username.toLowerCase();
          })
        : repos;

      // Convert to GitHubRepo format
      const formattedRepos: GitHubRepo[] = filteredByOwner.map((repo) => ({
        name: repo.name,
        description: repo.description || "",
        html_url: repo.html_url,
        homepage: repo.homepage || "",
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        language: repo.language || "",
        topics: [], // Topics are fetched separately
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
      }));
      
      allRepos = allRepos.concat(formattedRepos);

      // Check if there are more pages
      const linkHeader = response.headers.get('link');
      hasMore = linkHeader?.includes('rel="next"') || false;
      
      if (repos.length < PER_PAGE) {
        hasMore = false; // Last page
      }

      page++;
      
      // Safety limit to prevent infinite loops
      if (page > 100) {
        console.warn(`⚠️ Reached page limit (100). You may have more than ${100 * PER_PAGE} repositories.`);
        break;
      }
    }

    // Filter out forks
    const filtered = allRepos.filter((repo) => !repo.name.toLowerCase().includes("fork"));
    console.log(`📦 Fetched ${filtered.length} repositories (filtered from ${allRepos.length} total, ${token ? 'including private repos' : 'public repos only'})`);
    return filtered;
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    throw error; // Re-throw to let caller handle
  }
}

export async function getRepoTopics(
  owner: string,
  repo: string
): Promise<string[]> {
  const token = process.env.GITHUB_PAT;
  const API_TIMEOUT = 5000; // 5 seconds

  if (!token) {
    console.warn(`No GitHub token provided - cannot fetch topics for ${owner}/${repo}`);
    return [];
  }

  try {
    // ⚡ Performance: Add timeout to external API calls
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    // Topics endpoint requires authentication - try both token formats
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/topics`,
      {
        headers: {
          // Try token format first (older tokens), then Bearer
          Authorization: token.startsWith('ghp_') || token.startsWith('github_pat_') 
            ? `Bearer ${token}` 
            : `token ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(
        `Failed to fetch topics for ${owner}/${repo}: ${response.status} ${response.statusText}`,
        errorText
      );
      
      // If 403, token might not have repo scope
      if (response.status === 403) {
        console.error(`⚠️ 403 Forbidden - Your GitHub token may not have 'repo' scope for ${owner}/${repo}`);
      }
      
      return [];
    }

    const data = await response.json();
    // Response shape: { names: string[] }
    const topics = Array.isArray(data?.names) ? data.names : [];
    
    if (topics.length > 0) {
      console.log(`✅ Found ${topics.length} topics for ${owner}/${repo}:`, topics);
    } else {
      console.log(`ℹ️ No topics found for ${owner}/${repo} (repo may not have topics set)`);
    }
    
    return topics;
  } catch (error) {
    console.error(`Error fetching repo topics for ${owner}/${repo}:`, error);
    return [];
  }
}

