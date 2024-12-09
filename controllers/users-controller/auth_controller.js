import User from '../../models/users-models/user_model.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import signUpValidator from '../../validators/signup_validator.js'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET
//signUp
export const signUp = async (req, res, next) => {
  const { error, value } = signUpValidator.validate(req.body)
  if (error) {
    return res.status(400).json({ message: error.message })
  }
  try {
    const hashedPassword = await bcrypt.hash(value.password, 10)
    // Mise à jour du mot de passe dans les données validées
    value.password = hashedPassword

    // Création de l'utilisateur
    const user = await User.create(value)
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

//login
export const login = async (req, res) => {
  /* 
    ***************************************
    the logic of the login function should be as follows:
    - get the email or cin  and password from the request body
    - check if the user exists in the database
    - if the user exists, check if the password is correct
    - if the password is correct, generate a JWT token and send it to the user
    - if the password is incorrect, send an error message to the user
    - if the user does not exist, send an error message to the user 

    the code below is a starting point for the login function, you need to complete it according to the logic described above
    ***************************************
  */
  try {
    /* the first part is login with cin */
    const user = await User.findOne({ cin: req.body.cin }).exec()

    if (!user) {
      return res.status(404).json({ message: 'cin or password is wrong' })
    }

    const match = await bcrypt.compare(req.body.password, user.password)

    if (!match) {
      return res.status(404).json({ message: 'password is incorrect' })
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '24h', // Set token expiration (e.g., 24 hours)
    })
    res.status(200).json({ token })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const logout = async (req, res) => {
  // Implement logout functionality
  try {
    // invalidate the token
    // Clear cookie
    res.clearCookie('token')
    res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Generate JWT token
// const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
//   expiresIn: '24h', // Set token expiration (e.g., 24 hours)
// })
// Send token as response
//   res.status(200).json({ token })
// } catch (error) {
//   // Handle any errors that occur
//   res.status(400).json({ message: error.message })
// }
