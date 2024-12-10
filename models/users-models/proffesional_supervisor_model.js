import mongoose from 'mongoose'
import user_model from './user_model'

const proffesional_supervisorSchema = mongoose.Schema(
  {
    entreprise: {
      type: String,
      required:
        'You must provide the name of the entreprise you are working for',
    },

    role: {
      type: String,
      enum: ['proffesional_supervisor'],
      default: 'proffesional_supervisor',
    },
  },
  {
    timestamps: true,
  },
)

const Proffesional_supervisor = user_model.discriminator(
  'Proffesional_supervisor',
  proffesional_supervisorSchema,
)
export default Proffesional_supervisor
