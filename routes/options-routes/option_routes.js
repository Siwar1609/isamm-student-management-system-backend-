import express from 'express'
import {
  addOption,
  getAllOptions,
  getOptionsByStudentId,
  publishOrMaskOption,
  calculateOptionResults,
  getClassementByOption,
  updateOptionResults,
  SentEmailFinalOption,
  getFinalList,
} from '../../controllers/option-controller/option_controller.js'
import { loggedMiddleware,accessByRole } from '../../middlewares/users-middlewares/auth_middleware.js'

const router = express.Router()

router.post('/', accessByRole(['student']), addOption)
router.get('/', accessByRole(['admin']), getAllOptions)
router.get('/:studentId', accessByRole(['admin']), getOptionsByStudentId)
router.post('/publish/:response', accessByRole(['admin']), publishOrMaskOption)
router.post('/result', accessByRole(['admin']), calculateOptionResults)
router.get('/order/:optionName', accessByRole(['admin']), getClassementByOption)
router.patch('/:optionResultId', accessByRole(['admin']), updateOptionResults)
router.post('/send/email', accessByRole(['admin']), SentEmailFinalOption)
router.get('/listFinalChoice/student', loggedMiddleware,accessByRole(['student']), getFinalList)

export default router
