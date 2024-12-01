import mongoose from 'mongoose'
import user_model from './user_model.js'

const studentSchema = mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['student'],
      default: 'student',
    },
    cv: {
      type: String,
      required: true,
    },
    fieldOfStudy: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active_student', 'graduated_student', 'suspended_student'],
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const Student = user_model.discriminator('Student', studentSchema)
export default Student
