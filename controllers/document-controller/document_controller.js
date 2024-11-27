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

    const internship = await Internship.findById(internshipId)
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' })
    }

    const currentDate = new Date()
    if (currentDate > new Date(internship.endDate)) {
      return res.status(403).json({
        message:
          'You cannot upload documents after the internship period has ended.',
      })
    }
    let encadrantUser = null
    if (encadrant) {
      encadrantUser = await User.findById(encadrant)
      console.log('Encadrant Found:', encadrantUser)
      if (!encadrantUser || encadrantUser.role !== 'enseignant') {
        return res
          .status(400)
          .json({ message: 'Invalid encadrant ID provided.' })
      }
    }

    const documentPayload = {
      name,
      url,
      uploadedBy: studentId,
      internship: internshipId,
      encadrant: encadrant || null,
    }

    console.log('Document Payload:', documentPayload)

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

export const getDocumentsByStudentId = async (req, res) => {
  try {
    const studentId = req.params.studentId // Get student ID from URL

    // Find documents for the specific student and populate related fields
    const documents = await Document.find({ uploadedBy: studentId })
      .populate('uploadedBy', 'login') // Populate student login
      .populate('internship', 'startDate endDate') // Populate internship period dates (if applicable)
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

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Scheduled Task
cron.schedule('* * * * *', async () => {
  console.log('Starting the check for students without uploaded documents...')

  try {
    const today = new Date()
    console.log(`Today's date: ${today.toISOString()}`)

    // Trouver tous les stages expirés
    const expiredInternships = await Internship.find({
      endDate: { $lt: today },
    }).exec()

    if (expiredInternships.length === 0) {
      console.log('No expired internships found.')
      return
    }

    for (const internship of expiredInternships) {
      const internshipId = internship._id
      console.log(
        `Processing internship: ${internshipId} (End date: ${internship.endDate})`,
      )

      // Récupérer les IDs des utilisateurs ayant téléchargé des documents
      const documents = await Document.find({
        internship: internshipId,
      }).exec()
      const uploadedByIds = documents.map((doc) => doc.uploadedBy.toString())

      console.log(
        `Uploaded by IDs for internship ${internshipId}: ${uploadedByIds}`,
      )

      // Trouver les étudiants sans documents
      const studentsWithoutDocs = await User.find({
        _id: { $nin: uploadedByIds },
        role: 'etudiant',
      }).exec()

      if (studentsWithoutDocs.length === 0) {
        console.log(
          `All students have uploaded documents for internship ${internshipId}.`,
        )
        continue
      }

      for (const student of studentsWithoutDocs) {
        console.log(`Found student without document: ${student.login}`)
        if (student.email) {
          try {
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: student.email,
              subject: 'Document Submission Reminder',
              text: `Dear ${student.fullName},\n\nWe want to remind you that the deadline for submitting your internship documents has passed. Please contact the administrator for further instructions.\n\nBest regards,\nYour Team`,
            })
            console.log(`Email sent successfully to ${student.email}`)
          } catch (emailError) {
            console.error(
              `Failed to send email to ${student.email}: ${emailError.message}`,
            )
          }
        } else {
          console.log(`No email address found for student: ${student.login}`)
        }
      }
    }
  } catch (error) {
    console.error(
      'Error occurred while checking for students without uploaded documents:',
      error,
    )
  }
})
