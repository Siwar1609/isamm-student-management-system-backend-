import {
  addInternship,
  updateInternship,
  getAllInternships,
  getInternshipById,
  deleteInternship,
} from '../../controllers/internship-period-controller/internship_period_controller.js'
import { getAllStudents } from '../../controllers/internship-period-controller/students_info.js'
import express from 'express'

import { isAdmin } from '../../middlewares/users-middlewares/auth_controller.js' //

const router = express.Router()

router.post('/open', isAdmin, addInternship)
router.put('/:id/open', isAdmin, updateInternship)
router.get('/:id', isAdmin, getInternshipById)
router.get('/', isAdmin, getAllInternships)
router.delete('/:id', isAdmin, deleteInternship)

router.get('/students/all', isAdmin, getAllStudents)

export default router
