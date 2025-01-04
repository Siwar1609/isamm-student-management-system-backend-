import express from 'express'
import { accessByRole } from '../../middlewares/users-middlewares/auth_middleware.js'
import {
  approveChoicePFA,
  choose_pfa,
  getChoicesForProject,  fetchStudentChoices,togglePublishPFA,sendEmailToRecipients,manualAssignPFA
,autoAllocatePFA
} from '../../controllers/pfa-controller/choice_pfa_controller.js'

const choice_pfa_route = express.Router()

// ----------------------- Student Routes --------------------------------------------------------
choice_pfa_route.post('/:id/choice', accessByRole(['student']), choose_pfa)

choice_pfa_route.get(
  '/choices/:projectId',
  accessByRole(['teacher']),
  getChoicesForProject,
)

choice_pfa_route.post(
  '/:projectId/choice/:choiceId/approve',
  accessByRole(['teacher']),
  approveChoicePFA,
)
//_____________________________________________admin ___________________________________________________________
 choice_pfa_route.get('/:id/pfachoices', accessByRole(['admin']), fetchStudentChoices);
choice_pfa_route.post('/allocate', accessByRole(['admin']), autoAllocatePFA);
choice_pfa_route.post('/assign', accessByRole(['admin']), manualAssignPFA);
choice_pfa_route.patch('/:id/publish', accessByRole(['admin']), togglePublishPFA);
choice_pfa_route.post('/sendemail', accessByRole(['admin']), sendEmailToRecipients);


export default choice_pfa_route
