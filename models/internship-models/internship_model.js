import mongoose from 'mongoose'

const internshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['ended', 'pending', 'active'],
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

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  published: { type: Boolean, default: true },

  Validate: {
    value: { type: Boolean, default: false },
    reason: { type: String },
  },

  // Change to store file URLs directly
  documents: [
    {
      type: String, // Store the file path or URL as a string
    },
  ],

  periodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Period',
    required: true,
  },
})

export default mongoose.model('Internship', internshipSchema)
