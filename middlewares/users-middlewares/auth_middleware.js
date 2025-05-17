import jwt from 'jsonwebtoken'
import User from '../../models/users-models/user_model.js'

const JWT_SECRET = process.env.JWT_SECRET

export const loggedMiddleware = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token =
      req.headers.authorization && req.headers.authorization.split(' ')[1]

    // Check if the token is missing
    if (!token) {
      return res.status(401).json({ error: 'Token is required' })
    }
    // Verify the token and decode it
    const decodedToken = jwt.verify(token, JWT_SECRET)
    if (!decodedToken) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Extract userId and role from the decoded token
    const { userId, role, level } = decodedToken

    // Check if the user exists in the database
    const user = await User.findById(userId)
    if (!user) {
      return res.status(401).json({ error: 'Invalid token, user not found' })
    }

    // Add userId and role to the req.auth object
    req.auth = { userId, role, level }

    next()
  } catch (error) {
    console.error('Authentication error:', error.message)
    return res
      .status(401)
      .json({ error: 'Invalid/expired token, please login' })
  }
}

export const accessByRole = (roles) => async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({
      message: 'Access denied. No token provided. Please login to get a token',
    })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (!payload) {
      return res.status(401).json({ message: 'Invalid token' })
    }
    if (roles.includes(payload.role)) {
      return next()
    }
    return res.status(401).json({ message: 'Unauthorized' })
  } catch (e) {
    return res.status(401).json({ message: 'Invalid/expired token' })
  }
}

export const accessByLevel = (requiredLevel) => async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({
      message: 'Access denied. No token provided. Please login to get a token.',
    })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (!payload) {
      return res.status(401).json({ message: 'Invalid token.' })
    }

    // Vérification du niveau directement à partir du token
    if (String(payload.level) === String(requiredLevel)) {
      return next() // Autorisé
    }

    return res.status(403).json({
      message: `Unauthorized. Required level: ${requiredLevel}, your level: ${payload.level}.`,
    })
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid/expired token.',
      error: error.message,
    })
  }
}

// Update the authenticate middleware to properly extract user info
export const authenticate = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token found in Authorization header');
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('Token extraction failed');
      return res.status(401).json({ message: 'Authentication required. Invalid token format.' });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Attach the user info to the request object
    req.auth = decoded;
    req.userId = decoded.userId || decoded.id; // Make sure we capture the ID regardless of field name
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please login again.' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please login again.' });
    }
    
    res.status(401).json({ message: 'Authentication failed. Please login again.' });
  }
};
