import express from 'express'

import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../../controllers/users-controller/users_controller.js'

const router = express.Router()

// users accounts management routes
router.get('/', getUsers)
router.get('/:id', getUser)
router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

// users accounts management routes
router.get('/', getUsers)
router.get('/:id', getUser)
router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

export default router
