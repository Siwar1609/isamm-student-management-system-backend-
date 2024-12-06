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
    required: true,
  },
  level: {
    type: Number,
    enum: [1, 2], // First year ou second year
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
      required: true,
    },
  ],
  periodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Period',
    required: true,
  },
})

export default mongoose.model('Internship', InternshipSchema)
