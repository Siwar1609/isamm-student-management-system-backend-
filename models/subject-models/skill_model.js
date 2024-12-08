import mongoose from 'mongoose'
import Subject from './subject_model.js';
const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },

})

export default mongoose.model('Skill', SkillSchema)
