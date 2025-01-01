import mongoose from 'mongoose'

const optionSchema = mongoose.Schema({
  name: {
    type: String,
    enum: ['INREV', 'INLOG'],
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },

  academic_year: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
  },
  period: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Period',
    required: true,
  },

  url: { type: String, required: true },

  groupName: {
    type: String,
    required: true,
    enum: ['2ing1', '2ing2'], // Add more group names as needed
  },
  repitationIn1stYear: {
    type: String,
    required: true,
    enum: ['yes', 'no'], // Add more group names as needed
  },

  generalAverage: {
    type: Number,
    required: true,
    min: 0,
    max: 20,
  },
  integrationYear: {
    type: String,
    required: true,
    enum: ['1', '2'],
  },
  successSession: {
    type: String,
    required: true,
    enum: ['Main', 'Catch-up'],
  },
  webDevGrade: { type: Number, required: true },
  oopGrade: { type: Number, required: true },
  algorithmsGrade: { type: Number, required: true },
  
})

export default mongoose.model('Option', optionSchema)
