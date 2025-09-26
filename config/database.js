import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI

    if (!uri) {
      console.log('No MONGODB_URI found - running without database')
      return
    }

    const conn = await mongoose.connect(uri)
    console.log('MongoDB Connected:', conn.connection.host)
    
  } catch (error) {
    console.error('Database connection failed:', error.message)
    process.exit(1)
  }
}

const closeDB = async () => {
  try {
    await mongoose.connection.close()
    console.log('MongoDB connection closed')
  } catch (error) {
    console.error('Error closing database:', error)
  }
}

export default connectDB
export { closeDB }
