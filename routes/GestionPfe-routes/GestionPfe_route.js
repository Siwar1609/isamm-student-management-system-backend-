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
  assignTeachersToPFE,
  assignTeacherToPFEManually,
  assignTeacherToPFEManually2,
  publishOrHidePFEAssignments,
  send_pfe_planning,
} from '../../controllers/pfe-controller/pfe_controller.js'
import { accessByLevel, accessByRole,loggedMiddleware } from '../../middlewares/users-middlewares/auth_middleware.js'
const router = express.Router()

// Endpoint pour ouvrir une période de dépôt PFE:
router.post('/open',openPFEPeriod)
router.post('/open',loggedMiddleware, accessByRole(['admin']), openPFEPeriod)
//Endpoint pour modifier une période de dépot PFE:
router.patch('/open', updatePFEPeriod)
router.patch('/open',loggedMiddleware,accessByRole(['admin']), updatePFEPeriod)
//route pour voir recuperer les données d'une periode
router.get('/open', getPFEPeriod)
router.get('/open',loggedMiddleware, accessByRole(['admin']), getPFEPeriod)


//Route pour sauvegarder un nouveau pfe
router.post('/post', addPFE)
router.post('/post', loggedMiddleware,accessByRole(['student']),accessByLevel('3'), addPFE)
// Route pour mettre à jour un PFE
router.patch('/:id', updatePFE)
router.patch('/:id',loggedMiddleware, accessByRole(['student']),accessByLevel('3'), updatePFE)
//route pour recuperer tous les pfe
router.get('/', getPFEDetailsForStudent)
router.get('/',loggedMiddleware, accessByRole(['teacher']), getPFEDetailsForStudent)


// Endpoint pour qu'un enseignant choisisse un PFE
router.patch('/:id/choice', choosePFE)
router.patch('/:id/choice',loggedMiddleware, accessByRole(['teacher']), choosePFE)
//route pour assignTeachersToPFE automatically
router.patch('/planning/assign', assignTeachersToPFE)
router.patch('/planning/assign',loggedMiddleware, accessByRole(['admin']), assignTeachersToPFE)
//route pour assigner un enseignant à un pfe manuellement
router.patch('/:id/planning/assign', assignTeacherToPFEManually)
router.patch('/:id/planning/assign',loggedMiddleware, accessByRole(['admin']), assignTeacherToPFEManually)
//route pour assigner un enseignant à un pfe manuellement2
router.patch('/planning/update', assignTeacherToPFEManually2)
router.patch('/planning/update',loggedMiddleware, accessByRole(['admin']), assignTeacherToPFEManually2)


//route pour publier ou masquer les pfes
router.post('/planning/publish/:response', publishOrHidePFEAssignments)
router.post('/planning/publish/:response',loggedMiddleware, accessByRole(['admin']), publishOrHidePFEAssignments)
//route pour envoi de l'email
router.post('/planning/send', send_pfe_planning)
router.post('/planning/send',loggedMiddleware, accessByRole(['admin']), send_pfe_planning)

//
export default router
