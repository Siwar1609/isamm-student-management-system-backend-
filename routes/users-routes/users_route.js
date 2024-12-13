import express from 'express'

import { accessByRole } from '../../middlewares/users-middlewares/auth_middleware.js'

import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../../controllers/users-controller/users_controller.js'

const router = express.Router()

// users accounts management routes
router.post('/', createUser)
router.get('/', accessByRole(['admin']), getUsers)
router.get('/:id', accessByRole(['admin']), getUser)
router.put('/:id', accessByRole(['admin']), updateUser)
router.delete('/:id', accessByRole(['admin']), deleteUser)

export default router
