// import mongoose from "mongoose";

// const internshipSchema = mongoose.Schema({
//   startDate: {
//     type: Date,
//     required: true,
//   },
//   endDate: {
//     type: Date,
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ["running", "finished", "didn't start"],
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User", // Reference to the User model (admin who created the internship period)
//     required: true,
//   },
//   modifiedBy: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", // Reference to the User model (admins who modified the internship period)
//     },
//   ],
//   student: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User", // Reference to the User model (student assigned to this internship)
//     required: true, // Optional: Make it required if every internship must have a student
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// export default mongoose.model("Internship", internshipSchema);
