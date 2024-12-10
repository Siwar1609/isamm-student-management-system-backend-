import mongoose from 'mongoose'

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
})

export default mongoose.model('Skill', SkillSchema)
