import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer: MongoMemoryServer

/**
 * Connect to in-memory MongoDB instance
 */
export const connectToMockDB = async () => {
  // Close any existing connections
  await mongoose.disconnect()

  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  await mongoose.connect(mongoUri)
}

/**
 * Drop database, close connection, and stop MongoDB instance
 */
export const closeMockDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  }
  
  if (mongoServer) {
    await mongoServer.stop()
  }
}

/**
 * Remove all data from all collections
 */
export const clearMockDB = async () => {
  const collections = mongoose.connection.collections

  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany({})
  }
}
