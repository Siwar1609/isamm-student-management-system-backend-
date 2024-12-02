import mongoose from 'mongoose'

const InternshipSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  periodeOuverte: {
    type: Boolean,
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
    enum: [1, 2],
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: false, // car apres on va assigner un stage à un teacher
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
      required: true,
    },
  ],
  periodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Period',
    required: true,
  },
})

export default mongoose.model('Internship', InternshipSchema)
