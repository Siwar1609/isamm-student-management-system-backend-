import Student from '../../models/users-models/student_model.js'
import { addStudent } from '../../services/students_services.js'
import readXlsxFile from 'read-excel-file/node'

// excel file path to read students data 👩‍🎓
let filePath = 'data\\students.xlsx'

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
    res.status(200).json(student)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

//**************************************************************
// create a new student
const createStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ cin: req.body.cin }).exec()
    if (student) {
      return res
        .status(400)
        .json({ message: 'An Account with the same CIN Already Exist' })
    }

    const newStudent = await addStudent(req.body)

    res.status(201).json(newStudent)
  } catch (err) {
    console.error('something went wrong')
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
const createStudentsAccountsExcelFile = async (req, res) => {
  try {
    // Read the content of the Excel file
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
        password: row[5].toString(),
        phone: row[6].toString(),
        cv: row[7]?.toString() || '',
        fieldOfStudy: row[8].toString(),
        level: row[9].toString(),
        status: row[10].toString(),
      }

      // Check if the student already exists
      const studentExist = await Student.findOne({ cin: student.cin }).exec()
      if (studentExist) {
        // Log the error for this student
        errors.push(
          `Student ${student.firstName} ${student.lastName} already exists`,
        )
        continue
      }

      // Add the student
      await addStudent(student)
      studentsNames.push(`${student.firstName} ${student.lastName}`)
    }

    // Send a single response after processing all rows
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
}
