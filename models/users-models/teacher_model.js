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
  },
  {
    timestamps: true,
  },
)

const Teacher = user_model.discriminator('Teacher', teacherSchme)
export default Teacher
