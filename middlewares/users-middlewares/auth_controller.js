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
    // Extract userId from the decoded token
    const userId = decodedToken.userId
    // extract role from the decoded token
    const role = decodedToken.role
    // Check if the user exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    // Add the user to the request object
    req.auth = user
    req.auth.role = role
    next()
  } catch (error) {
    return res
      .status(401)
      .json({ error: 'Invalid/expired token , please login' })
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
    console.log(payload)

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
