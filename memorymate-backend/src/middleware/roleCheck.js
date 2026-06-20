// src/middleware/roleCheck.js
// Restricts routes to specific user roles

const { errorResponse } = require('../utils/response');

// Usage: router.get('/route', authenticate, requireRole('CAREGIVER'), handler)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Not authenticated', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, `Access denied. Required role: ${roles.join(' or ')}`, 403);
    }

    next();
  };
}

module.exports = { requireRole };
