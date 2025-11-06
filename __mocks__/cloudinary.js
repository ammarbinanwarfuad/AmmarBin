/**
 * Mock for cloudinary
 */

const cloudinary = {
  v2: {
    config: jest.fn(),

    uploader: {
      upload: jest.fn((file, options) => {
        return Promise.resolve({
          public_id: options?.public_id || "mock-public-id-" + Date.now(),
          secure_url: `https://res.cloudinary.com/mock/image/upload/${options?.public_id || "mock-id"}.jpg`,
          url: `http://res.cloudinary.com/mock/image/upload/${options?.public_id || "mock-id"}.jpg`,
          format: options?.format || "jpg",
          width: 1920,
          height: 1080,
          bytes: 123456,
          created_at: new Date().toISOString(),
        });
      }),

      destroy: jest.fn((publicId) => {
        return Promise.resolve({
          result: "ok",
          public_id: publicId,
        });
      }),

      upload_stream: jest.fn((options, callback) => {
        const stream = {
          on: jest.fn(),
          end: jest.fn((buffer) => {
            if (callback) {
              callback(null, {
                public_id: options?.public_id || "mock-public-id",
                secure_url:
                  "https://res.cloudinary.com/mock/image/upload/mock-id.jpg",
              });
            }
          }),
        };
        return stream;
      }),
    },

    api: {
      resources: jest.fn(() => {
        return Promise.resolve({
          resources: [],
          rate_limit_allowed: 500,
          rate_limit_remaining: 499,
        });
      }),

      delete_resources: jest.fn((publicIds) => {
        return Promise.resolve({
          deleted: publicIds.reduce((acc, id) => {
            acc[id] = "deleted";
            return acc;
          }, {}),
        });
      }),
    },

    url: jest.fn((publicId, options) => {
      const transformation = options?.transformation || [];
      return `https://res.cloudinary.com/mock/image/upload/${publicId}.jpg`;
    }),
  },
};

module.exports = cloudinary;
