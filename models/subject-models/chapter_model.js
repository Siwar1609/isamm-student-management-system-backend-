import mongoose from 'mongoose'

const ChapterSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    ordre: { type: Number, required: true },
    titre: { type: String, required: true },
    section: [
      {
        content: { type: String },
        advancement: {
          type: String,
          enum: ['not yet', 'in progress', 'completed'], // État d'avancement
          default: 'not yet',
        },
      },
    ],
  });
  
export default mongoose.model('Chapter', ChapterSchema);
  