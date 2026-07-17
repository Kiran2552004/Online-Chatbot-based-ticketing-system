import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  try {
    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);

    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Not authorized as admin',
  });
};