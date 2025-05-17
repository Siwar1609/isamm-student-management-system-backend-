import express from 'express'

import { accessByRole ,authenticate  } from '../../middlewares/users-middlewares/auth_middleware.js'

import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getCurrentAdmin,
  updateCurrentAdmin,
  updateAdminPassword
} from '../../controllers/users-controller/users_controller.js'

const router = express.Router()

// Admin profile routes - add authenticate middleware
router.get('/me', authenticate, getCurrentAdmin)
router.patch('/me', authenticate,updateCurrentAdmin)
router.patch('/me/password', authenticate,updateAdminPassword)

// users accounts management routes
router.post('/', createUser)
router.get('/', accessByRole(['admin']), getUsers)
router.get('/:id', accessByRole(['admin']), getUser)
router.put('/:id', accessByRole(['admin']), updateUser)
router.delete('/:id', accessByRole(['admin']), deleteUser)

export default router
