import mongoose from 'mongoose'

const InternshipSchema = new mongoose.Schema({
  id: { type: String, required: true },
  périodeOuverte: { type: Boolean, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
  },
  level: {
    type: String,
    enum: ['1st year', '2nd year'], // Academic levels
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  published: { type: Boolean, required: true },
  Validate: {
    value: { type: Boolean, required: true },
    reason: { type: String },
  },
  documents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: false,
    },
  ],
  periodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Period',
    required: true,
  },
})

export default mongoose.model('Internship', InternshipSchema)
