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
  getInternshipsByStudentId,
  validateInternship,
} from '../../controllers/internship-controller/internship_controller.js'

import { scheduleStudentReminder } from '../../controllers/notifications-controller/student_reminder.js'
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
router.get('/:id', accessByRole(['student']), getInternshipById)
router.get('/', accessByRole(['admin', 'teacher']), getAllInternships)
router.delete('/:id', accessByRole(['student', 'admin']), deleteInternship)
router.get(
  '/student/:studentId',
  accessByRole(['student']),
  getInternshipsByStudentId,
)

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
router.patch('/:type/:id/valider',  accessByRole(['teacher']), validateInternship)

router.patch('/:type/:id', accessByRole(['teacher']), updatePlanningSoutenance)

router.get('/students/all', accessByRole(['admin']), getAllStudents)
router.get('/me/student', accessByRole(['student']), getStudentDetails)
router.get('/:type/me', accessByRole(['student']), GetPlanningInfoForStudent)
router.get('/students/all', accessByRole(['admin']), getAllStudents)

router.get(
  '/student/:studentId',
  accessByRole(['admin']),
  getStudentDetailsById,
)

router.get('/type/:type', accessByRole(['admin']), fetchInternshipsByType)
router.get('/nb/subject', accessByRole(['admin']), teachernbsubject)

router.post('/send-reminders', async (req, res) => {
  try {
    console.log('Admin triggered sending emails manually.')
    await scheduleStudentReminder() // Call the function here
    res.status(200).json({
      message: 'Emails sent successfully to students without internships.',
    })
  } catch (error) {
    console.error('Error sending reminders:', error)
    res.status(500).json({ message: 'Failed to send reminder emails.' })
  }
})


export default router
