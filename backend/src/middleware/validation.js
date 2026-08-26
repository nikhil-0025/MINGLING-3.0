/**
 * Input Sanitization & Validation Middleware
 * (validation.js)
 */

const sanitizeHtml = require('sanitize-html');

function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Sanitize strings against XSS while preserving standard text
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [], // Strip all HTML tags by default for privacy & security
          allowedAttributes: {}
        }).trim();
      }
    }
  }
  next();
}

module.exports = {
  sanitizeInput
};
