import mongoose from 'mongoose'

const CurriculumSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Nom du curriculum

  description: { type: String, required: true }, // Description du curriculum
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    // Un curriculum par matière
  },
  // Référence au modèle Subject
  chapId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }], // Liste des chapitres liés (références)
  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
  },
})
export default mongoose.model('Curriculum', CurriculumSchema)
