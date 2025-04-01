import {
  fetchCurriculums,
  getCurriculumByID,
  addCurriculum,
  updateCurriculum,
  deleteCurriculum,
  getCurriculumBySubject,
  addCurrToSubject,
} from '../../controllers/curriculum-controller/curriculum_controller.js'
import {
  accessByRole,
  loggedMiddleware,
} from '../../middlewares/users-middlewares/auth_middleware.js'

import express from 'express'

const router = express.Router()
router.get('/', loggedMiddleware, accessByRole(['admin']), fetchCurriculums)
router.get('/:id', loggedMiddleware, accessByRole(['admin']), getCurriculumByID)

router.post('/', loggedMiddleware, accessByRole(['admin']), addCurriculum)
router.patch(
  '/:id',
  loggedMiddleware,
  accessByRole(['admin']),
  updateCurriculum,
)
router.delete(
  '/:id',
  loggedMiddleware,
  accessByRole(['admin']),
  deleteCurriculum,
)
router.get(
  '/subject/:subjectId',
  loggedMiddleware,
  accessByRole(['admin', 'teacher']),
  getCurriculumBySubject,
)
router.post(
  '/subject/:subjectId',
  loggedMiddleware,
  accessByRole(['admin', 'teacher']),
  addCurrToSubject,
)

export default router
