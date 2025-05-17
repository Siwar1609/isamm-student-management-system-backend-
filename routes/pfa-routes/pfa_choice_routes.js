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
  autoAllocatePFA,
  manualAssignPFA,
  sendEmailToRecipients,
  togglePublishPFA,
  list_pfa_by_teacher,
  sorted_pfa,
  manualAssignPFA2  // Added the manualAssignPFA2 import
} from '../../controllers/pfa-controller/choice_pfa_controller.js'

const choice_pfa_route = express.Router()

// choice_pfa_route.post(
//   '/:pfaId/assign',
//   accessByRole(['admin']),
//   manualAssignPFA,
// )
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

choice_pfa_route.get(
  '/teacher/:teacherId/pfas',
  loggedMiddleware,
  accessByRole(['student']),
  accessByLevel(['1']),
  list_pfa_by_teacher
)

// Add new route for sorted PFAs
choice_pfa_route.get(
  '/sorted',
  loggedMiddleware,
  accessByRole(['student']),
  accessByLevel(['1']),
  sorted_pfa
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
choice_pfa_route.post('/assign/:pfaId', accessByRole(['admin']), manualAssignPFA)
// Add the new route for manualAssignPFA2
choice_pfa_route.post('/assign2', accessByRole(['admin']), manualAssignPFA2)

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

//_____________________________________________admin ___________________________________________________________
choice_pfa_route.get(
  '/:id/pfachoices',
  accessByRole(['admin']),
  fetchStudentChoices,
)
choice_pfa_route.post('/allocate', accessByRole(['admin']), autoAllocatePFA)

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
