import {
  addInternship,
  updateInternship,
  getAllInternships,
  getInternshipById,
  deleteInternship,
} from '../../controllers/internship-period-controller/internship_period_controller.js'
import { getAllStudents } from '../../controllers/internship-period-controller/students_info.js'
import express from 'express'
import { accessByRole } from '../../middlewares/users-middlewares/auth_controller.js'

const router = express.Router()

router.post('/open', accessByRole(['admin']), addInternship)
router.put('/:id/open', accessByRole(['admin']), updateInternship)
router.get('/:id', accessByRole(['admin']), getInternshipById)
router.get('/', accessByRole(['admin']), getAllInternships)
router.delete('/:id', accessByRole(['admin']), deleteInternship)

router.get('/students/all', accessByRole(['admin']), getAllStudents)

export default router
