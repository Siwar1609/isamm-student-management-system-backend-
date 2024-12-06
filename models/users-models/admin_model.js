import mongoose from 'mongoose'
import user_model from './user_model'

const adminSchema = mongoose.Schema(
  {

    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
  },
  {
    timestamps: true,
  },
)

const Admin = user_model.discriminator('Admin', adminSchema)
export default Admin
