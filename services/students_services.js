import bcrypt from 'bcrypt'
import Student from '../models/users-models/student_model.js'

export const addStudent = async function (value) {
  // hashing the password
  const hashedPassword = await bcrypt.hash(value.password, 10)
  // creating the user
  const newStudent = new Student({
    ...value,
    password: hashedPassword,
  })

  // saving the user
  return await newStudent.save()
}
