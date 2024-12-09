import mongoose from 'mongoose';

const SkillAssessmentSchema = new mongoose.Schema({
  studentId: { type: Number }, 
  evaluation: [
    {
      skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: true,
      }, // Référence à Skill
      grade: { type: Number, min: 0, max: 5, required: true }, // Note entre 0 et 5
    },
  ],
  academicYearId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AcademicYear', 
    required: true,
  },

});
export default mongoose.model('SkillAssessment', SkillAssessmentSchema);
