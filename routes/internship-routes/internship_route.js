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
  updatePlanningSoutenance,
  GetPlanningInfoForStudent,
} from '../../controllers/internship-controller/internship_controller.js'
import express from 'express'
import { accessByRole } from '../../middlewares/users-middlewares/auth_middleware.js'
import {
  getAllStudents,
  getStudentDetails,
  getStudentDetailsById,
} from '../../controllers/internship-controller/students_info.js'
import upload1 from '../../middlewares/internship_file_upload.js'
const router = express.Router()

router.post('/:type/open', accessByRole(['student']), upload1, addInternship)

router.patch(
  '/:id/open',
  accessByRole(['student', 'teacher']),
  upload1,
  updateInternship,
)
router.get('/:id', accessByRole(['admin']), getInternshipById)
router.get('/', accessByRole(['admin']), getAllInternships)
router.delete('/:id', accessByRole(['admin']), deleteInternship)
router.post(
  '/:type/planning/assign',
  accessByRole(['admin']),
  assignTeachersToInternship,
)
router.get('/planning/All', accessByRole(['admin']), fetchAllPlanning)
router.patch(
  '/:type/planning/update',
  accessByRole(['admin']),
  updateInternshipPlanning,
)
router.post(
  '/:type/planning/publish/:response',
  accessByRole(['admin']),
  publishOrMaskPlanning,
)
router.patch(
  '/:type/planning/publish/:response/:id',
  accessByRole(['admin']),
  publishOrMaskPlanningById,
)

router.post(
  '/:type/planning/send',
  accessByRole(['admin']),
  sendInternshipPlanningEmail,
)

router.get(
  '/:type/assigned-to-me',
  accessByRole(['teacher']),
  getAssignedInternshipTeacher,
)

router.patch(
  '/:type/:id',

  accessByRole(['teacher']),
  updatePlanningSoutenance,
)
router.get('/:type/me', accessByRole(['student']), GetPlanningInfoForStudent)

router.get('/students/all', accessByRole(['admin']), getAllStudents)
router.get('/me/student', accessByRole(['student']), getStudentDetails)
router.get(
  '/student/:studentId',
  accessByRole(['admin']),
  getStudentDetailsById,
)

router.get('/type/:type', accessByRole(['admin']), fetchInternshipsByType)
router.get('/nb/subject', accessByRole(['admin']), teachernbsubject)

export default router
