import bcrypt from 'bcrypt'

import Teacher from '../models/users-models/teacher_model.js'

// adding a teacher
export const addTeacher = async function (value) {
  // hashing the password
  const hashedPassword = await bcrypt.hash(value.password, 10)
  // creating the user
  const newTeacher = new Teacher({
    ...value,
    password: hashedPassword,
  })

  await newTeacher.save()
}

// getting all teachers
export const getTeachers = async function () {
  const teachers = await Teacher.find()
  return teachers
}

// getting a teacher by id
export const getTeacher = async function (id) {
  const teacher = await Teacher.findById(id)
  return teacher
}

// updating a teacher
export const updateTeacher = async function (id, teacher) {
  const updatedTeacher = await Teacher.findByIdAndUpdate(id, teacher, {
    new: true,
  })
  return updatedTeacher
}

// deleting a teacher
export const deleteTeacher = async function (id) {
  await Teacher.findByIdAndDelete(id)
  return { message: 'Teacher deleted successfully' }
}

// exporting the functions*
export default {
  addTeacher,
  getTeachers,
  getTeacher,
  updateTeacher,
  deleteTeacher,
}
