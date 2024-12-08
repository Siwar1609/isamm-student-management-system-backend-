import mongoose from 'mongoose';

const PFESchema = new mongoose.Schema({
  company_name: {
    type: String,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    enum: ['PFE'], 
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  studentId: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Student',
  },
  numberOfStudents: {
    type: String,
    enum: ['Binome', 'Monome'],
  },
  affected: {
    type: Boolean,
    default: false,
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
  },
  documentId: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Document',
  },
  periodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Period',
  },
  published: { 
    type: Boolean,
    default: false 
  },
  isApproved: { 
    type: Boolean,
    default: false 
  }  
}, {
  timestamps: true,
});

export default mongoose.model('PFE', PFESchema);
