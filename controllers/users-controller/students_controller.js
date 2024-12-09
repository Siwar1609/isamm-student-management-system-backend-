import Student from '../../models/users-models/student_model.js'
import { addStudent } from '../../services/students_services.js'

// get students
const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
    res.status(200).json(students)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// get a student by id
const getStudent = async (req, res) => {
  const studentId = req.params.id
  try {
    const student = await Student.findById(studentId)
    res.status(200).json(student)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// create a new student
const createStudent = async (req, res) => {
  try {
    let value = req.body
    console.log('req.body', value)

    const newStudent = await addStudent(value)

    res.status(201).json(newStudent)
  } catch (err) {
    console.error('something went wrong')
    res.status(500).json({ message: err.message })
  }
}

// update a student
const updateStudent = async (req, res) => {
  const student = await Student.findById(req.params.id).exec()
  if (!student) {
    return res.status(404).json({ message: 'Student not found' })
  }
  let student_old_data = student.toObject()
  delete student_old_data._id,
    delete student_old_data.__v,
    delete student_old_data.createdAt,
    delete student_old_data.updatedAt
  let args = req.body
  let student_new_data = {
    ...student_old_data,
    ...args,
  }
  try {
    await Student.findByIdAndUpdate(req.params.id, student_new_data)
    res.status(200).json({ message: 'Student updated successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// delete a student
const deleteStudent = async (req, res) => {
  const studentId = req.params.id
  try {
    await Student.findByIdAndDelete(studentId)
    res.status(200).json({ message: 'Student deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export { getStudents, getStudent, createStudent, updateStudent, deleteStudent }