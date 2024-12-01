import express from 'express'
import { isAdmin, loggedMiddleware } from '../../middlewares/users-middlewares/auth_controller.js'
import {
  addPeriod,
  fetch_pfa_period,
  get_period_ByID,
  UpdatePeriod,
} from '../../controllers/period-controller/period_controller.js'

const pfa_period_route = express.Router()

// ----------------- PFA_period routes ---------------------------------------

// pfa_period_route.post('/pfa/open', loggedMiddleware, isAdmin, addPeriod)
// pfa_period_route.get('/pfa/open', loggedMiddleware, isAdmin, fetch_pfa_period)
// pfa_period_route.get('/pfa/open/:id', loggedMiddleware, isAdmin, get_period_ByID,)
// pfa_period_route.patch('/pfa/open/:id', loggedMiddleware, isAdmin, UpdatePeriod)

pfa_period_route.post('/pfa/open', addPeriod)
pfa_period_route.get('/pfa/open', fetch_pfa_period)
pfa_period_route.get('/pfa/open/:id', get_period_ByID,)
pfa_period_route.patch('/pfa/open/:id', UpdatePeriod)


export default pfa_period_route
