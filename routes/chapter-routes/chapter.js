import {
  fetchChapter,
  getChapterById,
  addChapter,
  updateProgressChapter,
  deleteChapter,
} from '../../controllers/chapter-controller/chapter.js'
import Chapter from '../../models/subject-models/chapter_model.js'
import express from 'express'
import {
  loggedMiddleware,
  accessByRole,
} from '../../middlewares/users-middlewares/auth_middleware.js'

const router = express.Router()
router.get('/', loggedMiddleware, accessByRole(['admin']), fetchChapter)
router.get('/:id', loggedMiddleware, accessByRole(['admin']), getChapterById)

router.post('/', loggedMiddleware, accessByRole(['admin']), addChapter)
router.patch(
  '/:id',
  loggedMiddleware,
  accessByRole(['admin', 'teacher']),
  updateProgressChapter,
)

router.delete('/:id', loggedMiddleware, accessByRole(['admin']), deleteChapter)
export default router
