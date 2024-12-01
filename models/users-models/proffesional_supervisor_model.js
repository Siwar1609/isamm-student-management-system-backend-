import mongoose from 'mongoose'
import user_model from './user_model'

const proffesional_supervisorSchema = mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
