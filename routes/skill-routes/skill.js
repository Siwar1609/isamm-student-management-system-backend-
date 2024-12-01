import {
    fetchSkill,
    getSkillbyID,
    addSkill,
    updateSkill,
    deleteSkill,
  } from '../../controllers/skill-controller/skill.js'
  import Skill from '../../models/subject-models/skill_model.js'
  import express from 'express'
  
  const router = express.Router()
  router.get('/', fetchSkill)
  router.get('/:id', getSkillbyID)
  // on ajoute async khatr await f fonction sync wahadha mata5demsh
  router.post('/', addSkill)
  router.patch('/:id', updateSkill)
  router.delete('/:id', deleteSkill)
  export default router