import {
  addInternship,
  updateInternship,
  getAllInternships,
  getInternshipById,
  deleteInternship,
} from '../../controllers/internship-controller/internship_controller.js'
import express from 'express'
import { accessByRole } from '../../middlewares/users-middlewares/auth_controller.js'
import { getAllStudents } from '../../controllers/internship-controller/students_info.js'

const router = express.Router()

router.post('/:type/open', accessByRole(['admin']), addInternship)
router.put('/:id/open', accessByRole(['admin']), updateInternship)
router.get('/:id', accessByRole(['admin']), getInternshipById)
router.get('/', accessByRole(['admin']), getAllInternships)
router.delete('/:id', accessByRole(['admin']), deleteInternship)

router.get('/students/all', accessByRole(['admin']), getAllStudents)

export default router
