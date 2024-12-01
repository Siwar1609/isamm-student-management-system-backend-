const document_Schema = mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
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
