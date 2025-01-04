import bcrypt from 'bcrypt'
import Student from '../models/users-models/student_model.js'
import nodemailer from 'nodemailer'
import {
  generateEmailTemplateResetPassword,
  generateEmailTemplatLoginInfo,
  generateRandomPassword,
  sendEmail,
} from './users_services.js'

export const addStudent = async function (studentData) {
  try {
    const existingStudent = await Student.findOne({
      cin: studentData.cin,
    }).exec()
    if (existingStudent) {
      const error = new Error('An Account with the same CIN Already Exist')
      error.statusCode = 400
      throw error
    }

    // Generate a secure password
    const generatedPassword = generateRandomPassword()
    const hashedPassword = await bcrypt.hash(generatedPassword, 12)

    // create a new Student
    const newStudent = new Student({
      ...studentData,
      password: hashedPassword,
    })
    const studentFullName = `${studentData.firstName} ${studentData.lastName}`
    const htmlEmailContent = generateEmailTemplatLoginInfo(
      studentFullName,
      generatedPassword,
    )
    await newStudent.save()
    await sendEmail({
      to: studentData.email,
      subject: 'Welcome to isamm internship management system',
      html: htmlEmailContent,
    })

    const { password, ...studentWithoutPassword } = newStudent.toObject()
    studentWithoutPassword.generatedPassword = generatedPassword
    return studentWithoutPassword
  } catch (error) {
    console.error('Error in addStudent function: ', error)
    throw error
  }
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


