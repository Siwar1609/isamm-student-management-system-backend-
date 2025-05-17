import express from 'express'
import {
  createAcademicYear,
  fetchAcademicYear,
  fetchPendingAcademicYear,
} from '../../controllers/academic-year-controller/academic_year.js'
import {
  openNewSeason,
  switchAcademicYear,
  getCurrentAcademicYear,
  deleteAcademicYear // Make sure this is imported from years_controller.js
} from '../../controllers/academic-year-controller/years_controller.js'
import {
  loggedMiddleware,
  accessByRole,
} from '../../middlewares/users-middlewares/auth_middleware.js'

const router = express.Router()

// Academic year management routes
router.post('/', loggedMiddleware, accessByRole(['admin']), createAcademicYear)
// Add this route for deleting an academic year
router.delete('/delete/:academicYearId', loggedMiddleware, accessByRole(['admin']), deleteAcademicYear);
router.get('/', fetchAcademicYear)
router.get('/pending', fetchPendingAcademicYear)
router.get('/current', getCurrentAcademicYear)

// Season management routes
router.post('/new-season', loggedMiddleware, accessByRole(['admin']), openNewSeason)
router.post('/switch', loggedMiddleware, accessByRole(['admin']), switchAcademicYear)

export default router
