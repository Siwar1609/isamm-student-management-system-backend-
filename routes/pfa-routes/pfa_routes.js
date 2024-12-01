import express from 'express'

import {
  isAdmin,
  isStudent,
  isTeacher,
  loggedMiddleware,
} from '../../middlewares/users-middlewares/auth_controller.js'
import {
  add_my_pfa,
  delete_my_pfa,
  fetch_all_pfa,
  fetch_my_pfa,
  fetch_my_pfa_byId,
  get_pfa_ByID,
  update_my_pfa,
  update_pfa,
} from '../../controllers/pfa-controller/pfa_controller.js'

const pfa_route = express.Router()

//-------- Teacher Routes -----------------
pfa_route.post('/pfa/post', isTeacher, add_my_pfa)
pfa_route.get('/pfa/mine', isTeacher , fetch_my_pfa)
pfa_route.get('/pfa/mine/:id', isTeacher, fetch_my_pfa_byId)
pfa_route.patch('/pfa/:id/mine', isTeacher , update_my_pfa)
pfa_route.delete('/pfa/:id/mine',isTeacher,delete_my_pfa)

//---------------- Admin Routes ---------------------------
pfa_route.get('/pfa', isAdmin, fetch_all_pfa)
pfa_route.get('/pfa/:id', isAdmin, get_pfa_ByID)
pfa_route.patch('/pfa/:id', isAdmin, update_pfa)
pfa_route.post('/pfa/post', isAdmin, add_my_pfa)


export default pfa_route
