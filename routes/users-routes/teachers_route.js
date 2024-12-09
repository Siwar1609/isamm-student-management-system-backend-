import express from 'express'

import {
  getAllTeachers,
  getOneTeacher,
  createTeacher,
  updateOneTeacher,
  deleteOneTeacher,
} from '../../controllers/users-controller/teachers_controller.js'
import { accessByRole } from '../../middlewares/users-middlewares/auth_controller.js'

const router = express.Router()

// teachers accounts management routes
router.get('/', accessByRole(['admin']), getAllTeachers)
router.get('/:id', accessByRole(['admin']), getOneTeacher)
router.post('/', accessByRole(['admin']), createTeacher)
router.put('/:id', accessByRole(['admin']), updateOneTeacher)
router.delete('/:id', accessByRole(['admin']), deleteOneTeacher)

export default router