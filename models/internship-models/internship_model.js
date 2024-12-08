import mongoose from 'mongoose'

const InternshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: false,
  },
  type: {
    type: String,
    enum: ['1st_year', '2nd_year'],
    required: true,
  },

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  submissionDate: {
    type: Date,
  },
  Validate: {
    type: Boolean,
    default: false,
  },
  documents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: false,
    },
  ],
  periodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Period',
    required: false,
  },
})

export default mongoose.model('Internship', InternshipSchema)
