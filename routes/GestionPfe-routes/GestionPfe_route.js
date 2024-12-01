import express from 'express'
import {
  openPFEPeriod,
  updatePFEPeriod,
  getPFEPeriod,
} from '../../controllers/period-controller/period_pfe_controller.js'
import {
  updatePFE,
  addPFE,
  choosePFE,
  getPFEDetailsForStudent,
} from '../../controllers/pfe-controller/pfe_controller.js'

const router = express.Router()

// Endpoint pour ouvrir une période de dépôt PFE:
router.post('/open', openPFEPeriod)
//Endpoint pour modifier une période de dépot PFE:
router.patch('/open', updatePFEPeriod)
//route pour voir recuperer les données d'une periode
router.get('/open', getPFEPeriod)
// Route pour mettre à jour un PFE
router.patch('/:id', updatePFE)
//Route pour sauvegarder un nouveau pfe
router.post('/post', addPFE)

//route pour recuperer tous les pfe
router.get('/', getPFEDetailsForStudent)
// Endpoint pour qu'un enseignant choisisse un PFE
router.patch('/:id/choice', choosePFE)

export default router
