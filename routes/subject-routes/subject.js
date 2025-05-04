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
  getSubjectsByTeacher

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
router.get(
  '/:id',
  loggedMiddleware,
  accessByRole(['admin', 'student', 'teacher']),
  getSubjectbyID,
)
router.get(
  '/byteacher/:teacherId',  // Assure-toi que l'URL correspond à celle que tu veux
  loggedMiddleware,
  accessByRole(['admin', 'student', 'teacher']),
  getSubjectsByTeacher
);


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
router.patch(
  '/:id/proposition',
  loggedMiddleware,
  accessByRole(['teacher']),
  addProposition,
)
router.post(
  '/evaluation',
  loggedMiddleware,
  accessByRole(['admin']),
  sendEvaluationEmail,
)
router.post(
  '/:id/validate',
  loggedMiddleware,
  accessByRole(['admin']),
  validateProposition,
)

export default router
