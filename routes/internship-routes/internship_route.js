import {
  addInternship,
  updateInternship,
  getAllInternships,
  getInternshipById,
  deleteInternship,
} from '../../controllers/internship-period-controller/internship_controller.js'
import { getAllStudents } from '../../controllers/internship-period-controller/students_info.js'
import express from 'express'
import { accessByRole } from '../../middlewares/users-middlewares/auth_controller.js'

const router = express.Router()

router.post('/open', accessByRole(['admin']), addInternship)
router.put('/:id/open', accessByRole(['admin']), updateInternship)
router.get('/:id', accessByRole(['admin']), getInternshipById)
router.get('/', accessByRole(['admin']), getAllInternships)
router.delete('/:id', accessByRole(['admin']), deleteInternship)

// Act4
router.post('/:type/planning/assign ',accessByRole(['admin']), assignTeacherToInternship)
router.patch('/:type/planning/update ', accessByRole(['admin']), updateTeacherForInternship)
router.patch('/:type/planning/publish/:response ', accessByRole(['admin']), publishOrUnpublishInternshipPlanning)

router.get('/students/all', accessByRole(['admin']), getAllStudents)

export default router
