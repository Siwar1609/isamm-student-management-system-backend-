import {
  addInternship,
  updateInternship,
  getAllInternships,
  getInternshipById,
  deleteInternship,
  assignTeachersToInternship,
  updateInternshipPlanning,
  publishOrMaskPlanning,
  sendInternshipPlanningEmail,
  fetchInternshipsByType,
  teachernbsubject,
  fetchAllPlanning,
  publishOrMaskPlanningById,
  getAssignedInternshipTeacher,
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
router.post('/:type/planning/assign',accessByRole(['admin']), assignTeachersToInternship)
router.get('/planning/All',accessByRole(['admin']), fetchAllPlanning)
router.patch('/:type/planning/update', accessByRole(['admin']), updateInternshipPlanning)
router.post('/:type/planning/publish/:response', accessByRole(['admin']), publishOrMaskPlanning)
router.patch('/:type/planning/publish/:response/:id', accessByRole(['admin']), publishOrMaskPlanningById)

router.post('/:type/planning/send', accessByRole(['admin']), sendInternshipPlanningEmail)

router.get('/:type/assigned-to-me', accessByRole(['teacher']), getAssignedInternshipTeacher)

router.get('/students/all', accessByRole(['admin']), getAllStudents)


router.get('/type/:type', accessByRole(['admin']), fetchInternshipsByType)
router.get('/nb/subject', accessByRole(['admin']), teachernbsubject)





export default router
