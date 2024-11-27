import Internship from '../../models/internship-models/internship_model.js'
import Document from '../../models/document-models/document_model.js'

export const addInternship = async (req, res) => {
  try {
    const { startDate, endDate } = req.body

    // Validate that the start date is before the end date
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message:
          'Invalid date range. The end date must be after the start date.',
      })
    }

    // Create a new internship period
    const newInternship = await Internship.create({
      startDate,
      endDate,
    })

    res.status(201).json({
      model: newInternship,
      message: 'Internship period successfully added!',
    })
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: 'Error adding internship period',
    })
  }
}

export const updateInternship = async (req, res) => {
  try {
    const internshipId = req.params.id
    const { startDate, endDate, ...otherUpdates } = req.body

    // Find the internship by ID
    const existingInternship = await Internship.findById(internshipId)
    if (!existingInternship) {
      return res.status(404).json({ message: 'Internship not found' })
    }

    // Validate start and end dates
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message:
          'Invalid date range. The end date must be after the start date.',
      })
    }

    // Update fields
    if (startDate) existingInternship.startDate = new Date(startDate)
    if (endDate) existingInternship.endDate = new Date(endDate)
    Object.assign(existingInternship, otherUpdates)

    // Save the updated internship
    await existingInternship.save()

    res.status(200).json({
      model: existingInternship,
      message: 'Internship successfully updated!',
    })
  } catch (error) {
    console.error('Error during updateInternship:', error) // Log the error
    res.status(400).json({
      error: error.message,
      message: 'Error updating internship',
    })
  }
}

export const getAllInternships = async (req, res) => {
  try {
    const internships = await Internship.find()

    res.status(200).json({
      models: internships,
      message: 'Internship periods retrieved successfully!',
    })
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: 'Error retrieving internship periods',
    })
  }
}

export const getInternshipById = async (req, res) => {
  try {
    const internshipId = req.params.id

    const singleInternship = await Internship.findById(internshipId)
    if (!singleInternship) {
      return res.status(404).json({ message: 'Internship period not found' })
    }

    res.status(200).json({
      model: singleInternship,
      message: 'Internship period retrieved successfully!',
    })
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: 'Error retrieving internship period',
    })
  }
}

export const deleteInternship = async (req, res) => {
  try {
    const internshipId = req.params.id

    // Check if the internship exists
    const existingInternship = await Internship.findById(internshipId)
    if (!existingInternship) {
      return res.status(404).json({ message: 'Internship period not found' })
    }

    // Delete the internship
    await Internship.findByIdAndDelete(internshipId)

    // Delete all documents related to the internship
    await Document.deleteMany({ internship: internshipId })

    res.status(200).json({
      message: 'Internship period and related documents successfully deleted!',
    })
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: 'Error deleting internship period',
    })
  }
}
