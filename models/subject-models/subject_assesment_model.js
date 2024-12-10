import mongoose from 'mongoose'

const SubjectAssessmentSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // Référence à Subject
  eval: [
    {
      skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: true,
      }, // Référence à Skill
      grade: { type: Number, min: 0, max: 5, required: true }, // Note entre 0 et 5
    },
  ],
  anneeAcademiqueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnneeAcademique',
    required: true,
  }, // Référence à AnneeAcademique
})

export default mongoose.model('SubjectAssessment', SubjectAssessmentSchema)
