import bcrypt from 'bcrypt'
import Student from '../models/users-models/student_model.js'
import {
  generateEmailTemplatLoginInfo,
  generateRandomPassword,
  sendEmail,
} from './users_services.js'

export const addStudent = async function (studentData) {
  // Check for existing student
  const existingStudent = await Student.findOne({ cin: studentData.cin }).exec()
  if (existingStudent) {
    throw new Error('Student with this CIN already exists')
  }

  // Generate and hash password
  const generatedPassword = generateRandomPassword()
  const hashedPassword = await bcrypt.hash(generatedPassword, 12)

  // Create new student
  const newStudent = new Student({
    ...studentData,
    password: hashedPassword,
  })

  await newStudent.save()

  // Send welcome email
  try {
    const studentFullName = `${studentData.firstName} ${studentData.lastName}`
    const htmlEmailContent = generateEmailTemplatLoginInfo(
      studentFullName,
      generatedPassword
    )
    await sendEmail({
      to: studentData.email,
      subject: 'Welcome to ISAMM Internship Management System',
      html: htmlEmailContent,
    })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    // Don't throw error for email failure
  }

  // Return student data without password
  const { password, ...studentWithoutPassword } = newStudent.toObject()
  return { ...studentWithoutPassword, generatedPassword }
}

export const getStudents = async function () {
  const students = await Student.find().select('-password')
  if (!students.length) {
    throw new Error('No students found')
  }
  return students
}

export const getStudent = async function (id) {
  const student = await Student.findById(id).select('-password')
  if (!student) {
    throw new Error('Student not found')
  }
  return student
}

export const updateStudent = async function (id, studentData) {
  // Hash password if provided
  if (studentData.password) {
    studentData.password = await bcrypt.hash(studentData.password, 12)
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    id,
    studentData,
    { new: true, runValidators: true }
  ).select('-password')

  if (!updatedStudent) {
    throw new Error('Student not found')
  }

  return updatedStudent
}

export const deleteStudent = async function (id) {
  const deletedStudent = await Student.findByIdAndDelete(id)
  if (!deletedStudent) {
    throw new Error('Student not found')
  }
  return deletedStudent
}


