import {
  addStudentDocument,
  getDocumentsByStudentId,
  getAllDocuments,
} from '../../controllers/document-controller/document_controller.js'
import express from 'express'
import { accessByRole } from '../../middlewares/users-middlewares/auth_middleware.js'

const router = express.Router()

router.post('/documents/:id', accessByRole(['student']), addStudentDocument)
router.get(
  '/documents/:studentId',
  accessByRole(['admin']),
  getDocumentsByStudentId,
)
router.get('/documents', accessByRole(['admin']), getAllDocuments)

export default router
