import express from 'express'

import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../../controllers/users-controller/users_controller.js'
// import {
//   createStudent,
//   getStudent,
//   getStudents,
// } from '../../controllers/users-controller/students_controller.js'

const router = express.Router()

// users accounts management routes
router.get('/', getUsers)
router.get('/:id', getUser)
router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)
// // students accounts management routes
// router.get('/student', getStudents)
// router.get('/student/:id', getStudent)
// router.post('/student', createStudent)
// // router.put('/student/:id', updateStudent)
// // router.delete('/student/:id', deleteStudent)

export default router
