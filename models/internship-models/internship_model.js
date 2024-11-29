// import mongoose from "mongoose";
import mongoose from 'mongoose'

const internshipSchema = mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['ended', 'pending', 'active'],
  },
  name: {
    type: String,
    enum: ['PFA', 'PFE', 'Stage', 'option'], // Liste des options possibles
    required: true,
  },
})

export default mongoose.model('Internship', internshipSchema)
