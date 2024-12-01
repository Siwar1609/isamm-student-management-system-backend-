import express from 'express'

import {
  createStudent,
  getStudent,
  getStudents,
  updateStudent,
  deleteStudent,
} from '../../controllers/users-controller/students_controller.js'

const router = express.Router()

// students accounts management routes
router.get('/', getStudents)
router.get('/:id', getStudent)
router.post('/', createStudent)
router.put('/:id', updateStudent)
router.delete('/:id', deleteStudent)

export default router
