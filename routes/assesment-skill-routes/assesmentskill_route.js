import express from 'express';
import {
  evaluateSkill,
  getAssessmentById,
  getAssessment,
} from '../../controllers/skill-assesment-controller/skillAssesment_controller.js';

const router = express.Router();

router.post('/', evaluateSkill); 
router.get('/:id', getAssessmentById); 
router.get('/', getAssessment); 

export default router;
