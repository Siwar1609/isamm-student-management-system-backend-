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
  url: {
    type: String,
    required: true,
  },
  pfeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PFE',
    default: null
},
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', // References the student
    required: true,
  },
},)

export default mongoose.model('Document', document_Schema)
