import express from 'express'
import {
  createAcademicYear,
  deleteAcademicYear,
  fetchAcademicYear,
} from '../../controllers/academic-year-controller/academic_year.js'
import {
  loggedMiddleware,
  accessByRole,
} from '../../middlewares/users-middlewares/auth_middleware.js'

const router = express.Router()

router.post('/', loggedMiddleware, accessByRole(['admin']), createAcademicYear)
router.delete(
  '/:id',
  loggedMiddleware,
  accessByRole(['admin']),
  deleteAcademicYear,
)
router.get('/', loggedMiddleware, accessByRole(['admin']), fetchAcademicYear)

export default router
