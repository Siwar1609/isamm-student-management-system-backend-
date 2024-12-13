import mongoose from 'mongoose'

const ChapterSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  title: { type: String, required: true },
  section: [
    {
      content: { type: String },
      advancement: {
        type: String,
        enum: ['not yet', 'in progress', 'completed'],
        default: 'not yet',
      },
    },
  ],
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
})

export default mongoose.model('Chapter', ChapterSchema)
