import express from 'express';
import {
  evaluateSubject,  // Renamed function
  
} from '../../controllers/subject-assesment-controller/subjectAssesment_controller.js';

const router = express.Router();


router.post('/', evaluateSubject);  




export default router;
