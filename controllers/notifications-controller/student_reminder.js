import cron from 'node-cron'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import Student from '../../models/users-models/student_model.js'
import Document from '../../models/document-models/document_model.js'

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
  cron.schedule('* * * * *', async () => {
    console.log('Starting the check for students without postulations...')

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
        // Check if the student has any documents associated with internships
        const documents = await Document.find({ uploadedBy: student._id })
          .populate('internship', 'title periodeId')
          .exec()

        // If the student has uploaded documents, skip sending an email
        if (documents.length > 0) {
          console.log(
            `Student ${student.firstName} ${student.lastName} has postulated successfully for at least one internship.`,
          )
          continue
        }

        // Send email reminder if no documents are found
        console.log(
          `Student ${student.firstName} ${student.lastName} has not postulated.`,
        )

        if (student.email) {
          try {
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: student.email,
              subject: 'Internship Postulation Reminder',
              text: `Dear ${student.firstName} ${student.lastName},\n\nWe noticed that you have not postulated for any internship. Please ensure to submit your documents before the deadlines.\n\nBest regards,\nYour Team`,
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
        'Error occurred while checking for students without postulations:',
        error,
      )
    }
  })

  console.log('Student reminder cron job scheduled.')
}
