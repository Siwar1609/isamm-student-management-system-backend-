import express from 'express'

import {
  add_my_pfa,
  autoAllocatePFA,
  delete_my_pfa,
  fetch_all_pfa,
  fetch_my_pfa,
  fetch_my_pfa_byId,
  fetchStudentChoices,
  fetsh_published_pfa,
  get_pfa_ByID,
  get_published_pfa_by_id,
  manualAssignPFA,
  publish_pfa,
  send_pfa_list_email,
  sendEmailToRecipients,
  togglePublishPFA,
  update_my_pfa,
  update_pfa,
} from '../../controllers/pfa-controller/pfa_controller.js'
import {
  accessByLevel,
  accessByRole,
  loggedMiddleware,
} from '../../middlewares/users-middlewares/auth_middleware.js'

const pfa_route = express.Router()

//---------------- student Routes ---------------------------
pfa_route.get('/choice/', accessByRole(['student']), accessByLevel(['1']) ,fetsh_published_pfa)
pfa_route.get('/choice/:id', accessByRole(['student']), accessByLevel(['1']) , get_published_pfa_by_id)
//-------- Teacher Routes -----------------
pfa_route.post('/post', loggedMiddleware, accessByRole(['teacher']), add_my_pfa)
pfa_route.get('/mine', loggedMiddleware, accessByRole(['teacher']), fetch_my_pfa)
pfa_route.get('/mine/:id', loggedMiddleware, accessByRole(['teacher']), fetch_my_pfa_byId)
pfa_route.patch('/:id/mine', loggedMiddleware, accessByRole(['teacher']), update_my_pfa)
pfa_route.delete('/:id/mine', loggedMiddleware, accessByRole(['teacher']), delete_my_pfa)
//---------------- Admin Routes ---------------------------
pfa_route.get('/', accessByRole(['admin']), fetch_all_pfa)
pfa_route.get('/:id', accessByRole(['admin']), get_pfa_ByID)
pfa_route.patch('/:id', accessByRole(['admin']), update_pfa)
pfa_route.post('/post', accessByRole(['admin']), add_my_pfa)
pfa_route.post('/publish/:response', accessByRole(['admin']), publish_pfa)
pfa_route.post('/list/send', accessByRole(['admin']), send_pfa_list_email)
//---------------- student Routes ---------------------------
pfa_route.get('/choice/', accessByRole(['student']), fetsh_published_pfa)
pfa_route.get('/choice/:id', accessByRole(['student']), get_published_pfa_by_id)

export default pfa_route
