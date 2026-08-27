/**
 * MongoDB Atlas & Compass Mongoose Configuration
 * (database.js)
 */

const mongoose = require('mongoose');

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedPromise) {
    const atlasUri = process.env.MONGODB_URI;
    const localUri = 'mongodb://127.0.0.1:27017/mingling';

    const opts = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    if (atlasUri) {
      cachedPromise = mongoose.connect(atlasUri, opts).then((conn) => {
        console.log(`[DATABASE] Connected to MongoDB Atlas: ${conn.connection.host} (${conn.connection.name})`);
        return conn;
      }).catch(async (error) => {
        console.warn(`[DATABASE WARN] MongoDB Atlas connection failed (${error.message}). Trying local Compass fallback...`);
        return mongoose.connect(localUri, opts).then((conn) => {
          console.log(`[DATABASE] Connected to Local MongoDB (Compass): ${conn.connection.host} (${conn.connection.name})`);
          return conn;
        });
      }).catch((err) => {
        cachedPromise = null;
        console.error(`[DATABASE ERROR] MongoDB connection failed: ${err.message}`);
        throw err;
      });
    } else {
      cachedPromise = mongoose.connect(localUri, opts).then((conn) => {
        console.log(`[DATABASE] Connected to Local MongoDB (Compass): ${conn.connection.host} (${conn.connection.name})`);
        return conn;
      }).catch((err) => {
        cachedPromise = null;
        console.error(`[DATABASE ERROR] Local MongoDB connection failed: ${err.message}`);
        throw err;
      });
    }
  }

  return cachedPromise;
};

mongoose.connection.on('disconnected', () => {
  console.warn('[DATABASE WARNING] MongoDB disconnected. Attempting reconnection...');
  cachedPromise = null;
});

mongoose.connection.on('reconnected', () => {
  console.log('[DATABASE] MongoDB reconnected successfully.');
});

module.exports = connectDB;
