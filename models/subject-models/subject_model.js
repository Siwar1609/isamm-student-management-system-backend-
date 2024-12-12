import mongoose from 'mongoose'

const SubjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  level: { type: Number, required: true },
  semester: { type: Number, required: true },
  chapId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }],
  teacherId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }],
  skillId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }], // Reference to Skill
  Assesment_Id: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'SubjectAssessment' },
  ],
  published: { type: Boolean, default: false },
  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
  },
  curriculumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Curriculum' }, // Reference to Curriculum
  studentId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
})

export default mongoose.model('Subject', SubjectSchema)
