import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import Student from '../../models/users-models/student_model.js'
import Internship from '../../models/internship-models/internship_model.js'

dotenv.config()

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

let isRunning = false // Prevent multiple simultaneous executions

// Function to send student reminder emails manually
export const scheduleStudentReminder = async () => {
  if (isRunning) {
    console.log('Reminder function is already running, skipping execution.')
    return
  }

  isRunning = true
  console.log('Starting the check for students without internships...')

  try {
    const today = new Date()
    console.log(`Today's date: ${today.toISOString()}`)

    const students = await Student.find().exec()

    if (students.length === 0) {
      console.log('No students found.')
      isRunning = false
      return
    }

    const emailedStudents = new Set() // To avoid duplicate emails

    for (const student of students) {
      // Skip if we already emailed this student
      if (emailedStudents.has(student.email)) {
        console.log(`Skipping duplicate email for ${student.email}`)
        continue
      }

      // Check if the student has an internship
      const internshipExists = await Internship.findOne({
        studentId: student._id,
      })

      if (internshipExists) {
        console.log(
          `Student ${student.firstName} ${student.lastName} has at least one internship.`,
        )
        continue
      }

      console.log(
        `Student ${student.firstName} ${student.lastName} has no internship.`,
      )

      if (student.email) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: 'Internship Postulation Reminder',
            text: `Dear ${student.firstName} ${student.lastName},\n\nWe noticed that you have not applied for any internship. Please make sure to apply for an internship before the deadline.\n\nBest regards,\nYour Team`,
          })
          console.log(`Email sent successfully to ${student.email}`)
          emailedStudents.add(student.email) // Mark as emailed
        } catch (emailError) {
          console.error(
            `Failed to send email to ${student.email}: ${emailError.message}`,
          )
        }
      } else {
        console.log(
          `No email address found for student: ${student.firstName} ${student.lastName}`,
        )
      }
    }
  } catch (error) {
    console.error(
      'Error occurred while checking for students without internships:',
      error,
    )
  } finally {
    isRunning = false // Unlock execution
  }
}
