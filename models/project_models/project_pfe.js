import mongoose from 'mongoose';
import { setAcademicYear } from '../../utils/setAcademicYear.js';
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
    validate: {
      validator: async function(value) {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return false;
        }
        const teacherExists = await mongoose.model('Teacher').findById(value);
        return teacherExists != null;
      },
      message: "❌ L'enseignant spécifié n'existe pas ou n'est pas valide."
    }
  },
  studentId: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Student',
    validate: {
      validator: async function(value) {
        for (let studentId of value) {
          if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return false;
          }
          const studentExists = await mongoose.model('Student').findById(studentId);
          if (!studentExists) {
            return false;
          }
        }
        return true;
      },
      message: "❌ Un ou plusieurs ID étudiant(s) spécifié(s) n'est(ne sont) pas valide(s)."
    }
  },
  WorkMode: {
    type: String,
    enum: ['Binome', 'Monome'],
  },
  affected: {
    type: Boolean,
    default: false,
  },
  academicyear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear'
  },
  documentId: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Document',
  },
  published: { 
    type: Boolean,
    default: false 
  },
  isApproved: { 
    type: Boolean,
    default: false 
  },
  send: { 
    type: Boolean,
    default: false
  },
}, {
  timestamps: true,
});

PFESchema.pre('save', setAcademicYear);



export default mongoose.model('PFE', PFESchema);
