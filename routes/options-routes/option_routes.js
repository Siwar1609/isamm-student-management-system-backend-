import express from 'express'
import {
  addOption,
  getAllOptions,
  getOptionsByStudentId,
} from '../../controllers/option-controller/option_controller.js'
import { accessByRole } from '../../middlewares/users-middlewares/auth_middleware.js'

const router = express.Router()

router.post('/', accessByRole(['student']), addOption)
router.get('/', accessByRole(['admin']), getAllOptions)
router.get('/:studentId', accessByRole(['admin']), getOptionsByStudentId)

export default router
