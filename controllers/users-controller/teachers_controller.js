import readXlsxFile from 'read-excel-file/node'
import Teacher from '../../models/users-models/teacher_model.js'
import {
  addTeacher,
  deleteTeacher,
  getTeacher,
  getTeachers,
  updateTeacher,
} from '../../services/teachers_services.js'
import { updatePassword } from '../../services/users_services.js'

// excel file path to read teachers data 👨‍🏫
let filePath = 'data\\teachers.xlsx'

// getting teachers list
// *********************************************
const getAllTeachers = async function (req, res) {
  try {
    const teachers = await getTeachers()
    res.status(200).json(teachers)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

//**************************************************************
// getting a teacher by id
const getOneTeacher = async function (req, res) {
  const teacherId = req.params.id
  try {
    const teacher = await getTeacher(teacherId)

    res.status(200).json(teacher)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

//**************************************************************
// creating a teacher
const createTeacher = async function (req, res) {
  try {
    let value = req.body
    console.log('req.body', value)

    const newTeacher = await addTeacher(value)

    res.status(201).json(newTeacher)
  } catch (err) {
    console.error('something went wrong')
    res.status(500).json({ message: err.message })
  }
}

//**************************************************************
// updating a teacher
const updateOneTeacher = async function (req, res) {
  const teacher = await Teacher.findById(req.params.id).exec()
  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found' })
  }
  let teacher_old_data = teacher.toObject()
  delete teacher_old_data._id,
    delete teacher_old_data.__v,
    delete teacher_old_data.createdAt,
    delete teacher_old_data.updatedAt
  let args = req.body
  let teacher_new_data = {
    ...teacher_old_data,
    ...args,
  }

  try {
    const updatedTeacher = await updateTeacher(req.params.id, teacher_new_data)
    res.status(200).json(updatedTeacher)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

//**************************************************************
// deleting a teacher
const deleteOneTeacher = async function (req, res) {
  const teacherId = req.params.id
  try {
    await deleteTeacher(teacherId)
    res.status(200).json({ message: 'Teacher deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

//**************************************************************
const createTeachersAccountsExcelFile = async function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    filePath = req.file.path
    const rows = await readXlsxFile(filePath)

    let teachersNames = []
    let errors = []

    // remove the header row
    rows.shift()

    for (const row of rows) {
      const teacher = {
        cin: row[0].toString(),
        birthDate: row[1].toString(),
        firstName: row[2].toString(),
        lastName: row[3].toString(),
        email: row[4].toString(),
        phone: row[5].toString(),
        cv: row[6]?.toString(),
      }

      // check if the teacher already exists
      const teacherExist = await Teacher.findOne({ cin: teacher.cin }).exec()
      if (teacherExist) {
        errors.push(
          `An Account with the same CIN Already Exist for ${teacher.firstName} ${teacher.lastName}`,
        )
        continue
      }

      await addTeacher(teacher)
      teachersNames.push(`${teacher.firstName} ${teacher.lastName}`)
    }

    console.log(teachersNames, ' just added to the database')

    res.status(201).json({
      message: `${teachersNames.length} teachers added successfully`,
      teachersNames,
      errors,
    })
  } catch (e) {
    console.log(e)
  }
}

//**************************************************************
const updateTeacherPassword = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).exec()
    if (!teacher) {
      const error = new Error('Teacher not found')
      error.statusCode = 404
      throw error
    }

    const teacherFullName = `${teacher.firstName} ${teacher.lastName}`

    if (req.body.password !== req.body.confirmPassword) {
      const error = new Error('Passwords do not match')
      error.statusCode = 400
      throw error
    }

    await updatePassword(req.params.id, req.body.password, Teacher)
    res.status(200).json({
      message: ` Password of teacher  ${teacherFullName} updated successfully`,
    })
  } catch (error) {
    console.error('Error in updateTeacherPassword function: ', error)
    throw error
  }
}

export {
  getAllTeachers,
  getOneTeacher,
  createTeacher,
  updateOneTeacher,
  deleteOneTeacher,
  createTeachersAccountsExcelFile,
  updateTeacherPassword,
}
