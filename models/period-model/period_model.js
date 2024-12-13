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
  },
  type: {
    type: Number,
  },
})

export default mongoose.model('Period', PeriodSchema)
