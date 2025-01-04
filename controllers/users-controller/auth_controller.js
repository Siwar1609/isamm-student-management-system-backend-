import User from '../../models/users-models/user_model.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

//login
export const login = async (req, res) => {
  try {
    /* the first part is login with cin */
    const user = await User.findOne({ cin: req.body.cin }).exec()

    if (!user) {
      return res.status(404).json({ message: 'cin or password is wrong' })
    }

    console.log('*********** 1', user)

    const match = await bcrypt.compare(req.body.password, user.password)
    
    console.log('*********** 2', match)

    if (!match) {
      return res.status(404).json({ message: 'password is incorrect' })
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, level: user.level },
      JWT_SECRET,
      {
        expiresIn: '24h', // Set token expiration (e.g., 24 hours)
      },
    )

    console.log('*********** 3', token)

    res.status(200).json({ token })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie('token')
    res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
