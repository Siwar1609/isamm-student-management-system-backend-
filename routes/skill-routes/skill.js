import {
  fetchSkill,
  getSkillbyID,
  addSkill,
  updateSkill,
  deleteSkill,
} from '../../controllers/skill-controller/skill.js'
import express from 'express'
import {
  loggedMiddleware,
  accessByRole,
} from '../../middlewares/users-middlewares/auth_middleware.js'

const router = express.Router()

router.get(
  '/',
  loggedMiddleware,
  accessByRole(['admin', 'teacher']),
  fetchSkill,
)

router.get('/:id', loggedMiddleware, accessByRole(['admin']), getSkillbyID)

router.post('/', loggedMiddleware, accessByRole(['admin']), addSkill)

router.patch('/:id', loggedMiddleware, accessByRole(['admin']), updateSkill)

router.delete('/:id', loggedMiddleware, accessByRole(['admin']), deleteSkill)

export default router
