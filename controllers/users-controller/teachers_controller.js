import readXlsxFile from 'read-excel-file/node'
import Teacher from '../../models/users-models/teacher_model.js'
import {
  addTeacher,
  deleteTeacher,
  getTeacher,
  getTeachers,
  updateTeacher,
} from '../../services/teachers_services.js'

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
    const rows = await readXlsxFile(filePath)
    let teachersNames = []
    let errors = []

    rows.shift()

    for (const row of rows) {
      const teacher = {
        cin: row[0].toString(),
        birthDate: row[1].toString(),
        firstName: row[2].toString(),
        lastName: row[3].toString(),
        email: row[4].toString(),
        password: row[5].toString(),
        phone: row[6].toString(),
        cv: row[7]?.toString() || '',
      }

      // check if the teacher already exists
      const teacherExist = await Teacher.findOne({ cin: teacher.cin }).exec()
      if (teacherExist) {
        errors.push(
          `Teacher ${teacher.firstName} ${teacher.lastName} already exists`,
        )
        continue
      }

      await addTeacher(teacher)
      teachersNames.push(`${teacher.firstName} ${teacher.lastName}`)
    }

    res.status(201).json({
      message: `${teachersNames.length} teachers added successfully`,
      teachersNames,
      errors,
    })
  } catch (e) {
    console.log(e)
  }
}

export {
  getAllTeachers,
  getOneTeacher,
  createTeacher,
  updateOneTeacher,
  deleteOneTeacher,
  createTeachersAccountsExcelFile,
}
