import express from 'express'

import {
  loggedMiddleware,
  accessByRole,
} from '../../middlewares/users-middlewares/auth_middleware.js'
import {
  evaluteStudentStatus,
  notifyOldStudents,
} from '../../controllers/users-controller/students_controller.js'

const router = express.Router()

// tested and working ✅ US 7.1
router.patch(
  '/student/:id',
  loggedMiddleware,
  accessByRole(['admin']),
  evaluteStudentStatus,
)

// not testes yet ⛔ US 7.2
// router.post('/', loggedMiddleware, accessByRole(['admin']), createAcademicYear)

// not testes yet ⛔ US 7.3
// router.delete('/:id', loggedMiddleware, accessByRole(['admin']), switchAcademicYear)

// tested and working ✅  US 8.1
router.post(
  '/notify',
  loggedMiddleware,
  accessByRole(['admin']),
  notifyOldStudents,
)
export default router
