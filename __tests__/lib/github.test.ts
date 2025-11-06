import { fetchGitHubRepos, getRepoTopics, GitHubRepo } from '@/lib/github'

// Mock fetch globally
global.fetch = jest.fn()

describe('GitHub Utility', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
    process.env = {
      ...originalEnv,
      GITHUB_PAT: 'ghp_test_token_123'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('fetchGitHubRepos', () => {
    const mockRepoData = [
      {
        name: 'test-repo-1',
        description: 'Test repository 1',
        html_url: 'https://github.com/testuser/test-repo-1',
        homepage: 'https://example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-11-01T00:00:00Z',
        language: 'TypeScript',
        stargazers_count: 10,
        forks_count: 2,
        owner: { login: 'testuser' }
      },
      {
        name: 'test-repo-2',
        description: 'Test repository 2',
        html_url: 'https://github.com/testuser/test-repo-2',
        homepage: '',
        created_at: '2024-02-01T00:00:00Z',
        updated_at: '2024-10-01T00:00:00Z',
        language: 'JavaScript',
        stargazers_count: 5,
        forks_count: 1,
        owner: { login: 'testuser' }
      }
    ]

    it('should fetch repositories with authentication', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockRepoData,
        headers: new Headers()
      })

      const repos = await fetchGitHubRepos('testuser')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.github.com/user/repos'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer ghp_test_token_123'
          })
        })
      )
      expect(repos).toHaveLength(2)
      expect(repos[0].name).toBe('test-repo-1')
    })

    it('should fetch public repositories without token', async () => {
      delete process.env.GITHUB_PAT
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockRepoData,
        headers: new Headers()
      })

      const repos = await fetchGitHubRepos('testuser')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.github.com/users/testuser/repos'),
        expect.not.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.anything()
          })
        })
      )
      expect(repos).toHaveLength(2)
    })

    it('should use Bearer format for fine-grained tokens', async () => {
      process.env.GITHUB_PAT = 'github_pat_fine_grained_token'
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockRepoData,
        headers: new Headers()
      })

      await fetchGitHubRepos('testuser')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer github_pat_fine_grained_token'
          })
        })
      )
    })

    it('should filter repos by owner username', async () => {
      const mixedOwnerRepos = [
        ...mockRepoData,
        {
          name: 'other-repo',
          description: 'Other user repo',
          html_url: 'https://github.com/otheruser/other-repo',
          homepage: '',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-11-01T00:00:00Z',
          language: 'Python',
          stargazers_count: 3,
          forks_count: 0,
          owner: { login: 'otheruser' }
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mixedOwnerRepos,
        headers: new Headers()
      })

      const repos = await fetchGitHubRepos('testuser')

      expect(repos).toHaveLength(2)
      expect(repos.every(repo => repo.html_url.includes('testuser'))).toBe(true)
    })

    it('should filter out forked repositories', async () => {
      const reposWithFork = [
        ...mockRepoData,
        {
          name: 'forked-repo',
          description: 'Forked repository',
          html_url: 'https://github.com/testuser/forked-repo',
          homepage: '',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-11-01T00:00:00Z',
          language: 'JavaScript',
          stargazers_count: 0,
          forks_count: 0,
          owner: { login: 'testuser' }
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => reposWithFork,
        headers: new Headers()
      })

      const repos = await fetchGitHubRepos('testuser')

      expect(repos).toHaveLength(2)
      expect(repos.find(repo => repo.name === 'forked-repo')).toBeUndefined()
    })

    it('should handle pagination correctly', async () => {
      const page1Data = Array(100).fill(null).map((_, i) => ({
        ...mockRepoData[0],
        name: `repo-${i}`,
        owner: { login: 'testuser' }
      }))

      const page2Data = Array(50).fill(null).map((_, i) => ({
        ...mockRepoData[0],
        name: `repo-${i + 100}`,
        owner: { login: 'testuser' }
      }))

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page1Data,
          headers: new Headers({ link: '<https://api.github.com/user/repos?page=2>; rel="next"' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page2Data,
          headers: new Headers()
        })

      const repos = await fetchGitHubRepos('testuser')

      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(repos.length).toBeGreaterThan(100)
    })

    it('should include required GitHub API headers', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockRepoData,
        headers: new Headers()
      })

      await fetchGitHubRepos('testuser')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
          })
        })
      )
    })

    it('should handle empty repository list', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
        headers: new Headers()
      })

      const repos = await fetchGitHubRepos('testuser')

      expect(repos).toEqual([])
    })

    it('should handle repositories with missing optional fields', async () => {
      const minimalRepo = [{
        name: 'minimal-repo',
        html_url: 'https://github.com/testuser/minimal-repo',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-11-01T00:00:00Z',
        stargazers_count: 0,
        forks_count: 0,
        owner: { login: 'testuser' }
      }]

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => minimalRepo,
        headers: new Headers()
      })

      const repos = await fetchGitHubRepos('testuser')

      expect(repos[0].description).toBe('')
      expect(repos[0].homepage).toBe('')
      expect(repos[0].language).toBe('')
      expect(repos[0].topics).toEqual([])
    })

    it('should throw error on API failure', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error'
      })

      await expect(
        fetchGitHubRepos('testuser')
      ).rejects.toThrow('GitHub API error')
    })

    it('should throw specific error on authentication failure', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Bad credentials'
      })

      await expect(
        fetchGitHubRepos('testuser')
      ).rejects.toThrow(/GitHub API authentication error/)
    })

    it('should throw specific error on permission failure', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => 'Insufficient permissions'
      })

      await expect(
        fetchGitHubRepos('testuser')
      ).rejects.toThrow(/GitHub API authentication error/)
    })

    it('should handle rate limit exceeded', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => 'API rate limit exceeded'
      })

      await expect(
        fetchGitHubRepos('testuser')
      ).rejects.toThrow()
    })

    it('should handle network timeout', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      )

      await expect(
        fetchGitHubRepos('testuser')
      ).rejects.toThrow()
    })

    it('should include cache control header', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockRepoData,
        headers: new Headers()
      })

      await fetchGitHubRepos('testuser')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          cache: 'no-store'
        })
      )
    })
  })

  describe('getRepoTopics', () => {
    const mockTopics = {
      names: ['typescript', 'nextjs', 'react', 'portfolio']
    }

    it('should fetch repository topics successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTopics
      })

      const topics = await getRepoTopics('testuser', 'test-repo')

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/testuser/test-repo/topics',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer ghp_test_token_123',
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
          })
        })
      )
      expect(topics).toEqual(['typescript', 'nextjs', 'react', 'portfolio'])
    })

    it('should return empty array when no token provided', async () => {
      delete process.env.GITHUB_PAT

      const topics = await getRepoTopics('testuser', 'test-repo')

      expect(global.fetch).not.toHaveBeenCalled()
      expect(topics).toEqual([])
    })

    it('should handle repository with no topics', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ names: [] })
      })

      const topics = await getRepoTopics('testuser', 'test-repo')

      expect(topics).toEqual([])
    })

    it('should return empty array on API failure', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Repository not found'
      })

      const topics = await getRepoTopics('testuser', 'test-repo')

      expect(topics).toEqual([])
    })

    it('should handle 403 forbidden gracefully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => 'Token missing repo scope'
      })

      const topics = await getRepoTopics('testuser', 'test-repo')

      expect(topics).toEqual([])
    })

    it('should handle network errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const topics = await getRepoTopics('testuser', 'test-repo')

      expect(topics).toEqual([])
    })

    it('should handle malformed API response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: 'structure' })
      })

      const topics = await getRepoTopics('testuser', 'test-repo')

      expect(topics).toEqual([])
    })

    it('should handle timeout with abort controller', async () => {
      jest.useFakeTimers()
      
      ;(global.fetch as jest.Mock).mockImplementation((_, options) => {
        return new Promise((_, reject) => {
          options.signal.addEventListener('abort', () => {
            reject(new Error('Aborted'))
          })
        })
      })

      const promise = getRepoTopics('testuser', 'test-repo')
      jest.advanceTimersByTime(6000)
      
      const topics = await promise

      expect(topics).toEqual([])
      jest.useRealTimers()
    })

    it('should use Bearer format for fine-grained tokens', async () => {
      process.env.GITHUB_PAT = 'github_pat_fine_grained'
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTopics
      })

      await getRepoTopics('testuser', 'test-repo')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer github_pat_fine_grained'
          })
        })
      )
    })
  })

  describe('Error Logging', () => {
    it('should log successful repo fetch', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [{ ...mockRepoData[0], owner: { login: 'testuser' } }],
        headers: new Headers()
      })

      await fetchGitHubRepos('testuser')

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 Fetched')
      )
      consoleSpy.mockRestore()
    })

    it('should log API errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Error',
        text: async () => 'Server error'
      })

      try {
        await fetchGitHubRepos('testuser')
      } catch (error) {
        // Expected
      }

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
