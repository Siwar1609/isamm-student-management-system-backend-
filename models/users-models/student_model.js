import mongoose from 'mongoose'
import user_model from './user_model.js'

// creating the cv schema for the student
// the student can add his academic info in his cv
// the student can add his diplomas, certifications, languages, competences, experiences
// the student can add his personal info in his cv

const cvSchema = new mongoose.Schema(
  {
    diplomas: [
      {
        diploma: {
          type: String,
          required: true,
        },
        establishment: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
      },
    ],
    certifications: [
      {
        certification: {
          type: String,
          required: true,
        },
        establishment: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
      },
    ],
    languages: [
      {
        language: { type: String, required: true },
        level: { type: String, required: true },
      },
    ],
    competences: [
      {
        competence: { type: String, required: true },
        level: { type: String, required: true },
      },
    ],
    experiences: [
      {
        title: {
          type: String,
          required: true,
        },
        establishment: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

const studentSchema = mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['student'],
      default: 'student',
    },
    cv: {
      type: cvSchema,
      required: false,
    },
    level: {
      type: String,
      required: false,
    },
    academicYearlevel: {
      type: String,
      enum: ['1L', '2L', '3L', '1M', '2M', '1ING', '2ING', '3ING'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active_student', 'graduated_student', 'suspended_student'],
      required: true,
    },
    academicYearStatus: {
      type: String,
      enum: ['pass', 'fail', 'suspended'],
      required: false,
    },
    internships: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship', // Liste des stages encadrés
      },
    ],
    isGraduated: {
      type: Boolean,
      default: false,
    },
    graduationDate: {
      type: Date,
      default: () => {
        const currentYear = new Date().getFullYear()
        const futureYear = currentYear + 3 // Add 3 years to the current year
        return new Date(futureYear, 0, 6)
      },
    },
  },
  {
    timestamps: true,
  },
)

const Student = user_model.discriminator('Student', studentSchema)
export default Student
