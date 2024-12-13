import express from 'express'

import {
  createStudent,
  getStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  createStudentsAccountsExcelFile,
  updateStudentPassword,
} from '../../controllers/users-controller/students_controller.js'
import { accessByRole } from '../../middlewares/users-middlewares/auth_middleware.js'

import upload from '../../middlewares/file_upload_middleware.js'

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
// update student's password
router.put(
  '/:id/password',
  accessByRole(['admin', 'student']),
  updateStudentPassword,
)
// delete a student
router.delete('/:id', accessByRole(['admin']), deleteStudent)
// create an excel file with students accounts
router.post('/upload', upload.single('file'), createStudentsAccountsExcelFile)

export default router
