import Option from '../../models/option-models/option_model.js'
import AcademicYear from '../../models/academic_year_models/academic-year-model.js'
import Period from '../../models/period-model/period_model.js'
import Student from '../../models/users-models/student_model.js'

// Add Option Controller
export const addOption = async (req, res) => {
  try {
    // Destructure the required fields from the request body
    const {
      name,
      reason,
      academic_year,
      url,
      groupName,
      repitationIn1stYear,
      generalAverage,
      integrationYear,
      successSession,
      webDevGrade,
      oopGrade,
      algorithmsGrade,
    } = req.body

    // Validate required fields
    if (
      !name ||
      !reason ||
      !academic_year ||
      !url ||
      !groupName ||
      !repitationIn1stYear ||
      !integrationYear ||
      !successSession
    ) {
      return res.status(400).json({
        message: 'Missing required fields.',
      })
    }

    // Fetch the logged-in student's ID from the session or authentication middleware
    const studentId = req.auth.userId // Assuming `req.user` is populated by your authentication middleware
    if (!studentId) {
      return res.status(403).json({ message: 'User not authenticated.' })
    }

    // Validate the student's existence
    const studentExists = await Student.exists({ _id: studentId })
    if (!studentExists) {
      return res.status(404).json({ message: 'Invalid student ID.' })
    }

    // Validate referenced IDs
    const academicYearExists = await AcademicYear.exists({ _id: academic_year })
    if (!academicYearExists) {
      return res.status(400).json({ message: 'Invalid academic year ID.' })
    }

    // Fetch the most recent active period dynamically
    const currentPeriod = await Period.findOne({
      name: 'Choix d’option',
      end_date: { $gte: new Date() }, // Period end date is after or equal to today
    })

    if (!currentPeriod) {
      return res
        .status(400)
        .json({ message: 'No active period for option choices.' })
    }
    const existingOption = await Option.findOne({
      student: studentId,
      period: currentPeriod._id,
    })

    if (existingOption) {
      return res.status(400).json({
        message: 'The student has already posted an option for this period.',
      })
    }

    // Create a new Option instance
    const newOption = new Option({
      name,
      reason,
      student: [studentId], // Associate the option with the logged-in student
      academic_year,
      period: currentPeriod._id, // Assign dynamically fetched period
      url,
      groupName,
      repitationIn1stYear,
      generalAverage,
      integrationYear,
      successSession,
      webDevGrade,
      oopGrade,
      algorithmsGrade,
    })

    // Save the Option to the database
    const savedOption = await newOption.save()

    // Respond with the saved Option
    res.status(201).json({
      message: 'Option added successfully.',
      option: savedOption,
    })
  } catch (error) {
    console.error('Error adding option:', error)
    res.status(500).json({
      message: 'An error occurred while adding the option.',
      error: error.message,
    })
  }
}

// Get All Options
export const getAllOptions = async (req, res) => {
  try {
    // Fetch all options and populate the references
    const options = await Option.find()
      .populate('student', 'firstName lastName cin email') // Populate student details (name, email for example)
      .populate('academic_year', 'start_year end_year')
      .populate('period', 'name start_date end_date') // Populate academic year details (e.g., year, name)

    if (!options || options.length === 0) {
      return res.status(404).json({ message: 'No options found.' })
    }

    // Respond with the populated options
    res.status(200).json({ options })
  } catch (error) {
    console.error('Error fetching options:', error)
    res.status(500).json({
      message: 'An error occurred while fetching options.',
      error: error.message,
    })
  }
}

// Get Options by Student ID
export const getOptionsByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params

    // Validate the student ID
    const studentExists = await Student.find({ _id: studentId })
    if (!studentExists) {
      return res.status(404).json({ message: 'Student not found.' })
    }

    // Fetch options associated with the student and populate the references
    const options = await Option.find({ student: studentId })
      .populate('student', 'firstName lastName cin email') // Populate student details (name, email for example)
      .populate('academic_year', 'start_year end_year')
      .populate('period', 'name start_date end_date') // Populate academic year details (e.g., year, name)

    if (!options || options.length === 0) {
      return res
        .status(404)
        .json({ message: `No options found for student with ID ${studentId}.` })
    }

    // Respond with the populated options
    res.status(200).json({ options })
  } catch (error) {
    console.error('Error fetching options by student ID:', error)
    res.status(500).json({
      message: 'An error occurred while fetching options by student ID.',
      error: error.message,
    })
  }
}
