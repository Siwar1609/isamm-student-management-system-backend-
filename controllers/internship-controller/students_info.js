import Student from '../../models/users-models/student_model.js'
import Internship_planning from '../../models/planning-models/Internship_planning.js'

export const getAllStudents = async (req, res) => {
  try {
    // Find all students with the role 'student'
    const students = await Student.find() // Use .find() instead of .findall()
      .select('firstName lastName email internships') // Select specific fields
      .populate('internships') // Populate the internships field to get the internship details
      .exec()

    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No students found.' })
    }

    // Enhance each student with their postulation status and internship planning details
    const enhancedStudents = await Promise.all(
      students.map(async (student) => {
        // Ensure the internships field is an array, even if it's missing or empty
        const internships = Array.isArray(student.internships)
          ? student.internships
          : []

        // For each internship, check if the student has an internship planning associated with it
        const internshipPlannings = await Promise.all(
          internships.map(async (internship) => {
            const internshipPlanning = await Internship_planning.findOne({
              idInternship: internship._id, // Use internship._id for the reference
            })
              .populate('EvaluatorId', 'firstName lastName email') // Populate the evaluator (teacher)
              .populate('meeting', 'date time googleMeetLink') // Populate the meeting field
              .exec()

            return internshipPlanning
              ? {
                  internship: {
                    _id: internship._id, // Only include the ID
                    title: internship.title, // Include the title
                  },
                  published: internshipPlanning.published,
                  meeting: internshipPlanning.meeting || null, // Only include meeting details
                  sentEmail: internshipPlanning.sentEmail,
                  sentAt: internshipPlanning.sentAt,
                  evaluator: internshipPlanning.EvaluatorId || null,
                }
              : null
          }),
        )

        // Determine postulation status based on internships
        const postulationStatus =
          internships.length > 0
            ? 'postulated successfully'
            : 'did not postulate'

        return {
          ...student.toObject(),
          postulationStatus,
          internshipPlannings: internshipPlannings.filter(
            (planning) => planning !== null,
          ), // Filter out null if no planning found
        }
      }),
    )

    res.status(200).json({
      students: enhancedStudents,
      message: 'All students retrieved successfully!',
    })
  } catch (error) {
    console.error('Error:', error.message)
    res.status(500).json({
      error: error.message,
      message: 'Error retrieving students.',
    })
  }
}

export const getStudentDetails = async (req, res) => {
  try {
    const studentId = req.auth.userId // Make sure the studentId is correctly retrieved from req.auth
    console.log('Student ID: ', studentId) // Log the student ID

    // Find the student by ID
    const student = await Student.findById(studentId)
      .select('firstName lastName email internships') // Select specific fields
      .populate('internships') // Populate internships to get details
      .exec()

    if (!student) {
      console.log('Student not found.')
      return res.status(404).json({ message: 'Student not found.' })
    }

    console.log('Student found: ', student) // Log the student object

    // Enhance the student's internships with planning details
    const enhancedInternships = await Promise.all(
      student.internships.map(async (internship) => {
        const internshipPlanning = await Internship_planning.findOne({
          idInternship: internship._id, // Reference to the internship ID
        })
          .populate('EvaluatorId', 'firstName lastName email') // Populate evaluator details
          .populate('meeting', 'date time googleMeetLink') // Populate meeting details
          .exec()

        return internshipPlanning
          ? {
              internship: {
                _id: internship._id, // Only include the ID
                title: internship.title, // Include the title
              },
              published: internshipPlanning.published,
              meeting: internshipPlanning.meeting || null,
              sentEmail: internshipPlanning.sentEmail,
              sentAt: internshipPlanning.sentAt,
              evaluator: internshipPlanning.EvaluatorId || null,
            }
          : null
      }),
    )

    // Send back the student's details with enhanced internships
    return res.status(200).json({
      student: {
        ...student.toObject(),
        internshipPlannings: enhancedInternships.filter(
          (planning) => planning !== null,
        ),
      },
      message: 'Student details retrieved successfully!',
    })
  } catch (error) {
    console.error('Error:', error.message)
    return res.status(500).json({
      error: error.message,
      message: 'Error retrieving student details.',
    })
  }
}

export const getStudentDetailsById = async (req, res) => {
  try {
    // Ensure the admin provides a studentId as a parameter in the request
    const { studentId } = req.params // Get the studentId from the URL parameter
    console.log('Requested Student ID: ', studentId) // Log the requested student ID

    // Find the student by the provided ID
    const student = await Student.findById(studentId)
      .select('firstName lastName email internships') // Select specific fields
      .populate('internships') // Populate internships to get details
      .exec()

    if (!student) {
      console.log('Student not found.')
      return res.status(404).json({ message: 'Student not found.' })
    }

    console.log('Student found: ', student) // Log the student object

    // Enhance the student's internships with planning details
    const enhancedInternships = await Promise.all(
      student.internships.map(async (internship) => {
        const internshipPlanning = await Internship_planning.findOne({
          idInternship: internship._id, // Reference to the internship ID
        })
          .populate('EvaluatorId', 'firstName lastName email') // Populate evaluator details
          .populate('meeting', 'date time googleMeetLink') // Populate meeting details
          .exec()

        return internshipPlanning
          ? {
              internship: {
                _id: internship._id, // Only include the ID
                title: internship.title, // Include the title
              },
              published: internshipPlanning.published,
              meeting: internshipPlanning.meeting || null,
              sentEmail: internshipPlanning.sentEmail,
              sentAt: internshipPlanning.sentAt,
              evaluator: internshipPlanning.EvaluatorId || null,
            }
          : null
      }),
    )

    // Send back the student's details with enhanced internships
    return res.status(200).json({
      student: {
        ...student.toObject(),
        internshipPlannings: enhancedInternships.filter(
          (planning) => planning !== null,
        ),
      },
      message: 'Student details retrieved successfully!',
    })
  } catch (error) {
    console.error('Error:', error.message)
    return res.status(500).json({
      error: error.message,
      message: 'Error retrieving student details.',
    })
  }
}
