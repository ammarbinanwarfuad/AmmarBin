/**
 * Mock for bcryptjs
 */

const bcrypt = {
  hash: jest.fn((password, _saltRounds) => {
    return Promise.resolve(`hashed_${password}`);
  }),

  compare: jest.fn((password, hash) => {
    // Mock successful comparison if hash starts with "hashed_"
    return Promise.resolve(hash === `hashed_${password}`);
  }),

  genSalt: jest.fn((rounds) => {
    return Promise.resolve(`$2a$${rounds}$mocksaltmocksaltmocksalt`);
  }),

  hashSync: jest.fn((password, _saltRounds) => {
    return `hashed_${password}`;
  }),

  compareSync: jest.fn((password, hash) => {
    return hash === `hashed_${password}`;
  }),

  genSaltSync: jest.fn((rounds) => {
    return `$2a$${rounds}$mocksaltmocksaltmocksalt`;
  }),
};

module.exports = bcrypt;
