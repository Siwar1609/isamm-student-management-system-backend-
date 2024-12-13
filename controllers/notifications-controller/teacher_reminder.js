import cron from 'node-cron'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import Teacher from '../../models/users-models/teacher_model.js'

dotenv.config()

// Environment variables for email credentials
const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASSWORD

// Create transporter for sending email
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
})

// Function to schedule the email reminder
export const scheduleTeacherReminder = () => {
  cron.schedule('0 9 1 * *', async () => {
    console.log('Starting the email reminders for teachers...')

    try {
      const today = new Date()
      console.log(`Today's date: ${today.toISOString()}`)

      // Get all teachers directly from the Teacher collection
      const teachers = await Teacher.find().exec()

      if (teachers.length === 0) {
        console.log('No teachers found.')
        return
      }

      // Loop through all teachers and send an email reminder
      for (const teacher of teachers) {
        console.log(
          `Sending reminder to Teacher ${teacher.firstName} ${teacher.lastName}`,
        )

        if (teacher.email) {
          try {
            await transporter.sendMail({
              from: EMAIL_USER,
              to: teacher.email,
              subject: 'Monthly Reminder: Update Your Progress',
              text: `Dear ${teacher.firstName} ${teacher.lastName},\n\nThis is a friendly reminder to update your progress for this month.\n\nBest regards,\nYour System`,
            })
            console.log(`Email sent successfully to ${teacher.email}`)
          } catch (emailError) {
            console.error(
              `Failed to send email to ${teacher.email}: ${emailError.message}`,
            )
          }
        } else {
          console.log(
            `No email address found for teacher: ${teacher.firstName} ${teacher.lastName}`,
          )
        }
      }
    } catch (error) {
      console.error('Error occurred while sending email reminders:', error)
    }
  })

  console.log('Teacher reminder cron job scheduled.')
}
