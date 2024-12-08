import {
  fetchSubjects,
  getSubjectbyID,
  addSubject,
  updateSubject,
  deleteSubject,
} from '../../controllers/subject-controller/subject.js';
import express from 'express';

import { loggedMiddleware, accessByRole} from '../../middlewares/users-middlewares/auth_controller.js'

const router = express.Router();


router.get('/', loggedMiddleware, accessByRole(['admin']), fetchSubjects); 
router.get('/:id', loggedMiddleware, accessByRole(['admin']), getSubjectbyID); 

// Routes protégées par les permissions admin
router.post('/',loggedMiddleware, accessByRole(['admin']), addSubject);
router.patch('/:id', loggedMiddleware, accessByRole(['admin']), updateSubject); 
router.delete('/:id', loggedMiddleware, accessByRole(['admin']), deleteSubject); 

export default router;
