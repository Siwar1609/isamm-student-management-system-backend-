import mongoose from 'mongoose'

const academic_year_Schema = mongoose.Schema({
  start_year: {
    type: Date,
    required: true,
  },
  end_year: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'off'],
    required: true,
    default: 'pending',
  },
  current: {
    type: Boolean,
    required: true,
    default: true,
  },
})

export default mongoose.model('AcademicYear', academic_year_Schema)
