import mongoose from 'mongoose'

const documentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the student
    required: true,
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship', // References the internship
    required: true,
  },
  encadrant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the encadrant (teacher)
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model('Document', documentSchema)
