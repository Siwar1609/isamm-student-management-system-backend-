import mongoose from 'mongoose';

const PVSchema = new mongoose.Schema({
  soutenance: 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'soutenance_pfa',
      required: true,
    },
  pfaCode: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PFA', 
    required: true },
  
  sujetpfa: { 
    type: String, 
    required: true },
  list_of_student: 
  [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  ],
  encadrant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  rapporteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  note1: {
    autonomy: { type: Number, min: 0, max: 5 },
    seriousness: { type: Number, min: 0, max: 5 },
    progress: { type: Number, min: 0, max: 5 },
    workCompletion: { type: Number, min: 0, max: 5 },
    average: { type: Number }, // Calculé automatiquement
  },
  note2: {
    demoQuality: { type: Number, min: 0, max: 5 },
    reportQuality: { type: Number, min: 0, max: 5 },
    subjectMastery: { type: Number, min: 0, max: 5 },
    workConsistency: { type: Number, min: 0, max: 5 },
    innovativeTech: { type: Number, min: 0, max: 5 },
    average: { type: Number }, // Calculé automatiquement
  },
  note3: {
    demoQuality: { type: Number, min: 0, max: 5 },
    reportQuality: { type: Number, min: 0, max: 5 },
    subjectMastery: { type: Number, min: 0, max: 5 },
    workConsistency: { type: Number, min: 0, max: 5 },
    innovativeTech: { type: Number, min: 0, max: 5 },
    average: { type: Number }, // Calculé automatiquement
  },
  finalNote: {
    type: Number, // Calculée automatiquement
  },
  observations: {
    type: String,
  },
});

export default mongoose.model('PV', PVSchema);
