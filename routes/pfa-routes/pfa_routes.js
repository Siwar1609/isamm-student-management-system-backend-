import express from 'express'

import {
  add_my_pfa,
  delete_my_pfa,
  fetch_all_pfa,
  fetch_my_pfa,
  fetch_my_pfa_byId,
  get_pfa_ByID,
  publish_pfa,
  send_pfa_list_email,
  update_my_pfa,
  update_pfa,
} from '../../controllers/pfa-controller/pfa_controller.js'
import {
  accessByRole,
  loggedMiddleware,
} from '../../middlewares/users-middlewares/auth_controller.js'

const pfa_route = express.Router()

//-------- Teacher Routes -----------------
pfa_route.post('/post', loggedMiddleware, accessByRole(['teacher']), add_my_pfa)
pfa_route.get('/mine', accessByRole(['teacher']), fetch_my_pfa)
pfa_route.get('/mine/:id', accessByRole(['teacher']), fetch_my_pfa_byId)
pfa_route.patch('/:id/mine', accessByRole(['teacher']), update_my_pfa)
pfa_route.delete('/:id/mine', accessByRole(['teacher']), delete_my_pfa)

//---------------- Admin Routes ---------------------------
pfa_route.get('/', accessByRole(['admin']), fetch_all_pfa)
pfa_route.get('/:id', accessByRole(['admin']), get_pfa_ByID)
pfa_route.patch('/:id', accessByRole(['admin']), update_pfa)
pfa_route.post('/post', accessByRole(['admin']), add_my_pfa)
pfa_route.post('/publish/:response',accessByRole(['admin']),publish_pfa)
pfa_route.post('/list/send',accessByRole(['admin']),send_pfa_list_email)

export default pfa_route
