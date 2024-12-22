import mongoose from 'mongoose';

const SoutenanceSchema = new mongoose.Schema({
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], 
  salleSoutenance: { type: String, required: true },
  dateSoutenance: { type: Date, required: true },
  academicYear: { type: String}, 
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "PFE", required: true }, 
  teachers: [
    {
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
      role: { type: String, enum: ["encadrant", "rapporteur", "président de jury"], required: true },
    },
  ],
  send: {
    type: Boolean,
    default: false,
  },
  published: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("SoutenancePfe", SoutenanceSchema);

