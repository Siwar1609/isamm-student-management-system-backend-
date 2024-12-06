import express from 'express'

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
import { accessByRole } from '../../middlewares/users-middlewares/auth_controller.js'

const pfa_route = express.Router()

//-------- Teacher Routes -----------------
pfa_route.post('/pfa/post', accessByRole(['teacher']), add_my_pfa)
pfa_route.get('/pfa/mine', accessByRole(['teacher']), fetch_my_pfa)
pfa_route.get('/pfa/mine/:id', accessByRole(['teacher']), fetch_my_pfa_byId)
pfa_route.patch('/pfa/:id/mine', accessByRole(['teacher']), update_my_pfa)
pfa_route.delete('/pfa/:id/mine', accessByRole(['teacher']), delete_my_pfa)

//---------------- Admin Routes ---------------------------
pfa_route.get('/pfa', accessByRole(['admin']), fetch_all_pfa)
pfa_route.get('/pfa/:id', accessByRole(['admin']), get_pfa_ByID)
pfa_route.patch('/pfa/:id', accessByRole(['admin']), update_pfa)
pfa_route.post('/pfa/post', accessByRole(['admin']), add_my_pfa)

export default pfa_route
