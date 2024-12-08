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
      return res.status(401).json({ error: 'No token provided' })
    }

    // Verify the token and decode it
    const decodedToken = jwt.verify(token, JWT_SECRET)

    // Extract userId from the decoded token
    const userId = decodedToken.userId

    // Fetch the user by userId
    const user = await User.findById(userId)

    // If user is found, attach user info to the request object
    if (user) {
      req.auth = {
        userId: userId,
        role: user.role,
      }
      next() // Proceed to the next middleware or route handler
    } else {
      return res.status(401).json({ error: 'User does not exist' })
    }
  } catch (error) {
    // General error handling
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' })
    }
    res.status(500).json({ error: error.message })
  }
}

export const isAdmin = (req, res, next) => {
  try {
    if (req.auth.role === 'admin') {
      next()
    } else {
      res.status(403).json({ error: 'no access to this route' })
    }
  } catch (e) {
    res.status(401).json({ error: error.message })
  }
}

export const isStudent = (req, res, next) => {
  try {
    if (req.auth.role === 'etudiant') {
      next()
    } else {
      res.status(403).json({ error: 'no access to this route' })
    }
  } catch (e) {
    res.status(401).json({ error: error.message })
  }
}

export const isTeacher = (req, res, next) => {
  try {
    if (req.auth.role === 'enseignant') {
      next()
    } else {
      res.status(403).json({ error: 'no access to this route' })
    }
  } catch (e) {
    res.status(401).json({ error: error.message })
  }
}
