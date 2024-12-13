import express from 'express'

import {
  addPeriod,
  fetch_pfa_period,
  get_period_ByID,
  UpdatePeriod,
} from '../../controllers/period-controller/period_controller.js'
import { accessByRole } from '../../middlewares/users-middlewares/auth_middleware.js'

const pfa_period_route = express.Router()

// ----------------- PFA_period routes ---------------------------------------

pfa_period_route.get('/open', accessByRole(['admin']), fetch_pfa_period)
pfa_period_route.get('/open/:id', accessByRole(['admin']), get_period_ByID)
pfa_period_route.post('/open/post', accessByRole(['admin']), addPeriod)
pfa_period_route.patch('/open/:id', accessByRole(['admin']), UpdatePeriod)

export default pfa_period_route
