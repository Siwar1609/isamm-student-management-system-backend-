import {
  submitEvaluation,
  getEvaluations, checkEvaluationStatus
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
router.get(
  '/check/:subjectID',
  loggedMiddleware, // Middleware qui vérifie que l'utilisateur est connecté
  checkEvaluationStatus
);
export default router
