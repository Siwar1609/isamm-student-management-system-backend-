import {
  fetchSubjects,
  getSubjectbyID,
  addSubject,
  updateSubject,
  deleteSubject,
  togglePublishSubject,
} from '../../controllers/subject-controller/subject.js';
import express from 'express';

import { loggedMiddleware, accessByRole} from '../../middlewares/users-middlewares/auth_controller.js'

const router = express.Router();


router.get('/', loggedMiddleware, fetchSubjects); 
router.get('/:id', loggedMiddleware, getSubjectbyID); 

// Routes protégées par les permissions admin
router.post('/',loggedMiddleware, accessByRole(['admin']), addSubject);
router.patch('/:id', loggedMiddleware, accessByRole(['admin']), updateSubject); 
router.delete('/:id', loggedMiddleware, accessByRole(['admin']), deleteSubject); 
router.post('/publish/:response', loggedMiddleware, accessByRole(['admin']),togglePublishSubject);


export default router;
