import {
  addStudentDocument,
  getDocumentsByStudentId,
} from '../../controllers/document-controller/document_controller.js'
import express from 'express'

import {
  isAdmin,
  isStudent,
} from '../../middlewares/users-middlewares/auth_controller.js' //

const router = express.Router()

router.post('/documents/:id', isStudent, addStudentDocument)
router.get('/documents/:studentId', isAdmin, getDocumentsByStudentId)

export default router
