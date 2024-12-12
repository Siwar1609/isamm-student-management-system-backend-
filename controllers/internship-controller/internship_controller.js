import Internship from '../../models/internship-models/internship_model.js'
import Document from '../../models/document-models/document_model.js'
import Period from '../../models/period-model/period_model.js'
import AcademicYear from '../../models/academic_year_models/academic-year-model.js'
import Student from '../../models/users-models/student_model.js'
// Add internship
export const addInternship = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      academicYear,
      studentId,
      title,
      level, // Added level here
      description,
    } = req.body

    const { type } = req.params // Extract type from URL parameters
    console.log('Type from URL:', type)

    // Validate required fields
    if (!academicYear || !studentId || !title || !description || !level) {
      return res.status(400).json({ message: 'Required fields are missing.' })
    }

    // Check if academic year exists
    const academicYearExists = await AcademicYear.findById(academicYear)
    if (!academicYearExists) {
      return res.status(404).json({ message: 'Academic Year not found.' })
    }

    // Check if student exists
    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' })
    }

    // Find an open period matching the level
    const today = new Date()
    const openPeriods = await Period.find({
      name: 'Dépôt de stage',
      type: parseInt(type), // Ensure type matches level
      end_date: { $gte: new Date(today) }, // Ensure both are Date objects
    })

    console.log('Open periods found:', openPeriods) // Logging periods found

    if (openPeriods.length === 0) {
      return res
        .status(404)
        .json({ message: 'No open period matching the level found.' })
    }

    // Validate date range
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message:
          'Invalid date range. The end date must be after the start date.',
      })
    }

    // Check for overlapping internships
    const existingInternship = await Internship.findOne({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      studentId,
    })

    if (existingInternship) {
      return res.status(400).json({
        message:
          'An internship with the same date range already exists for this student.',
      })
    }

    // Determine status
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
      academicYear,
      studentId,
      title,
      level, // Added level here
      description,
      published: true, // Default value
      Validate: { value: false, reason: '' }, // Default values
      periodeId: openPeriods[0]._id, // Assign the first matched period
    })

    // Add internship to the student's internships array
    student.internships.push(newInternship._id)
    await student.save() // Save the updated student document

    res.status(201).json({
      model: newInternship,
      message:
        'Internship period successfully added and linked to the student!',
    })
  } catch (error) {
    console.error('Error during addInternship:', error)
    res
      .status(400)
      .json({ error: error.message, message: 'Error adding internship period' })
  }
}

// Update internship
export const updateInternship = async (req, res) => {
  try {
    const internshipId = req.params.id
    const {
      startDate,
      endDate,
      academicYear,
      studentId,
      periodeId,
      published,
      Validate,
      title,
      description,
      level, // Added level here for update
    } = req.body

    // Find the internship
    const existingInternship = await Internship.findById(internshipId)
    if (!existingInternship) {
      return res.status(404).json({ message: 'Internship not found' })
    }

    // Check if academic year exists
    if (academicYear) {
      const academicYearExists = await AcademicYear.findById(academicYear)
      if (!academicYearExists) {
        return res.status(404).json({ message: 'Academic Year not found.' })
      }
    }

    // Check if student exists
    if (studentId) {
      const student = await Student.findById(studentId)
      if (!student) {
        return res.status(404).json({ message: 'Student not found.' })
      }
    }

    // Fetch the period to validate its name and endDate
    const period = await Period.findById(
      periodeId || existingInternship.periodeId,
    )
    if (!period) {
      return res.status(404).json({ message: 'Period not found.' })
    }

    if (period.name !== 'Dépôt de stage') {
      return res
        .status(400)
        .json({ message: 'The period name must be "Dépôt de stage".' })
    }

    if (new Date() > new Date(period.endDate)) {
      return res
        .status(400)
        .json({ message: 'The submission period has ended.' })
    }

    // Validate date range
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message:
          'Invalid date range. The end date must be after the start date.',
      })
    }

    // Update fields
    if (startDate) existingInternship.startDate = new Date(startDate)
    if (endDate) existingInternship.endDate = new Date(endDate)
    if (academicYear) existingInternship.academicYear = academicYear
    if (studentId) existingInternship.studentId = studentId
    if (title) existingInternship.title = title
    if (description) existingInternship.description = description
    if (published !== undefined) existingInternship.published = published
    if (Validate) existingInternship.Validate = Validate
    if (periodeId) existingInternship.periodeId = periodeId
    if (level !== undefined) existingInternship.level = level // Update level here

    // Recalculate status
    const today = new Date()
    if (today > new Date(existingInternship.endDate)) {
      existingInternship.status = 'ended'
    } else if (today >= new Date(existingInternship.startDate)) {
      existingInternship.status = 'active'
    } else {
      existingInternship.status = 'pending'
    }

    // Save updates
    await existingInternship.save()

    res.status(200).json({
      model: existingInternship,
      message: 'Internship successfully updated!',
    })
  } catch (error) {
    console.error('Error during updateInternship:', error)
    res
      .status(400)
      .json({ error: error.message, message: 'Error updating internship' })
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
      .populate('academicYear')
      .populate('studentId', '-password') // Exclude the password field
      .populate('periodeId')

    if (!singleInternship) {
      return res.status(404).json({ message: 'Internship period not found' })
    }

    res.status(200).json({
      model: singleInternship,
      message: 'Internship period retrieved successfully!',
    })
  } catch (error) {
    console.error('Error retrieving internship:', error)
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
