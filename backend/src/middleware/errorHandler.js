/**
 * Global Error Handler Middleware
 * (errorHandler.js)
 */

function errorHandler(err, req, res, next) {
  console.error('[SERVER ERROR]', err.stack || err);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Never expose stack trace in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Resource not found - ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
