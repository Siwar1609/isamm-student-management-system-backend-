import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  login: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "enseignant", "etudiant"],
    default: "etudiant",
  },
});

export default mongoose.model("User", userSchema);
