import mongoose from 'mongoose'


const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  subjectId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }], 
  skillAssesmentId: {type: mongoose.Schema.Types.ObjectId, ref: 'SkillAssessment'},// Reference to Skill
})
  
export default mongoose.model('Skill', SkillSchema)
