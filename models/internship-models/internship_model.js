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
})

export default mongoose.model('Internship', internshipSchema)
