import {
  login,
  logout,
  signUp,
} from '../../controllers/users-controller/auth_controller.js'
import express from 'express'

const router = express.Router()

router.post('/signup', signUp)
router.post('/login', login)
router.post('/logout', logout)

export default router
