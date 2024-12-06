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
  // car on necessite champs type uniquement le cas Dépôt de stage dans API
  type: {
    type: String,
    enum: ['1ère année', '2ème année'],
    required: function () {
      return this.name === 'Dépôt de stage';
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
