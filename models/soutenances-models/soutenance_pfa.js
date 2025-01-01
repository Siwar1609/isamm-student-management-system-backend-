import { setAcademicYear } from '../../utils/setAcademicYear.js'
import mongoose from 'mongoose'


const SoutenancePFASchema = new mongoose.Schema({
  date: {
    type: Date,
    // required: true,
  },
  time: {
    type: String,
    // required: true, // Format attendu : "HH:mm"
  },
  room: {
    type: String,
    // required: true,
  },
  pfa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PFA',
    // required: true,
  },
  encadrant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    // required: true,
  },
  rapporteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    // required: true,
  },
  list_of_student: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
  ],
  send: {
    type: Boolean,
    default: false,
  },
  published: {
    type: Boolean,
    default: false,
  },
  academicyear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
  }
})

//Appliquer le middleware pour définir l'année académique par défaut
SoutenancePFASchema.pre('save', setAcademicYear)

export default mongoose.model('SoutenancePFA', SoutenancePFASchema)
