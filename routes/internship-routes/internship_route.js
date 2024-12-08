import {
  //addInternship,
  //updateInternship,
  //getAllInternships,
  //getInternshipById,
  //deleteInternship,
  publishOrMaskPlanning,
  sendInternshipPlanningEmail,
  createPeriod,
  getPeriodInfo,
  updatePeriodDates,
  createInternship,
  assignTeachersToInternship,
  updateInternshipPlanning,
} from '../../controllers/internship-period-controller/internship_controller.js'
import { getAllStudents } from '../../controllers/internship-period-controller/students_info.js'
import express from 'express'
import { accessByRole } from '../../middlewares/users-middlewares/auth_controller.js'

const router = express.Router()

//router.post('/open', accessByRole(['admin']), addInternship)
//router.put('/:id/open', accessByRole(['admin']), updateInternship)
//router.get('/:id', accessByRole(['admin']), getInternshipById)
//router.get('/', accessByRole(['admin']), getAllInternships)
//router.delete('/:id', accessByRole(['admin']), deleteInternship)

// Act4
router.post('/:type/planning/assign ',accessByRole(['admin']), assignTeachersToInternship)
router.patch('/:type/planning/update ', accessByRole(['admin']), updateInternshipPlanning)
router.patch('/:type/planning/publish/:response ', accessByRole(['admin']), publishOrMaskPlanning)
router.patch('/:type/planning/send ', accessByRole(['admin']), sendInternshipPlanningEmail)
router.post('/:type/open', accessByRole(['admin']), createPeriod)
router.get('/:type/open', accessByRole(['admin']), getPeriodInfo)
router.patch('/:type/open', accessByRole(['admin']), updatePeriodDates)
router.patch('/:type/submit', accessByRole(['admin']), createInternship)

router.post('/:type/submit', accessByRole(['admin']), createInternship)





router.get('/students/all', accessByRole(['admin']), getAllStudents)

export default router
