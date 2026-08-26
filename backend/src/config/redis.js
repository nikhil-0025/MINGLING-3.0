/**
 * Redis Connection & Memory Cache Fallback Manager
 * (redis.js)
 */

const Redis = require('ioredis');

let redisClient = null;
const inMemoryCache = new Map();

function initRedis() {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl && redisUrl.startsWith('redis')) {
    try {
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: () => null // Stop continuous retries if Redis is unavailable
      });

      redisClient.on('connect', () => {
        console.log('[REDIS] Connected to Redis server successfully.');
      });

      redisClient.on('error', (err) => {
        console.warn(`[REDIS WARNING] Redis unavailable: ${err.message}. Operating with high-performance in-memory cache.`);
        redisClient = null;
      });
    } catch (err) {
      console.warn(`[REDIS WARNING] Redis initialization error: ${err.message}.`);
      redisClient = null;
    }
  } else {
    console.log('[REDIS] REDIS_URL not configured. Operating with in-memory key-value cache.');
  }
}

initRedis();

const cacheManager = {
  async set(key, value, ttlSeconds = 86400) {
    const stringVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (redisClient) {
      try {
        await redisClient.set(key, stringVal, 'EX', ttlSeconds);
        return;
      } catch (err) {
        // Fallback
      }
    }
    inMemoryCache.set(key, {
      value: stringVal,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    });
  },

  async get(key) {
    if (redisClient) {
      try {
        const data = await redisClient.get(key);
        if (data) {
          try { return JSON.parse(data); } catch { return data; }
        }
      } catch (err) {
        // Fallback
      }
    }

    const item = inMemoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      inMemoryCache.delete(key);
      return null;
    }
    try { return JSON.parse(item.value); } catch { return item.value; }
  },

  async del(key) {
    if (redisClient) {
      try {
        await redisClient.del(key);
      } catch (err) {
        // Fallback
      }
    }
    inMemoryCache.delete(key);
  }
};

module.exports = cacheManager;
