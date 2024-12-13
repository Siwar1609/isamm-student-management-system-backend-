import Internship from '../../models/internship-models/internship_model.js'
import Document from '../../models/document-models/document_model.js'
import Student from '../../models/users-models/student_model.js'
import Period from '../../models/period-model/period_model.js'

export const addStudentDocument = async (req, res) => {
  try {
    console.log('Request Body:', req.body)

    const { id: internshipId } = req.params // Internship ID from URL
    const { type, url } = req.body // Document details (no encadrant)
    const studentId = req.auth.userId // Extracted from Bearer token

    // Log the extracted student ID
    console.log('Extracted Student ID (from token):', studentId)

    // Find the internship and check if it exists
    const internship = await Internship.findById(internshipId)
    if (!internship) {
      console.log('Internship not found for ID:', internshipId)
      return res.status(404).json({ message: 'Internship not found' })
    }

    // Log the student ID in the internship
    console.log('Student ID in Internship:', internship.studentId)

    // Check if the student exists
    const student = await Student.findById(studentId)
    if (!student) {
      console.log('Student not found for ID:', studentId)
      return res.status(404).json({ message: 'Student not found' })
    }

    // Check if the current date is within the internship period
    const currentDate = new Date()

    // Fetch the associated period using internship.periodeId
    const period = await Period.findById(internship.periodeId)
    if (!period) {
      return res.status(404).json({
        message: 'The period associated with this internship was not found.',
      })
    }

    // Validate the current date is within the period
    if (
      currentDate < new Date(period.startDate) ||
      currentDate > new Date(period.endDate)
    ) {
      console.log('Current date is outside the allowed period:', {
        startDate: period.startDate,
        endDate: period.endDate,
      })
      return res.status(403).json({
        message: 'You cannot upload documents outside the allowed period.',
      })
    }

    console.log('Current date is within the period:', {
      startDate: period.startDate,
      endDate: period.endDate,
    })

    // Prepare the document payload without the encadrant
    const documentPayload = {
      type,
      url,
      uploadedBy: studentId,
      internship: internshipId,
      // Remove encadrant as it is no longer in the schema
    }

    console.log('Document Payload:', documentPayload)

    // Create the document and save it to the database
    const newDocument = await Document.create(documentPayload)

    // Push the new document ID into the internship's documents array
    internship.documents.push(newDocument._id)
    await internship.save()

    res.status(201).json({
      model: newDocument,
      message: 'Document uploaded successfully and linked to the internship!',
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
      .populate('uploadedBy', 'firstName lastName cin level email') // Populate student details
      .populate('internship', 'status description startDate endDate') // Populate internship period
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
      .populate('uploadedBy', 'firstName lastName cin level email') // Populate student details
      .populate('internship', 'status description startDate endDate') // Populate internship period
      .exec() // Execute the query

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
