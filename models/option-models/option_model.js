import mongoose from 'mongoose';

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
  student: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
  ],
  academic_year: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AcademicYear',
    required: true,
  },
  period: {
    type: mongoose.Schema.Types.ObjectId, 
    required: Period,
    required:true,
  },
});

export default mongoose.model('Option', optionSchema);
