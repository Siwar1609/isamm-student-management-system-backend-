import express from 'express'
import { isAdmin } from '../../middlewares/users-middlewares/auth_controller'
import { addPeriod } from '../../controllers/period-controller/period_controller'

const period_route = express.Router()

pfa_route.post('/pfa/post', loggedMiddleware ,isAdmin, addPeriod)

