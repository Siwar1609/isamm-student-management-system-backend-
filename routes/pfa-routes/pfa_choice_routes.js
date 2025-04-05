import express from 'express'
import {
  accessByRole,
  accessByLevel,
  loggedMiddleware,
} from '../../middlewares/users-middlewares/auth_middleware.js'
import {
  approveChoicePFA,
  choose_pfa,
  getChoicesForProject,
  InformApproval,
  fetchStudentChoices,
  togglePublishPFA,
  sendEmailToRecipients,
  manualAssignPFA,
  autoAllocatePFA,
} from '../../controllers/pfa-controller/choice_pfa_controller.js'

const choice_pfa_route = express.Router()

// ----------------------- Student Routes --------------------------------------------------------
choice_pfa_route.patch(
  '/:choiceId',
  loggedMiddleware,
  accessByRole(['student']),
  accessByLevel(['1']),
  InformApproval,
)

choice_pfa_route.post(
  '/:id/choice',
  loggedMiddleware,
  accessByRole(['student']),
  accessByLevel(['1']),
  choose_pfa,
)

// -------------------- Teacher Routes ----------------------------------
choice_pfa_route.get(
  '/choices/:projectId',
  loggedMiddleware,
  accessByRole(['teacher']),
  getChoicesForProject,
)

choice_pfa_route.patch(
  '/:projectId/choice/:choiceId/approve',
  loggedMiddleware,
  accessByRole(['teacher']),
  approveChoicePFA,
)
//_____________________________________________admin ___________________________________________________________
choice_pfa_route.get(
  '/:id/pfachoices',
  accessByRole(['admin']),
  fetchStudentChoices,
)
choice_pfa_route.post('/allocate', accessByRole(['admin']), autoAllocatePFA)
choice_pfa_route.post('/assign', accessByRole(['admin']), manualAssignPFA)
choice_pfa_route.patch(
  '/:id/publish',
  accessByRole(['admin']),
  togglePublishPFA,
)
choice_pfa_route.post(
  '/sendemail',
  accessByRole(['admin']),
  sendEmailToRecipients,
)

export default choice_pfa_route
