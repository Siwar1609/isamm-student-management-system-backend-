import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
  login: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        // Regex to validate email format
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    default: 'student',
  },

  fullName: {
    type: String,
    required: true,
  },

  level: {
    type: String,
    enum: ['1st year', '2nd year'],
    required: function () {
      // Only require the level field if the role is 'student'
      return this.role === 'student'
    },
    message: 'Level is required for students only.',
  },
})

export default mongoose.model('User', userSchema)
