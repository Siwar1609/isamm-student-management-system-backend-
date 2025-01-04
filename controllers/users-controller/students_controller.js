import Student from '../../models/users-models/student_model.js'
import { addStudent } from '../../services/students_services.js'
import { emailTemplate, updatePassword } from '../../services/users_services.js'
import { sendEmail } from '../../services/users_services.js'
import readXlsxFile from 'read-excel-file/node'
import userValidator from '../../validators/user_validator.js'
import mongoose from 'mongoose'
import PFA from '../../models/project_models/project_pfa.js'
import PFE from '../../models/project_models/project_pfe.js'
import pkg from 'lodash'
const { chunk } = pkg

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
//******************************************************************************** */
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
        academicYearlevel: row[7].toString(),
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

//******************************************************************************** */

const updateStudentProfile = async (req, res) => {
  const studentId = req.auth.userId

  try {
    // Fetch student from the database
    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }

    // Define allowed fields for updates
    const allowedFields = ['address', 'phone', 'secondEmail', 'photo']

    // Validate input and prepare updated data
    const student_new_data = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        student_new_data[field] = req.body[field]
      }
    }

    if (Object.keys(student_new_data).length === 0) {
      return res
        .status(400)
        .json({ message: 'No valid fields provided for update' })
    }

    // Update student data
    await Student.findByIdAndUpdate(studentId, student_new_data)

    res.status(200).json({ message: 'Student profile updated successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

//******************************************************************************** */

// add cv data to student
const addStudentCV = async (req, res) => {
  // geting the student id from the token in req auth poassed by the middleware

  const studentId = req.auth.userId
  console.log(studentId)

  const student = await Student.findById(studentId)
  if (!student) {
    return res.status(404).json({ message: 'Student not found' })
  }

  let newCVContent = req.body
  let cv = student.cv
  cv = newCVContent
  console.log(cv)

  try {
    await Student.findByIdAndUpdate(studentId, { cv })
    res.status(200).json({ message: 'CV updated successfully' })
  } catch (err) {
    // customizing the error message to be more user friendly and not expose the error message
    res.status(500).json({
      message: 'An error occured while updating the CV',
      error: err.message,
    })
  }
}
//******************************************************************************** */
const getStudentCV = async (req, res) => {
  const studentId = req.auth.userId // Extract student ID from the token

  try {
    // Fetch student details and populate internships
    const student = await Student.findById(studentId).populate('internships')
    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }

    // Fetch PFAs where the student is in the list_of_student array
    const pfas = await PFA.find({ list_of_student: studentId })

    // Fetch PFEs where the student is in the studentId array
    const pfes = await PFE.find({ studentId: studentId })

    // Return the CV with related PFAs, PFEs, and internships
    res.status(200).json({
      cv: student.cv,
      PFA: pfas,
      PFE: pfes,
      internships: student.internships,
    })
  } catch (err) {
    res.status(500).json({
      message: 'An error occurred while getting the CV',
      error: err.message,
    })
  }
}
//**************************************************************** */

const getStudentCVInfo = async (req, res) => {
  try {
    const studentId = req.params.id
    const student = await Student.findById(studentId).populate('internships')
    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }
    res.status(200).json({
      etudiant: student.firstName + ' ' + student.lastName,
      cv: student.cv,
      internships: student.internships,

    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

//************************************************************** */

// update student cv data : add diplomas / certifications languages / proffesional experience :
const updateStudentCV = async (req, res) => {
  const studentId = req.auth.userId
  const student = await Student.findById(studentId)
  if (!student) {
    return res.status(404).json({ message: 'Student not found' })
  }
  let student_old_data = student.toObject()
  let student_CV = student_old_data.cv
  delete student_old_data._id,
    delete student_old_data.__v,
    delete student_old_data.createdAt,
    delete student_old_data.updatedAt

  let args = req.body
  let student_new_data = {
    ...student_old_data,
    cv: {
      ...student_CV,
      ...args,
    },
  }

  console.log(student_new_data)

  try {
    await Student.findByIdAndUpdate(studentId, student_new_data)
    res.status(200).json({ message: 'Student CV updated successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

//******************************************************************************** */
const evaluteStudentStatus = async (req, res) => {
  try {
    const studentId = req.params.id

    // Validate the student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'Invalid student ID.' })
    }

    const student = await Student.findById(studentId)

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' })
    }

    // Update student's status based on their academicYearStatus
    switch (req.body.academicYearStatus) {
      case 'pass':
        // Check for graduation
        if (['3L', '2M', '3ING'].includes(student.academicYearlevel)) {
          student.isGraduated = true
          student.status = 'graduated_student'
          student.graduationYear = new Date().getFullYear()
        } else {
          student.status = 'active_student'
          student.academicYearlevel = getNextLevel(student.academicYearlevel)
        }
        break
      case 'fail':
        student.academicYearStatus = 'fail'
        break

      case 'suspended':
        student.status = 'suspended_student'
        break

      default:
        return res
          .status(400)
          .json({ message: 'Invalid academic year status.' })
    }

    // Save the updated student
    await student.save()
    res
      .status(200)
      .json({ message: 'Student status updated successfully.', student })
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
}

//**************************************************************

// Utility function to determine the next academic level
const getNextLevel = (currentLevel) => {
  const levels = ['1L', '2L', '3L', '1M', '2M', '1ING', '2ING', '3ING']
  const index = levels.indexOf(currentLevel)
  return index !== -1 && index < levels.length - 1
    ? levels[index + 1]
    : currentLevel
}
//**************************************************************
// notify old students to update their cv info ( diplomes / certifications / langues / competences / experiences )
const notifyOldStudents = async (req, res) => {
  try {
    const graduated_students = await Student.find({
      isGraduated: true,
      status: 'graduated_student',
    })
    const emailBatches = chunk(graduated_students, 10)
    for (const batch of emailBatches) {
      await Promise.all(
        batch.map(async (student) => {
          const fullName = `${student.firstName} ${student.lastName}`
          const text = `
          Congratulations! You have graduated from our school.
          Please update your CV with your latest diplomas, certifications, languages, competences, and professional experiences.`
          // send email to the student to update their cv
          await sendEmail({
            to: student.email,
            subject: 'Update your CV',
            html: emailTemplate(fullName, text),
          })
        }),
      )
    }

    return res.status(200).json({
      message: 'Emails sent successfully',
      students: graduated_students,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
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
  addStudentCV,
  getStudentCV,
  updateStudentCV,
  updateStudentProfile,
  evaluteStudentStatus,
  notifyOldStudents,
  getStudentCVInfo,
}
