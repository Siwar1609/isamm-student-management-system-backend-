import mongoose from 'mongoose'

const userSchema = mongoose.Schema(
  {
    cin: {
      type: String,
      required: true,
      minlength: [8, 'Please use minimum of 8 characters as "CIN"'],
      maxlength: [8, 'Please use maximum of 8 characters as "CIN"'],
      unique: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },

    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: [true, "Can't be blank"],
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        'Please use a valid email-address , like name@something.com',
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: [9, 'Please use minimum of 9 characters as "password"'],
    },
    phone: {
      type: String,
      required: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please use a valid phone number.'],
    },
    address: {
      type: String,
      required: false,
    },

    secondEmail: {
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        'Please use a valid email-address , like name@something.com',
      ],
      type: String,
      required: false,
    },
    photoURL: {
      type: String,
      required: false,
    },

    role: {
      type: String,
      enum: ['admin', 'teacher', 'student', 'user', 'proffesional_supervisor'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model('User', userSchema)
