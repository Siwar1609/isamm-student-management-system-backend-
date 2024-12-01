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
  level: {
    type: String,
    enum: ['1st year', '2nd year'], // Academic levels
    required: true,
  },
})

export default mongoose.model('Internship', internshipSchema)
