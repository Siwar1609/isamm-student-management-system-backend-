import mongoose from 'mongoose'
import idValidator from 'mongoose-id-validator'

// Schéma PFA
const PFA_Schema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    minlength: [20, 'Le titre doit comporter au moins 3 caractères'],
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
  },
  type: {
    type: String,
    enum: ['PFA'],
    default: 'PFA',
  },
  technologies_list: {
    type: [String], // Tableau de chaînes représentant les technologies utilisées
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message:
        'La liste des technologies doit contenir au moins une technologie.',
    },
  },
  binome: {
    type: Boolean,
    required: [true, 'Indiquez si le projet est en binôme ou non'],
  },
  list_of_student: {
    type: [mongoose.Schema.Types.ObjectId],
    validate: {
      validator: function (v) {
        return this.binome ? v.length === 2 : v.length === 1 // Valide en fonction du binôme
      },
      message:
        "Le nombre d'étudiants doit correspondre au type (monôme ou binôme).",
    },
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId, // Référence vers un enseignant
    ref: 'Teacher',
    required: [true, 'Un enseignant doit être assigné au projet'],
  },
  affected: {
    type: Boolean,
    default: false,
  },
  published: {
    type: Boolean,
    default: false,
  },
  // Au lieu de status
  rejected: {
    type: Boolean,
    default: false,
  },
  academicyear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: [true, "L'année académique est obligatoire"],
    default: function () {
      const currentAcademicYear = mongoose
        .model('AcademicYear')
        .findOne({ current: true })
      return currentAcademicYear ? currentAcademicYear._id : null
    },
  },
  document: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    default: [],
  },
})

// Appliquer le middleware pour définir l'année académique par défaut
//PFA_Schema.pre('save', setAcademicYear);

// Validation d'ID de référence
PFA_Schema.plugin(idValidator)

export default mongoose.model('PFA', PFA_Schema)
