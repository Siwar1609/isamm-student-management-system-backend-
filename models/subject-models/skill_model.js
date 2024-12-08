import mongoose from 'mongoose'
import Subject from './subject_model.js';
const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  subjectId:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
})

export default mongoose.model('Skill', SkillSchema)
