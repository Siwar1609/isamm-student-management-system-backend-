import mongoose from 'mongoose'

const CurriculumSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Nom du curriculum
  objectif: { type: String, required: true }, // Objectif du curriculum
  description: { type: String, required: true }, // Description du curriculum
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }, // Référence au modèle Subject
  chapId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }], // Liste des chapitres liés (références)
  anneeAcademiqueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnneeAcademique',
  }, // Référence à AnneeAcademique
  modification: [
    {
      proposition: { type: String, required: true }, // Proposition de modification
      reason: { type: String, required: true }, // Raison de la modification
      enregistrer: { type: Boolean, default: false }, 
      modification_date: { type: Date, default: Date.now }, // Date de la modification
    },
  ],
})
export default mongoose.model('Curriculum', CurriculumSchema)
