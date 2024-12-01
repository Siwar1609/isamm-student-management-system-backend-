import {
    fetchChapter,
    getChapterById,
    addChapter,
    updateChapter,
    deleteChapter,
  } from '../../controllers/chapter-controller/chapter.js'
  import Chapter from '../../models/subject-models/chapter_model.js'
  import express from 'express'
  
  const router = express.Router()
  router.get('/', fetchChapter)
  router.get('/:id', getChapterById)
  // on ajoute async khatr await f fonction sync wahadha mata5demsh
  router.post('/', addChapter)
  router.patch('/:id', updateChapter)
  router.delete('/:id', deleteChapter)
  export default router