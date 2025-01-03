import express from 'express'

import {
  createStudent,
  getStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  createStudentsAccountsExcelFile,
  updateStudentPassword,
  addStudentCV,
  getStudentCV,
  updateStudentCV,
  updateStudentProfile,
  evaluteStudentStatus,
} from '../../controllers/users-controller/students_controller.js'
import {
  accessByRole,
  loggedMiddleware,
} from '../../middlewares/users-middlewares/auth_middleware.js'

import upload from '../../middlewares/file_upload_middleware.js'

const router = express.Router()

// students accounts management routes
//**************************
// get all students
router.get('/', loggedMiddleware, accessByRole(['admin']), getStudents)
//**************************
// get a student by id
router.get('/:id', loggedMiddleware, accessByRole(['admin']), getStudent)
//**************************
// create a new student
router.post('/', loggedMiddleware, accessByRole(['admin']), createStudent)
//**************************
// update a student
router.put('/:id', loggedMiddleware, accessByRole(['admin']), updateStudent)
//**************************
// update student's password
router.put(
  '/:id/password',
  loggedMiddleware,
  accessByRole(['admin', 'student']),
  updateStudentPassword,
)
//**************************
// delete a student
router.delete('/:id', loggedMiddleware, accessByRole(['admin']), deleteStudent)
//**************************
// create an excel file with students accounts
router.post('/upload', upload.single('file'), createStudentsAccountsExcelFile)
//**************************
// students can change their profil info ( adress / phone / second email / photo )
router.patch(
  '/me',
  loggedMiddleware,
  accessByRole(['student']),
  updateStudentProfile,
) // tested and working ✅
//**************************
// ajouter un cv par l'etudiant ( diplomes / certifications / langues / competences / experiences )
router.post('/cv', loggedMiddleware, accessByRole(['student']), addStudentCV) // // tested and working ✅
//**************************
// ajouter diplomes ( ancien our nouveau etudiant ) + certifications / langues / competences / experiences
router.patch(
  '/cv',
  loggedMiddleware,
  accessByRole(['student']),
  updateStudentCV,
) // // tested and working ✅
//**************************
router.get('/cv/me', loggedMiddleware, accessByRole(['student']), getStudentCV) // // tested and working ✅
//**************************

// evaluete a student
router.patch(
  '/evaluate/:id',
  loggedMiddleware,
  accessByRole(['admin']),
  evaluteStudentStatus,
) // // tested and working ✅

export default router
