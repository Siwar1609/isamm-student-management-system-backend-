import mongoose from 'mongoose'
import Skill from './skill_model.js';
import Curriculum from './curriculum_model.js';
const SubjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  level: { type: Number, required: true },
  semester: { type: Number, required: true },
  teacherId: { type: Number, required: true },
  skillId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }], // Reference to Skill
  evaluation_matiereID: { type: Number },
  published: { type: Boolean, default: false },
  //anneeAcademiqueId: {
    //type: mongoose.Schema.Types.ObjectId,
    //ref: 'AnneeAcademique',
  //},
  curriculumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Curriculum' }, // Reference to Curriculum
  
})

export default  mongoose.model('Subject', SubjectSchema)
