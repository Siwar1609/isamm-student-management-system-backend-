import mongoose from 'mongoose'

const InternshipPlanningSchema = new mongoose.Schema({
  idInternship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true,
  },
  EvaluatorId: {
    // 1 Evaluator for each Internship
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  published: { 
    type: Boolean, 
    required: true },
  evaluation: {
    status: {
      type: String,
      enum: ['En attente', 'Validé', 'Non validé'],
      default: 'En attente',
    },
    reason: { type: String, default: null },
  },
  meeting: {
    date: { 
      type: Date, 
      required: false },
    time: { 
      type: String, 
      required: false },
    googleMeetLink: { 
      type: String, 
      required: false },
  },
  sendTo: {
    studentEmail: {
      type: String, // student email
      required: true,
    },
    teacherEmail: {
      type: String, // teacher email
      required: true,
    },
  },
  sentEmail: {
    type: Boolean,
    default: false, // Indicates if the email has been sent or not
  },
  sentAt: {
    type: Date,
    default: null, // Date when the email was sent
  },
})

module.exports = mongoose.model('InternshipPlanning', InternshipPlanningSchema)
