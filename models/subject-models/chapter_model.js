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
      modificationDate: { type: Date }, // New field for section modification date
    },
  ],
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedDate: { type: Date }, // New field for chapter completion date
})

export default mongoose.model('Chapter', ChapterSchema)
