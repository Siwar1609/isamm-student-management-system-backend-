import Subject from '../../models/subject-models/subject_model.js'
import subjectValidator from '../../validators/subject_validator.js' // Import the validation schema

export const addSubject = async (req, res) => {
  try {
    const { error } = subjectValidator.validate(req.body)

    if (error) {
      return res.status(400).json({
        error: error.message,
        message: 'Invalid data!',
      })
    }

    const subject = new Subject(req.body)

    await subject.save()

    res.status(201).json({
      subject,
      message: 'Subject added successfully',
    })
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: 'Failed to add subject',
    })
  }
}

export const updateSubject = async (req, res) => {
  try {
    const { error } = subjectValidator.validate(req.body)

    if (error) {
      return res.status(400).json({
        error: error.message,
        message: 'Invalid data!',
      })
    }

    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true },
    )

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' })
    }

    res.status(200).json({
      subject,
      message: 'Subject updated successfully',
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id)

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' })
    }

    res.status(200).json({
      model: subject,
      message: 'Subject Deleted',
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const fetchSubjects = async (req, res) => {
  try {
    // Récupérer le rôle de l'utilisateur et son ID
    const userRole = req.auth.role
    const userId = req.auth.userId // ID de l'utilisateur connecté

    let filter = {}

    if (userRole === 'admin') {
      // L'admin peut voir toutes les matières, publiées ou non
      filter = {}
    } else if (userRole === 'teacher') {
      // L'enseignant ne voit que ses matières publiées
      filter = { teacherId: userId, published: true }
    } else if (userRole === 'student') {
      // L'étudiant ne voit que ses matières publiées
      filter = { studentId: userId, published: true }
    } else {
      return res.status(403).json({
        message: 'Access Denied',
      })
    }

    // Récupérer les matières en fonction du filtre
    const subjects = await Subject.find(filter)

    res.status(200).json({
      model: subjects,
      message: 'Subjects Fetched Successfully',
    })
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: 'Error fetching subjects/',
    })
  }
}

export const getSubjectbyID = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id })
      .populate('chapId')
      .populate('skillId')
      .populate('curriculumId')
      .exec()

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' })
    }

    res.status(200).json({
      model: subject,
      message: 'Subject found',
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
// Publish a subject

export const togglePublishSubject = async (req, res) => {
  try {
    const { response } = req.params // Get the "response" parameter (publish or unpublish)
    const { id } = req.body // Assume the ID of the subject comes in the request body (you can modify this if needed)

    // Validate if response is either "publish" or "unpublish"
    if (response !== 'publish' && response !== 'unpublish') {
      return res.status(400).json({ message: 'Invalid response parameter' })
    }

    // Find the subject by ID
    const subject = await Subject.findById(id)

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' })
    }

    // Publish or unpublish the subject based on the response parameter
    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { published: response === 'publish' },
      { new: true },
    )

    // Return a success message with the updated subject
    res.status(200).json({
      subject: updatedSubject,
      message: `Subject ${response === 'publish' ? 'published' : 'unpublished'} successfully`,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
