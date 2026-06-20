// src/middleware/auth.js
// Verifies JWT token on protected routes

const { verifyToken } = require('../services/tokenService');
const { errorResponse } = require('../utils/response');

function authenticate(req, res, next) {
  // Expect: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'No token provided', 401);
  }

  const token = authHeader.split(' ')[1];

  const decoded = verifyToken(token);
  if (!decoded) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }

  // Attach user info to request for downstream use
  req.user = decoded; // { id, email, role }
  next();
}

module.exports = authenticate;
