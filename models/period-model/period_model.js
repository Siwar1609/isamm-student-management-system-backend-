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
  type: {
    type: String,
    enum: ['1st_year', '2nd_year'],
    required: function () {
      return this.name === 'Dépôt de stage'; // 'type' est requis seulement pour 'Dépôt de stage'
    },
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
})

export default mongoose.model('Period', PeriodSchema)
