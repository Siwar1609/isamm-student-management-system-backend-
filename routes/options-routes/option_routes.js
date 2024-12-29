import express from 'express'
import {
  addOption,
  getAllOptions,
  getOptionsByStudentId,
  publishOrMaskOption,
} from '../../controllers/option-controller/option_controller.js'
import { accessByRole } from '../../middlewares/users-middlewares/auth_middleware.js'

const router = express.Router()

router.post('/', accessByRole(['student']), addOption)
router.get('/', accessByRole(['admin']), getAllOptions)
router.get('/:studentId', accessByRole(['admin']), getOptionsByStudentId)
router.post('/publish/:response', accessByRole(['admin']), publishOrMaskOption)

export default router
