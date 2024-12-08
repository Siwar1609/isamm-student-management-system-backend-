import {
    fetchCurriculums,
    getCurriculumByID,
    addCurriculum,
    updateCurriculum,
    deleteCurriculum,
  } from '../../controllers/curriculum-controller/curriculum_controller.js'

  import express from 'express'
  
  const router = express.Router()
  router.get('/', fetchCurriculums)
  router.get('/:id', getCurriculumByID)

  router.post('/', addCurriculum)
  router.patch('/:id', updateCurriculum)
  router.delete('/:id', deleteCurriculum)
  export default router