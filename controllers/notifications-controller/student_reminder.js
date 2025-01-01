import cron from 'node-cron'
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
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Function to schedule the student reminder
export const scheduleStudentReminder = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Starting the check for students without internships...')

    try {
      const today = new Date()
      console.log(`Today's date: ${today.toISOString()}`)

      // Get all students from the Student collection
      const students = await Student.find().exec()

      if (students.length === 0) {
        console.log('No students found.')
        return
      }

      for (const student of students) {
        // Check if the student has any internship associated with their ID
        const internshipExists = await Internship.findOne({
          studentId: student._id, // Assuming 'studentId' is the reference to the student in the Internship model
        })

        // If the student has at least one internship, skip sending an email
        if (internshipExists) {
          console.log(
            `Student ${student.firstName} ${student.lastName} has at least one internship.`,
          )
          continue
        }

        // Send email reminder if no internship is found
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
    }
  })

  console.log('Student reminder cron job scheduled.')
}
