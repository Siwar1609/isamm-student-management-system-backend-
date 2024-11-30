import express from 'express'
import {
  add_pfa,
  delete_pfa,
  fetch_pfa,
  get_pfa_ByID,
  update_pfa,
} from '../../controllers/pfa-controller/pfa_controler'
import { isAdmin, isStudent, isTeacher, loggedMiddleware } from '../../middlewares/users-middlewares/auth_controller';

const pfa_route = express.Router()

// router.get("/", loggedMiddleware, isAdmin,isTeacher,isStudent, fetch_pfa);
// pfa_route.get('/', fetch_pfa)
// pfa_route.get('/:id',isAdmin,isTeacher, get_pfa_ByID)
// pfa_route.post('/', isTeacher,add_pfa)
// pfa_route.patch('/:id', isTeacher,update_pfa)
// pfa_route.delete('/:id', isTeacher, isAdmin ,delete_pfa)

pfa_route.post('/', isTeacher, add_pfa)
pfa_route.get()


export default pfa_route
