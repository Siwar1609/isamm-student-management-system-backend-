import mongoose from 'mongoose'
import { setAcademicYear } from '../../utils/setAcademicYear.js'

const ChoicePFASchema = mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pfa',
  },
  priority: {
    // priority
    type: Number,
  },
  numberOfStudents: {
    type: String,
    enum: ['Binome', 'Monome'],
    default: 'Monome',
  },
  studentList: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    ref: 'Student',
  },
  approval: {
    // student
    type: Boolean,
    default: false,
  },
  isValidated: {
    type: Boolean,
    default: false,
  },
  academicyear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
  },
})
ChoicePFASchema.pre('save', setAcademicYear)

export default mongoose.model('ChoicePFA', ChoicePFASchema)
