import mongoose from 'mongoose'
import { setAcademicYear } from '../../utils/setAcademicYear.js'

// Schéma PFA
const PFA_Schema = mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    enum: ['PFA'],
    default: 'PFA',
  },
  technologies_list: {
    type: [String],
  },

  numberOfStudents: {
    type: String,
    enum: ['Binome', 'Monome'],
    default: 'Monome',
  },
  list_of_student: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Student',
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  affected: { //teacher admin if == true : assigned list 
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
  },
  documentId: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    default: [],
  },
  send: {
    type: Boolean,
    default: false,
  },
})

//Appliquer le middleware pour définir l'année académique par défaut
PFA_Schema.pre('save', setAcademicYear)

export default mongoose.model('PFA', PFA_Schema)
