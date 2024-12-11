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
  sentEmail: {
    type: Boolean,
    required: false  // Indicates if the email has been sent or not
  },
  sentAt: {
    type: Date,
    required: false // Date when the email was sent
  },
})

export default mongoose.model('InternshipPlanning', InternshipPlanningSchema)
