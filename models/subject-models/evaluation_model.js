import mongoose from 'mongoose'

const evaluationSchema = new mongoose.Schema({
  subjectID: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Subject collection
    ref: 'Subject',
    required: true,
  },
  hashedStudentID: {
    type: String, // Store the hashed version of the studentID
    required: true,
  },
  // Specific questions included directly in the model
  questions: {
    clarityOfExplanations: {
      type: Number, // Rating for "How clear were the explanations?"
      required: true,
      min: 1,
      max: 5,
    },
    instructorEngagement: {
      type: Number, // Rating for "How engaging was the instructor?"
      required: true,
      min: 1,
      max: 5,
    },
    conceptExplanation: {
      type: Number, // Rating for "How well were the concepts explained?"
      required: true,
      min: 1,
      max: 5,
    },
    courseMaterialQuality: {
      type: Number, // Rating for "How would you rate the quality of the course materials?"
      required: true,
      min: 1,
      max: 5,
    },
    paceOfTeaching: {
      type: Number, // Rating for "How was the pace of teaching?"
      required: true,
      min: 1,
      max: 5,
    },
    overallSatisfaction: {
      type: Number, // Rating for "How satisfied are you overall with the course?"
      required: true,
      min: 1,
      max: 5,
    },
  },
  submittedAt: {
    type: Date,
    default: Date.now, // Date and time of submission
  },
})

export default mongoose.model('Evaluation', evaluationSchema)
