import mongoose from 'mongoose'
import user_model from './user_model.js'

const teacherSchme = mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['teacher'],
      default: 'teacher',
    },
    cv: {
      type: String,
      required: true,
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject', // Référence à un modèle Subject (optionnel)
      },
    ],
  },
  {
    timestamps: true,
  },
)

const Teacher = user_model.discriminator('Teacher', teacherSchme)
export default Teacher
