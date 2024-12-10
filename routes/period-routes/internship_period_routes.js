import express from 'express'
import {
  openInternshipPeriod,
  getInternshipPeriod,
  updateInternshipPeriod,
} from '../../controllers/period-controller/internship_period.js'

const router = express.Router()

// Route to open a new "Dépôt de stage" period
router.post('/open-internship-period', openInternshipPeriod)

// Route to get the current "Dépôt de stage" period
router.get('/internship-period', getInternshipPeriod)

// Route to update the "Dépôt de stage" period dates
router.put('/update-internship-period', updateInternshipPeriod)

export default router
