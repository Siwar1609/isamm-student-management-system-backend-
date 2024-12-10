import express from 'express'

import {
  getAllTeachers,
  getOneTeacher,
  createTeacher,
  updateOneTeacher,
  deleteOneTeacher,
  createTeachersAccountsExcelFile,
} from '../../controllers/users-controller/teachers_controller.js'
import { accessByRole } from '../../middlewares/users-middlewares/auth_controller.js'

const router = express.Router()

// teachers accounts management routes 📚
router.get('/', accessByRole(['admin']), getAllTeachers)
// get a teacher by id  🆔
router.get('/:id', accessByRole(['admin']), getOneTeacher)
// create a new teacher 📝
router.post('/', accessByRole(['admin']), createTeacher)
// update a teacher ✏️
router.put('/:id', accessByRole(['admin']), updateOneTeacher)
// delete a teacher ⛔
router.delete('/:id', accessByRole(['admin']), deleteOneTeacher)
// create an excel file with teachers accounts 📄
router.post('/generate-teachers', createTeachersAccountsExcelFile)

export default router
