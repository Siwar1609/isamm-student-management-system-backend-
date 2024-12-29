import {
  fetchSubjects,
  getSubjectbyID,
  addSubject,
  updateSubject,
  deleteSubject,
  togglePublishSubject,
  addProposition,
  validateProposition,
  sendEvaluationEmail,
  
} from '../../controllers/subject-controller/subject.js'
import express from 'express'

import {
  loggedMiddleware,
  accessByRole,
} from '../../middlewares/users-middlewares/auth_middleware.js'

const router = express.Router()

router.get(
  '/',
  loggedMiddleware,
  accessByRole(['admin', 'teacher', 'student']),
  fetchSubjects,
)
router.get('/:id', loggedMiddleware, accessByRole(['admin','student']), getSubjectbyID)

// Routes protégées par les permissions admin
router.post('/', loggedMiddleware, accessByRole(['admin']), addSubject)
router.patch('/:id', loggedMiddleware, accessByRole(['admin']), updateSubject)
router.delete('/:id', loggedMiddleware, accessByRole(['admin']), deleteSubject)
router.post(
  '/publish/:response',
  loggedMiddleware,
  accessByRole(['admin']),
  togglePublishSubject,
)
router.patch('/:id/proposition',addProposition)
router.post('/evaluation', loggedMiddleware, accessByRole(['admin']), sendEvaluationEmail);
router.post('/:id/validate',validateProposition);

export default router
