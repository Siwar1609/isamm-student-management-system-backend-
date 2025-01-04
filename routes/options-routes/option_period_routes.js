import express from 'express'

import {
  getOptionPeriod,
  openOptionPeriod,
  updateOptionPeriod,
} from '../../controllers/option-controller/option_period_controller.js'

const option_period_route = express.Router()

// ----------------- option_period routes ---------------------------------------
option_period_route.post('/open', openOptionPeriod)
option_period_route.get('/open', getOptionPeriod)
option_period_route.patch('/open', updateOptionPeriod)

export default option_period_route
