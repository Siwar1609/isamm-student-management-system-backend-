import bcrypt from 'bcrypt'
import Student from '../models/users-models/student_model.js'

export const addStudent = async function (value) {
 
  // checking if the user already exists
  const student = await Student.findOne({ email: value.email }).exec()
  if (student) {
    return res.status(400).json({ message: 'Student already exists' })
  }
  // hashing the password
  const hashedPassword = await bcrypt.hash(value.password, 10)
  // creating the user
  const newStudent = new Student({
    ...value,
    password: hashedPassword,
  })

  console.log(newStudent)

  await newStudent.save()

  console.log('new student just created', newStudent)
}