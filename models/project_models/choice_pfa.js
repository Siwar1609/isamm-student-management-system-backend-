import mongoose from 'mongoose'

const ChoicePFASchema = mongoose.Schema({
  projectId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Pfa'
  },
  priority: {
    type: Number
  },
  numberOfStudents: {
    type: String,
    enum: ['Binome', 'Monome'],
    default: 'Monome'},
  studentList: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    ref : 'Student'
  },
  approval: {
    type: Boolean,
    default: false
  },
  validate: {
    type: Boolean,
    default: false
  },
})

export default mongoose.model('ChoicePFA', ChoicePFASchema)
