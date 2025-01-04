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
  publishOrHidePFEAssignments2,
  assignTeacherToSoutenance,
  publishOrHideSoutenances,
  send_soutenance_planning,
  updateSoutenance,
  getTeacherSoutenances,
  getStudentSoutenances
} from '../../controllers/pfe-controller/pfe_controller.js'
import {
  accessByLevel,
  accessByRole,
  loggedMiddleware,
} from '../../middlewares/users-middlewares/auth_middleware.js'
const router = express.Router()

// route pour ouvrir une période de dépôt PFE:
router.post('/open', loggedMiddleware, accessByRole(['admin']), openPFEPeriod)
//route pour modifier une période de dépot PFE:
router.patch(
  '/open',
  loggedMiddleware,
  accessByRole(['admin']),
  updatePFEPeriod,
)
//route pour voir recuperer les données d'une periode
router.get('/open', loggedMiddleware, accessByRole(['admin']), getPFEPeriod)

//Route pour sauvegarder un nouveau pfe
router.post('/post', loggedMiddleware,accessByRole(['student']), addPFE)
// Route pour mettre à jour un PFE
router.patch('/:id',loggedMiddleware, accessByRole(['student']), updatePFE)
//route pour recuperer tous les pfe
router.get(
  '/',
  loggedMiddleware,
  accessByRole(['teacher']),
  getPFEDetailsForStudent,
)

// Endpoint pour qu'un enseignant choisisse un PFE
router.patch(
  '/:id/choice',
  loggedMiddleware,
  accessByRole(['teacher']),
  choosePFE,
)
//route pour assignTeachersToPFE automatically
router.patch(
  '/planning/assign',
  loggedMiddleware,
  accessByRole(['admin']),
  assignTeachersToPFE,
)
//route pour assigner un enseignant à un pfe manuellement
router.patch(
  '/:id/planning/assign',
  loggedMiddleware,
  accessByRole(['admin']),
  assignTeacherToPFEManually,
)
//route pour assigner un enseignant à un pfe manuellement2
router.patch(
  '/planning/update',
  loggedMiddleware,
  accessByRole(['admin']),
  assignTeacherToPFEManually2,
)
//route pour publier ou masquer les pfes
router.post(
  '/planning/publish/:response',
  loggedMiddleware,
  accessByRole(['admin']),
  publishOrHidePFEAssignments,
)
//router pour publie ou masquer certains pfes
router.post(
  '/planning/publish/:response',
  loggedMiddleware,
  accessByRole(['admin']),
  publishOrHidePFEAssignments2,
)
//route pour envoi de l'email
router.post(
  '/planning/send',
  loggedMiddleware,
  accessByRole(['admin']),
  send_pfe_planning,
)

// route pour créer planning soutenances PFE
router.post('/soutenances',loggedMiddleware, accessByRole(['admin']), assignTeacherToSoutenance)
//router pour publier oum masquer planning pfe
router.post('/soutenances/publish/:response',loggedMiddleware, accessByRole(['admin']), publishOrHideSoutenances)
//route pour envoi le planning par l'email
router.post('/soutenances/send',loggedMiddleware, accessByRole(['admin']), send_soutenance_planning)
//route pour mettre a jour le planning pfe
router.patch('/:id/soutenances/',loggedMiddleware, accessByRole(['admin']), updateSoutenance)   
//rote pour reuperer les soutenances de teacher
router.get('/me',loggedMiddleware, accessByRole(['teacher']), getTeacherSoutenances)
//route pour recuperer les soutenances d'un etudiant
router.get('/student/me',loggedMiddleware, accessByRole(['student']), getStudentSoutenances)


export default router
