import bcrypt from 'bcrypt'

import Teacher from '../models/users-models/teacher_model.js'
import {
  generateRandomPassword,
  generateEmailTemplatLoginInfo,
  sendEmail,
} from './users_services.js'

// adding a teacher
export const addTeacher = async function (teacherData) {
  try {
    const existingTeacher = await Teacher.findOne({
      cin: teacherData.cin,
    }).exec()
    if (existingTeacher) {
      const error = new Error('An Account with the same CIN Already Exist')
      error.statusCode = 400
      throw error
    }

    // Generate a secure password
    const generatedPassword = generateRandomPassword()
    const hashedPassword = await bcrypt.hash(generatedPassword, 12)

    // create a new Teacher
    const newTeacher = new Teacher({
      ...teacherData,
      password: hashedPassword,
    })
    const teacherFullName = `${teacherData.firstName} ${teacherData.lastName}`
    const htmlEmailContent = generateEmailTemplatLoginInfo(
      teacherFullName,
      generatedPassword,
    )
    await newTeacher.save()
    await sendEmail({
      to: teacherData.email,
      subject: 'Welcome to isamm internship management system',
      html: htmlEmailContent,
    })

    const { password, ...teacherWithoutPassword } = newTeacher.toObject()
    teacherWithoutPassword.generatedPassword = generatedPassword
    return teacherWithoutPassword
  } catch (error) {
    console.error('Error in addTeacher function: ', error)
    throw error
  }
}

// getting all teachers
export const getTeachers = async function () {
  const teachers = await Teacher.find()
  return teachers
}

// getting a teacher by id
export const getTeacher = async function (id) {
  try {
    const teacher = await Teacher.findById(id)
    if (!teacher) {
      const error = new Error('Teacher not found')
      error.statusCode = 404
      throw error
    }
    return teacher
  } catch (error) {
    console.error('Error in getTeacher function: ', error)
    throw error
  }
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
