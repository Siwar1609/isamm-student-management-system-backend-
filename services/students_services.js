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

export const getStudents = async function () {
  const students = await Student.find()
  return students
}

export const getStudent = async function (id) {
  const student = await Student.findById(id)
  return student
}

export const updateStudent = async function (id, student) {
  const updatedStudent = await Student.findByIdAndUpdate(id, student, {
    new: true,
  })

  return updatedStudent
}

export const deleteStudent = async function (id) {
  await Student.findByIdAndDelete(id)
  return { message: 'Student deleted successfully' }
}
