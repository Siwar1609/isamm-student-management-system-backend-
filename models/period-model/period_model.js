import mongoose from 'mongoose'

const PeriodSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: [
      'Dépôt des Sujet des PFA',
      'Choix sujet PFA',
      'Dépôt de stage',
      'Dépot PFE',
      'Choix d’option',
    ],
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value > this.start_date // Vérifie que end_date est après start_date
      },
      message: 'La date de fin doit être supérieure à la date de début.',
    },
  },
})

export default mongoose.model('Period', PeriodSchema)
