import express from 'express';
import {
  createAcademicYear,
 
} from '../../controllers/academic-year-controller/academic_year.js';

const router = express.Router();

router.post('/', createAcademicYear);


export default router;
