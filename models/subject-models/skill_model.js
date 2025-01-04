import mongoose from 'mongoose'
import Subject from './subject_model.js';
import skillAssesment from './skill_assesment_model.js'

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  subjectId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }], 
  skillAssesmentId: {type: mongoose.Schema.Types.ObjectId, ref: 'SkillAssessment'},// Reference to Skill
})
  
export default mongoose.model('Skill', SkillSchema)
