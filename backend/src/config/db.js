const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/don-carlos-tourism';
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}

module.exports = connectDB;
