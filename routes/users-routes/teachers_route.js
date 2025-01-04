import express from 'express'

import {
  getAllTeachers,
  getOneTeacher,
  createTeacher,
  updateOneTeacher,
  deleteOneTeacher,
  createTeachersAccountsExcelFile,
  updateTeacherPassword,
} from '../../controllers/users-controller/teachers_controller.js'
import { accessByRole } from '../../middlewares/users-middlewares/auth_middleware.js'
import upload from '../../middlewares/file_upload_middleware.js'

const router = express.Router()

// teachers accounts management routes 📚
router.get('/', accessByRole(['admin']), getAllTeachers)
// get a teacher by id  🆔
router.get('/:id', accessByRole(['admin']), getOneTeacher)
// create a new teacher 📝
router.post('/', accessByRole(['admin']), createTeacher)
// update a teacher ✏️
router.put('/:id', accessByRole(['admin']), updateOneTeacher)
// update teacher's password
router.put(
  '/:id/password',
  accessByRole(['admin', 'teacher']),
  updateTeacherPassword,
)
// delete a teacher ⛔
router.delete('/:id', accessByRole(['admin']), deleteOneTeacher)
// create an excel file with teachers accounts 📄
router.post('/upload', upload.single('file'), createTeachersAccountsExcelFile)

export default router
