import jwt from 'jsonwebtoken';

// Lightweight auth guard — checks for a valid JWT in the cookie or Authorization header
export function requireAuth(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      req.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
