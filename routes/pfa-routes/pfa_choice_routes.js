import express from 'express'
import { accessByRole } from '../../middlewares/users-middlewares/auth_middleware.js'
import {
  approveChoicePFA,
  choose_pfa,
  getChoicesForProject,
  InformApproval,
} from '../../controllers/pfa-controller/choice_pfa_controller.js'

const choice_pfa_route = express.Router()

// ----------------------- Student Routes --------------------------------------------------------
choice_pfa_route.post('/:choiceId', accessByRole(['student']), InformApproval)

choice_pfa_route.post('/:id/choice', accessByRole(['student']), choose_pfa)

choice_pfa_route.get(
  '/choices/:projectId',
  accessByRole(['teacher']),
  getChoicesForProject,
)

choice_pfa_route.patch(
  '/:projectId/choice/:choiceId/approve',
  accessByRole(['teacher']),
  approveChoicePFA,
)

export default choice_pfa_route
