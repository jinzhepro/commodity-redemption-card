import mongoose from 'mongoose';

/**
 * 连接MongoDB数据库
 * @returns {Promise<typeof mongoose>} mongoose实例
 */
const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      return mongoose;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return mongoose;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;