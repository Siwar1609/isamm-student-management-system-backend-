import Internship from '../../models/internship-models/internship_model.js'
import Document from '../../models/document-models/document_model.js'
import User from '../../models/users-models/user_model.js'
import cron from 'node-cron'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

export const addStudentDocument = async (req, res) => {
  try {
    console.log('Request Body:', req.body)

    const { id: internshipId } = req.params
    const { name, url, encadrant } = req.body
    const studentId = req.auth.userId

    // Find the internship and check if it exists
    const internship = await Internship.findById(internshipId)
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' })
    }

    // Check if the student's level matches the internship's level
    const student = await User.findById(studentId)
    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }

    if (student.role === 'student') {
      // Check if the internship's level matches the student's level
      if (internship.level !== student.level) {
        return res.status(403).json({
          message:
            'You cannot postulate for this internship because the level does not match.',
        })
      }
    }

    // Check if the current date is within the internship period
    const currentDate = new Date()
    if (currentDate > new Date(internship.endDate)) {
      return res.status(403).json({
        message:
          'You cannot upload documents after the internship period has ended.',
      })
    }

    // Validate the encadrant (teacher) if provided
    let encadrantUser = null
    if (encadrant) {
      encadrantUser = await User.findById(encadrant)
      console.log('Encadrant Found:', encadrantUser)
      if (!encadrantUser || encadrantUser.role !== 'teacher') {
        return res
          .status(400)
          .json({ message: 'Invalid encadrant ID provided.' })
      }
    }

    // Prepare the document payload
    const documentPayload = {
      name,
      url,
      uploadedBy: studentId,
      internship: internshipId,
      encadrant: encadrant || null,
    }

    console.log('Document Payload:', documentPayload)

    // Create the document and save it to the database
    const newDocument = await Document.create(documentPayload)

    res.status(201).json({
      model: newDocument,
      message: 'Document uploaded successfully!',
    })
  } catch (error) {
    console.error('Error:', error.message)
    res.status(400).json({
      error: error.message,
      message: 'Error uploading document',
    })
  }
}

export const getAllDocuments = async (req, res) => {
  try {
    // Retrieve all documents from the database
    const documents = await Document.find()
      .populate('uploadedBy', 'login fullName email') // Populate student details
      .populate('internship', 'startDate endDate') // Populate internship period
      .populate('encadrant', 'fullName email') // Populate encadrant details (only specific fields)
      .exec() // Execute the query

    if (!documents || documents.length === 0) {
      return res.status(404).json({ message: 'No documents found.' })
    }

    res.status(200).json({
      documents,
      message: 'All documents retrieved successfully!',
    })
  } catch (error) {
    console.error('Error:', error.message)
    res.status(500).json({
      error: error.message,
      message: 'Error retrieving documents.',
    })
  }
}

export const getDocumentsByStudentId = async (req, res) => {
  try {
    const studentId = req.params.studentId // Get student ID from URL

    // Find documents for the specific student and populate related fields
    const documents = await Document.find({ uploadedBy: studentId })
      .populate('uploadedBy', 'login fullName email') // Populate student login
      .populate('internship', 'startDate endDate') // Populate internship period dates (if applicable)
      .populate('encadrant', 'login fullName email') // Populate encadrant information endDate') // Populate internship period dates (if applicable)

      .exec()

    if (!documents || documents.length === 0) {
      return res
        .status(404)
        .json({ message: 'No documents found for this student.' })
    }

    res.status(200).json({
      documents,
      message: 'Documents for the student retrieved successfully!',
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: 'Error retrieving student documents.',
    })
  }
}

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Scheduled Task
cron.schedule('0 0 * * *', async () => {
  console.log('Starting the check for students without postulations...')

  try {
    const today = new Date()
    console.log(`Today's date: ${today.toISOString()}`)

    // Get all students
    const students = await User.find({ role: 'etudiant' }).exec()

    if (students.length === 0) {
      console.log('No students found.')
      return
    }

    for (const student of students) {
      // Check if the student has any documents associated with internships
      const documents = await Document.find({ uploadedBy: student._id })
        .populate('internship', 'title endDate')
        .exec()

      const hasPostulated = documents.some(
        (doc) => doc.internship && new Date(doc.internship.endDate) >= today,
      )

      if (!hasPostulated) {
        console.log(`Student ${student.fullName} has not postulated.`)

        // Send email reminder
        if (student.email) {
          try {
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: student.email,
              subject: 'Internship Postulation Reminder',
              text: `Dear ${student.fullName},\n\nWe noticed that you have not postulated for any internship. Please ensure to submit your documents before the deadlines.\n\nBest regards,\nYour Team`,
            })
            console.log(`Email sent successfully to ${student.email}`)
          } catch (emailError) {
            console.error(
              `Failed to send email to ${student.email}: ${emailError.message}`,
            )
          }
        } else {
          console.log(`No email address found for student: ${student.fullName}`)
        }
      } else {
        console.log(
          `Student ${student.fullName} has postulated successfully for at least one internship.`,
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
