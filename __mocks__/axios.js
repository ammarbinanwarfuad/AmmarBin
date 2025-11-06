/**
 * Mock for axios (GitHub API requests)
 */

const axios = {
  create: jest.fn(() => axios),

  get: jest.fn((url) => {
    // Mock GitHub API responses
    if (url.includes("/user/repos")) {
      return Promise.resolve({
        status: 200,
        data: [
          {
            id: 1,
            name: "test-repo",
            full_name: "user/test-repo",
            description: "A test repository",
            html_url: "https://github.com/user/test-repo",
            stargazers_count: 10,
            forks_count: 5,
            language: "JavaScript",
            topics: ["react", "typescript"],
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-15T00:00:00Z",
          },
        ],
      });
    }

    if (url.includes("/repos/") && url.includes("/topics")) {
      return Promise.resolve({
        status: 200,
        data: {
          names: ["react", "typescript", "nextjs"],
        },
      });
    }

    return Promise.resolve({ status: 200, data: {} });
  }),

  post: jest.fn(() => Promise.resolve({ status: 200, data: {} })),
  put: jest.fn(() => Promise.resolve({ status: 200, data: {} })),
  delete: jest.fn(() => Promise.resolve({ status: 200, data: {} })),
  patch: jest.fn(() => Promise.resolve({ status: 200, data: {} })),

  defaults: {
    headers: {
      common: {},
    },
  },

  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  },
};

module.exports = axios;
