import {
  addInternship,
  updateInternship,
  getAllInternships,
  getInternshipById,
  deleteInternship,
  assignTeacherToInternship,
  updateTeacherForInternship,
} from '../../controllers/internship-period-controller/internship_controller.js'
import { getAllStudents } from '../../controllers/internship-period-controller/students_info.js'
import express from 'express'

import { isAdmin } from '../../middlewares/users-middlewares/auth_controller.js' //

const router = express.Router()

router.post('/add', isAdmin, addInternship)
router.put('/:id', isAdmin, updateInternship)
router.get('/:id', isAdmin, getInternshipById)
router.get('/', isAdmin, getAllInternships)
router.delete('/:id', isAdmin, deleteInternship)
// Act4
router.post('/:type/planning/assign ', isAdmin, assignTeacherToInternship)
router.patch('/:type/planning/update ', isAdmin, updateTeacherForInternship)


router.get('/students/all', isAdmin, getAllStudents)

export default router
