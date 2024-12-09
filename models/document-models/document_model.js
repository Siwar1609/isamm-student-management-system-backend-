import mongoose from 'mongoose'

const document_Schema = mongoose.Schema({
  name: {
    type: String,
    enum: [
      'rapport de stage',
      'attestation de stage',
      'affectation de stage',
      'rapport de pfe',
      'PV',
    ],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  encadrant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher', // References the encadrant (teacher)
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship', // References the internship
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', // References the student
    required: true,
  },
})

export default mongoose.model('Document', document_Schema)
