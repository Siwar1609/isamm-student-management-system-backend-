import express from 'express'

import {
  getAllTeachers,
  getOneTeacher,
  createTeacher,
  updateOneTeacher,
  deleteOneTeacher,
} from '../../controllers/users-controller/teachers_controller.js'

const router = express.Router()

// teachers accounts management routes
router.get('/', getAllTeachers)
router.get('/:id', getOneTeacher)
router.post('/', createTeacher)
router.put('/:id', updateOneTeacher)
router.delete('/:id', deleteOneTeacher)

export default router
