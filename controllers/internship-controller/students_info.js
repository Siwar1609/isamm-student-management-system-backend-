import Document from '../../models/document-models/document_model.js'
import User from '../../models/users-models/user_model.js'

export const getAllStudents = async (req, res) => {
  try {
    // Find all users with the role 'etudiant'
    const students = await User.find({ role: 'student' })
      .select('fullName email login') // Select specific fields to return
      .exec()

    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No students found.' })
    }

    // Enhance each student with their postulation status and details
    const enhancedStudents = await Promise.all(
      students.map(async (student) => {
        const documents = await Document.find({ uploadedBy: student._id })
          .populate('internship', 'title startDate endDate') // Populate internship details
          .populate('encadrant', 'fullName email') // Populate enseignant details
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
