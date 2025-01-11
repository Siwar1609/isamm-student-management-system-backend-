import mongoose from 'mongoose'

const optionResultsSchema = mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  optionName: {
    type: String,
    required: true,
    enum: ['INREV', 'INLOG'],
  },
  score: {
    type: Number,
    required: true,
  },
  rank: {
    type: Number,
    required: true,
  },
  reason: {
    type: String, // Reason for modification
    required: false,
  },
  dateOfModification: {
    type: Date, // Date of modification
    default: Date.now,
  },
  valid: {
    type: Boolean, // Whether the result is valid
    default: false,
  },
  sentEmail: {
    type: Boolean,
    required: false, // Indicates if the email has been sent or not
  },
  published: {
    type: Boolean,
    required: false, // Indicates if the result has been published or not
  },
  academic_year: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
  },
})

export default mongoose.model('OptionResults', optionResultsSchema)
