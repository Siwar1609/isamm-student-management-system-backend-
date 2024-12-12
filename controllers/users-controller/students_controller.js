import Student from '../../models/users-models/student_model.js'
import { addStudent } from '../../services/students_services.js'
import { updatePassword } from '../../services/users_services.js'

import readXlsxFile from 'read-excel-file/node'
import userValidator from '../../validators/user_validator.js'

//**************************************************************
// create a new student
const createStudent = async (req, res) => {
  try {
    const { error, value } = userValidator.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.message })
    }
    // Call the service to handle business logic of creating the student
    const newStudent = await addStudent(value)

    res.status(201).json({
      message: 'Student created successfully',
      student: newStudent,
    })
  } catch (err) {
    console.error('Error in createStudent function: ', err)
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal Server Error' })
  }
}

//**************************************************************
// get students
const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
    res.status(200).json(students)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

//**************************************************************
// get a student by id
const getStudent = async (req, res) => {
  const studentId = req.params.id
  try {
    const student = await Student.findById(studentId)

    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }

    // delete the password and cv from the student object returned

    student.password = undefined
    student.cv = undefined

    console.log(student)

    res.status(200).json(student)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

//**************************************************************

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

//**************************************************************
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

//**************************************************************

const updateStudentPassword = async (req, res) => {
  const studentId = req.params.id

  try {
    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }

    // compare the password with the confirm password
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' })
    }

    // calling the service to update the student password
    await updatePassword(studentId, req.body.password, Student)

    res.status(200).json({ message: 'Password updated successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const createStudentsAccountsExcelFile = async (req, res) => {
  try {
    // Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const filePath = req.file.path // Path to the uploaded file
    const rows = await readXlsxFile(filePath)

    let studentsNames = []
    let errors = []

    // Skip the first row (headers)
    rows.shift()

    for (const row of rows) {
      const student = {
        cin: row[0].toString(),
        birthDate: row[1].toString(),
        firstName: row[2].toString(),
        lastName: row[3].toString(),
        email: row[4].toString(),
        phone: row[5].toString(),
        cv: row[6]?.toString() || '',
        fieldOfStudy: row[7].toString(),
        level: row[8].toString(),
        status: row[9].toString(),
      }

      // Check if the student already exists
      const studentExist = await Student.findOne({ cin: student.cin }).exec()
      if (studentExist) {
        errors.push(
          `An Account with the same CIN Already Exist for ${student.firstName} ${student.lastName}`,
        )
        continue
      }

      // Add the student
      await addStudent(student)
      studentsNames.push(`${student.firstName} ${student.lastName}`)
    }

    res.status(201).json({
      message: `${studentsNames.length} students added successfully`,
      addedStudents: studentsNames,
      errors,
    })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}
//**************************************************************
export {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  createStudentsAccountsExcelFile,
  updateStudentPassword,
}
