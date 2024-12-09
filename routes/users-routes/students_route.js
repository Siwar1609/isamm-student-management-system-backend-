import express from 'express'

import {
  createStudent,
  getStudent,
  getStudents,
  updateStudent,
  deleteStudent,
} from '../../controllers/users-controller/students_controller.js'
import { accessByRole } from '../../middlewares/users-middlewares/auth_controller.js'

const router = express.Router()

// students accounts management routes
router.get('/', accessByRole(['admin']), getStudents)
router.get('/:id', accessByRole(['admin']), getStudent)
router.post('/', accessByRole(['admin']), createStudent)
router.put('/:id', accessByRole(['admin']), updateStudent)
router.delete('/:id', accessByRole(['admin']), deleteStudent)

export default router