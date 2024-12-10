import mongoose from 'mongoose';
import Subject from './subject_model.js';
// Check if the model is already compiled before defining it
const SubjectAssessment = mongoose.models.SubjectAssessment || mongoose.model('SubjectAssessment', new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  }, // Corrected to Number
  subjectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subject', 
    required: true 
  },
  grade: { 
    type: Number, 
    min: 0, 
    max: 20, 
    required: true 
  }, // Grade between 0 and 20
  
  academicYearId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AcademicYear', 
    required: true 
  },
}));

export default SubjectAssessment;
