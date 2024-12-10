import express from 'express'

import {
  getOptionPeriod,
  openOptionPeriod,
  updateOptionPeriod,
} from '../../controllers/option-controller/option_controller.js'

const option_route = express.Router()

// ----------------- option_period routes ---------------------------------------
option_route.post('/open', openOptionPeriod)
option_route.get('/open', getOptionPeriod)
option_route.patch('/open', updateOptionPeriod)

export default option_route
