import express from 'express'
import { accessByRole, accessByLevel, loggedMiddleware } from '../../middlewares/users-middlewares/auth_middleware.js'
import {
  approveChoicePFA,
  choose_pfa,
  getChoicesForProject,
  InformApproval,
} from '../../controllers/pfa-controller/choice_pfa_controller.js'

const choice_pfa_route = express.Router()

// ----------------------- Student Routes --------------------------------------------------------
choice_pfa_route.patch('/:choiceId',loggedMiddleware, accessByRole(['student']), accessByLevel(['1']), InformApproval)

choice_pfa_route.post('/:id/choice',loggedMiddleware, accessByRole(['student']), accessByLevel(['1']), choose_pfa)


// -------------------- Teacher Routes ----------------------------------
choice_pfa_route.get(
  '/choices/:projectId', loggedMiddleware,
  accessByRole(['teacher']),
  getChoicesForProject,
)

choice_pfa_route.patch(
  '/:projectId/choice/:choiceId/approve',loggedMiddleware,
  accessByRole(['teacher']),
  approveChoicePFA,
)

export default choice_pfa_route
