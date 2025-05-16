import mongoose from 'mongoose';

const ChapterSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  title: { type: String, required: true },
  status: {
    type: String,
    enum: ['not yet', 'in progress', 'completed'],
    default: 'not yet'
  },
  statusUpdatedAt: { type: Date },
  section: [
    {
      content: { type: String },
      advancement: {
        type: String,
        enum: ['not yet', 'in progress', 'completed'],
        default: 'not yet'
      },
      modificationDate: { type: Date },
      statusUpdatedAt: { type: Date }
    }
  ],
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Chapter', ChapterSchema);