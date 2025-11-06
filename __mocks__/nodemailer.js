/**
 * Mock for nodemailer
 */

const nodemailer = {
  createTransport: jest.fn(() => ({
    sendMail: jest.fn((mailOptions) => {
      return Promise.resolve({
        messageId: "mock-message-id-" + Date.now(),
        accepted: [mailOptions.to],
        rejected: [],
        response: "250 Message accepted",
      });
    }),
    verify: jest.fn(() => Promise.resolve(true)),
    close: jest.fn(() => Promise.resolve()),
  })),
};

module.exports = nodemailer;
