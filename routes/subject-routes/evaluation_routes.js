import {
  submitEvaluation,
  getEvaluations,
} from '../../controllers/subject-controller/evaluation_controller.js'

import express from 'express'

import {
  loggedMiddleware,
  accessByRole,
} from '../../middlewares/users-middlewares/auth_middleware.js'

const router = express.Router()
router.post(
  '/:subjectID',
  loggedMiddleware,
  accessByRole(['student']),
  submitEvaluation,
)
router.get(
  '/',
  loggedMiddleware,
  accessByRole(['teacher', 'admin']),
  getEvaluations,
)
export default router
