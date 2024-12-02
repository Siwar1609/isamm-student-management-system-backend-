import mongoose from 'mongoose'

const document_Schema = mongoose.Schema({
  type: {
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
  link: {
    type: String,
    required: true,
  },
  current: {
    type: Boolean,
    required: true,
  },
})

export default mongoose.model('Document', document_Schema)
