import Internship from '../../models/internship-models/internship_period_model.js'
import Document from '../../models/document-models/document_model.js'

export const addInternship = async (req, res) => {
  try {
    const { startDate, endDate, name, level } = req.body

    // Validate that the level is provided
    if (!level || !['1st year', '2nd year'].includes(level)) {
      return res.status(400).json({
        message:
          'Level is required and must be either "1st year" or "2nd year".',
      })
    }

    // Validate that the start date is before the end date
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message:
          'Invalid date range. The end date must be after the start date.',
      })
    }

    // Check if an internship with the same date range already exists
    const existingInternship = await Internship.findOne({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    })

    if (existingInternship) {
      return res.status(400).json({
        message: 'An internship with the same date range already exists.',
      })
    }

    // Determine the status
    const today = new Date()
    let status
    if (today > new Date(endDate)) {
      status = 'ended'
    } else if (today >= new Date(startDate)) {
      status = 'active'
    } else {
      status = 'pending'
    }

    // Create the internship
    const newInternship = await Internship.create({
      startDate,
      endDate,
      status,
      level, // Add the level here
      name,
    })

    res.status(201).json({
      model: newInternship,
      message: 'Internship period successfully added!',
    })
  } catch (error) {
    console.error('Error during addInternship:', error)
    res.status(400).json({
      error: error.message,
      message: 'Error adding internship period',
    })
  }
}

export const updateInternship = async (req, res) => {
  try {
    const internshipId = req.params.id
    const { startDate, endDate, level, ...otherUpdates } = req.body

    // Find the internship by ID
    const existingInternship = await Internship.findById(internshipId)
    if (!existingInternship) {
      return res.status(404).json({ message: 'Internship not found' })
    }

    // Validate the level field if it's provided
    if (level && !['1st year', '2nd year'].includes(level)) {
      return res.status(400).json({
        message: 'Level must be either "1st year" or "2nd year".',
      })
    }

    // Validate start and end dates
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message:
          'Invalid date range. The end date must be after the start date.',
      })
    }

    // Check if an internship with the same date range already exists (excluding the current one)
    if (startDate && endDate) {
      const duplicateInternship = await Internship.findOne({
        _id: { $ne: internshipId }, // Exclude the current internship
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })

      if (duplicateInternship) {
        return res.status(400).json({
          message: 'An internship with the same date range already exists.',
        })
      }
    }

    // Update fields
    if (startDate) existingInternship.startDate = new Date(startDate)
    if (endDate) existingInternship.endDate = new Date(endDate)
    if (level) existingInternship.level = level

    Object.assign(existingInternship, otherUpdates)

    // Update the status based on the updated dates
    const today = new Date()
    if (today > new Date(existingInternship.endDate)) {
      existingInternship.status = 'ended'
    } else if (today >= new Date(existingInternship.startDate)) {
      existingInternship.status = 'active'
    } else {
      existingInternship.status = 'pending'
    }

    // Save the updated internship
    await existingInternship.save()

    res.status(200).json({
      model: existingInternship,
      message: 'Internship successfully updated!',
    })
  } catch (error) {
    console.error('Error during updateInternship:', error)
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
