import express from 'express'

import {
  createStudent,
  getStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  createStudentsAccountsExcelFile,
} from '../../controllers/users-controller/students_controller.js'
import { accessByRole } from '../../middlewares/users-middlewares/auth_controller.js'

const router = express.Router()

// students accounts management routes
// get all students
router.get('/', accessByRole(['admin']), getStudents)
// get a student by id
router.get('/:id', accessByRole(['admin']), getStudent)
// create a new student
router.post('/', accessByRole(['admin']), createStudent)
// update a student
router.put('/:id', accessByRole(['admin']), updateStudent)
// delete a student
router.delete('/:id', accessByRole(['admin']), deleteStudent)
// create an excel file with students accounts
router.post('/generate-students', createStudentsAccountsExcelFile)

export default router
