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
    enum: ['admin', 'enseignant', 'etudiant'],
    default: 'etudiant',
  },

  fullName: {
    type: String,
    required: true,
  },
})

export default mongoose.model('User', userSchema)
