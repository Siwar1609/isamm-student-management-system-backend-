import { 
  addStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent
} from '../../services/students_services.js'

export const createStudent = async (req, res) => {
  try {
    const newStudent = await addStudent(req.body)

    console.log(newStudent)
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: newStudent
    })
  } catch (error) {
    console.error('Create student error:', error)

    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: error.message
      })
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create student',
      error: error.message
    })
  }
}

export const getAllStudents = async (req, res) => {
  try {
    const students = await getStudents()
    res.status(200).json({
      success: true,
      data: students
    })
  } catch (error) {
    console.error('Get students error:', error)
    res.status(404).json({
      success: false,
      message: error.message
    })
  }
}

export const getStudentById = async (req, res) => {
  try {
    const student = await getStudent(req.params.id)
    res.status(200).json({
      success: true,
      data: student
    })
  } catch (error) {
    console.error('Get student error:', error)
    res.status(404).json({
      success: false,
      message: error.message
    })
  }
}

export const updateStudentById = async (req, res) => {
  try {
    const updatedStudent = await updateStudent(req.params.id, req.body)
    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    })
  } catch (error) {
    console.error('Update student error:', error)

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      })
    }

    if (error.message === 'Student not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message
    })
  }
}

export const deleteStudentById = async (req, res) => {
  try {
    await deleteStudent(req.params.id)
    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    })
  } catch (error) {
    console.error('Delete student error:', error)

    if (error.message === 'Student not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message
    })
  }
}