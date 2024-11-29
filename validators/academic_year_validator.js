import mongoose from 'mongoose'

const academicYearSchema = new mongoose.Schema({
  start_year: {
    type: Date,
    required: [true, 'L’année de début est obligatoire.'],
  },
  end_year: {
    type: Date,
    required: [true, 'L’année de fin est obligatoire.'],
    validate: {
      validator: function (value) {
        return value > this.start_year
      },
      message: 'L’année de fin doit être postérieure à l’année de début.',
    },
  },
  status: {
    type: String,
    enum: ['pending', 'off'],
    required: [true, 'Le statut est obligatoire.'],
    default: 'pending',
  },
  current: {
    type: Boolean,
    required: true,
    default: true,
  },
})

// Export du modèle
export default mongoose.model('AcademicYear', academicYearSchema)
