/**
 * Rate Limiter Middleware
 * (rateLimiter.js)
 */

const rateLimit = require('express-rate-limit');

// General API Rate Limiter: Max 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Strict Limiter for Session Creation & File Uploads: Max 15 requests per 15 minutes
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded for sensitive operation. Please wait.'
  }
});

module.exports = {
  apiLimiter,
  strictLimiter
};
