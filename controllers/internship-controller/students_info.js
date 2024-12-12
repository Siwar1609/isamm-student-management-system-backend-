import Document from '../../models/document-models/document_model.js'
import Student from '../../models/users-models/student_model.js'
import Internship_planning from '../../models/planning-models/Internship_planning.js'

export const getAllStudents = async (req, res) => {
  try {
    // Find all students with the role 'student'
    const students = await Student.find() // Use .find() instead of .findall()
      .select('firstName lastName email cin internships') // Select specific fields
      .populate('internships') // Populate the internships field to get the internship details
      .exec()

    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No students found.' })
    }

    // Enhance each student with their postulation status and details
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
              .populate('EvaluatorId', 'fullName email') // Populate the evaluator (teacher)
              .exec()

            return internshipPlanning
              ? {
                  internship,
                  published: internshipPlanning.published,
                  meeting: internshipPlanning.meeting || null,
                  sentEmail: internshipPlanning.sentEmail,
                  sentAt: internshipPlanning.sentAt,
                  evaluator: internshipPlanning.EvaluatorId || null,
                }
              : null
          }),
        )

        // Fetch the documents related to this student
        const documents = await Document.find({ uploadedBy: student._id })
          .populate(
            'internship',
            'title description status level startDate endDate',
          ) // Populate internship details
          .exec()

        // Determine postulation status
        const postulationStatus =
          documents.length > 0 ? 'postulated successfully' : 'did not postulate'

        return {
          ...student.toObject(),
          postulationStatus,
          postulations: documents.map((doc) => ({
            documentName: doc.name,
            internship: doc.internship || null,
            encadrant: doc.encadrant || null,
          })),
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
