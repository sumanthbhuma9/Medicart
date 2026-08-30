import mongoose from 'mongoose';

let isConnected = false;

export const isDbConnected = () => isConnected && mongoose.connection.readyState === 1;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('⚠️  No MONGO_URI provided in environment variables.');
    console.warn('ℹ️  Medicart API will run in resilient in-memory mode.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️  MongoDB connection notice: ${error.message}`);
    console.warn('ℹ️  Medicart API is operating in resilient in-memory mode (all routes & seed data active).');
    console.warn('ℹ️  To connect to MongoDB Atlas, ensure your IP address is whitelisted in Atlas Network Access (or use 0.0.0.0/0).');
    return false;
  }
};

export default connectDB;
