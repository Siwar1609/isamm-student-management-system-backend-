import {
  fetchSubjects,
  getSubjectbyID,
  addSubject,
  updateSubject,
  deleteSubject,
} from '../../controllers/subject-controller/subject.js'
import Subject from '../../models/subject-models/subject_model.js'
import express from 'express'

const router = express.Router()

router.get('/', fetchSubjects)
router.get('/:id', getSubjectbyID)
// on ajoute async khatr await f fonction sync wahadha mata5demsh
router.post('/', addSubject)

router.patch('/:id', updateSubject)
router.delete('/:id', deleteSubject)
export default router
