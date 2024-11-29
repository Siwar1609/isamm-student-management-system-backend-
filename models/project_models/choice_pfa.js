import mongoose from 'mongoose'
import idValidator from 'mongoose-id-validator'

const ChoicePFASchema = mongoose.Schema({
  projectId: {
    type: Number,
    required: [true, 'Le projectId est obligatoire'],
    min: [1, 'Le projectId doit être un nombre positif'],
  },
  priority: {
    type: Number,
    required: [true, 'La priorité est obligatoire'],
    min: [1, 'La priorité doit être un nombre positif'],
  },
  studentList: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    required: [true, 'La liste des étudiants est obligatoire'],
    // validate: {
    //   validator: (v) => Array.isArray(v) && v.length > 0,
    //   message: 'La liste des étudiants ne peut pas être vide',
    // },
  },
  approval: {
    type: Boolean,
    required: [true, "L'approbation est obligatoire"],
    default: false,
  },
  validate: {
    type: Boolean,
    required: [true, 'La validation est obligatoire'],
    default: false,
  },
})
ChoicePFASchema.plugin(idValidator)

export default mongoose.model('ChoicePFA', ChoicePFASchema)
