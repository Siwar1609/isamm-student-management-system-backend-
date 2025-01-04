import mongoose from 'mongoose'
const historySchema = new mongoose.Schema({
  modifiedAt: { type: Date, required: true },
  previousState: { type: Object, required: true },
  proposedState: { type: Object },
})

const SubjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  level: { type: Number, required: true },
  semester: { type: Number, required: true },
  chapId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }],
  teacherId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }],
  skillId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  Assesment_Id: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'SubjectAssessment' },
  ],
  published: { type: Boolean, default: false },
  propositionValidated: { type: Boolean, default: false },
  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
  },
  curriculumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Curriculum' },
  studentId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  history: [historySchema], // Ajouter l'historique
})

export default mongoose.model('Subject', SubjectSchema)
