import mongoose from 'mongoose'
import Skill from './skill_model.js';
import Curriculum from './curriculum_model.js';
import AcademicYear from '../academic_year_models/academic-year-model.js'
const SubjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  level: { type: Number, required: true },
  semester: { type: Number, required: true },
  chapId:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true
    
  }],
  teacherId: { type: Number},
  skillId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }], // Reference to Skill
  Assesment_Id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubjectAssessment' }],
  published: { type: Boolean, default: false },
  academicYearId:[{ type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true
    
  }],
  curriculumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Curriculum' }, // Reference to Curriculum
  
})

export default  mongoose.model('Subject', SubjectSchema)
