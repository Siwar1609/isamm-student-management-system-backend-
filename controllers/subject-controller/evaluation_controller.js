import crypto from 'crypto'
import Subject from '../../models/subject-models/subject_model.js'
import Evaluation from '../../models/subject-models/evaluation_model.js'

export const submitEvaluation = async (req, res) => {
  try {
    const { subjectID } = req.params // Extract subjectID from URL parameters
    const studentID = req.auth.userId // Extract the student ID from the token

    // Hash the student ID
    const hashedStudentID = crypto
      .createHash('sha256')
      .update(studentID)
      .digest('hex')

    const { questions } = req.body

    // Check if the subject exists
    const subject = await Subject.findById(subjectID)
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' })
    }

    // Check if the student is allowed to evaluate this subject
    const isStudentInSubject = subject.studentId.includes(studentID)
    if (!isStudentInSubject) {
      return res.status(403).json({
        message: 'You are not allowed to evaluate this subject',
      })
    }

    // Check if the student has already submitted an evaluation for this subject
    const existingEvaluation = await Evaluation.findOne({
      subjectID,
      hashedStudentID, // Compare the hashed version
    })

    if (existingEvaluation) {
      return res.status(400).json({
        message: 'You have already submitted an evaluation for this subject',
      })
    }

    // Save the evaluation
    const evaluation = new Evaluation({
      subjectID,
      hashedStudentID,
      questions,
    })

    await evaluation.save()

    res.status(201).json({ message: 'Evaluation submitted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getEvaluations = async (req, res) => {
  try {
    const userID = req.auth.userId // Extract the logged-in user's ID
    const userRole = req.auth.role // Extract the user's role (e.g., "admin" or "teacher")

    if (userRole === 'admin') {
      // Admin: Retrieve all evaluations
      const evaluations = await Evaluation.find().populate('subjectID', 'title')
      return res.status(200).json({ evaluations })
    } else if (userRole === 'teacher') {
      // Teacher: Retrieve evaluations only for their assigned subjects
      const subjects = await Subject.find({ teacherId: userID }).select('_id')
      const subjectIDs = subjects.map((subject) => subject._id)

      if (subjectIDs.length === 0) {
        return res
          .status(404)
          .json({ message: 'No subjects found for this teacher' })
      }

      const evaluations = await Evaluation.find({
        subjectID: { $in: subjectIDs },
      }).populate('subjectID')
      return res.status(200).json({ evaluations })
    } else {
      return res
        .status(403)
        .json({ message: 'You are not authorized to access evaluations' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
