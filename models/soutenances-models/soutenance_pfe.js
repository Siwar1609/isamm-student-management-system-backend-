import mongoose from 'mongoose';
const SoutenanceSchema = new mongoose.Schema({
  students: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Student", 
      required: true 
    },
  ],
  salleSoutenance: { 
    type: String, 
    required: [true, "La salle est obligatoire"], 
    trim: true 
  },
  dateSoutenance: { 
    type: Date, 
    required: [true, "La date de soutenance est obligatoire"], 
    validate: {
      validator: (value) => !isNaN(new Date(value).getTime()),
      message: "La date spécifiée n'est pas valide",
    },
  },
  academicYear: { 
    type: String, 
  },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "PFE", 
    required: [true, "Un projet est obligatoire"] 
  },
  teachers: {
    type: [
      {
        teacherId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Teacher", 
          required: [true, "Un ID enseignant est obligatoire"] 
        },
        role: { 
          type: String, 
          enum: {
            values: ["encadrant", "rapporteur", "président de jury"],
            message: "Le rôle doit être 'encadrant', 'rapporteur' ou 'président de jury'",
          },
          required: [true, "Un rôle est obligatoire"],
        },
      },
    ],
    validate: {
      validator: function (value) {
        return Array.isArray(value) && value.length > 0;
      },
      message: "❌ Vous devez fournir un tableau d'enseignants avec leurs rôles.",
    },
  },
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