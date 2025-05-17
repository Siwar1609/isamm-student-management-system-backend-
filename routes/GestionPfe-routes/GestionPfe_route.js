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
  getStudentSoutenances,
  getPFEById,
  getAssignedPFEs,
  getPFEDetailsForStudent2,
  getPFEDetailsForStudent3,
  checkPfe,
  getAllDocumentsPfe,
  deleteDocument,
  assignDocumentsToPfe,
  getApprovedPfes,
  getAllSoutenances,
  deleteSoutenance
} from '../../controllers/pfe-controller/pfe_controller.js'
import {
  accessByLevel,
  accessByRole,
  loggedMiddleware,
} from '../../middlewares/users-middlewares/auth_middleware.js'
import multer from 'multer';
import { uploadFiles } from "../../controllers/document-controller/document_controller.js";


const router = express.Router()
// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });
//route pour recuperer tous les pfe  non  affected pour teacher
router.get('/nonaffected', getPFEDetailsForStudent3);
//route pour voir recuperer les données d'une periode
router.get('/open', loggedMiddleware, accessByRole(['admin']), getPFEPeriod)
// AssignDocument to pfe
router.patch('/documents/assign-to-pfe/:pfeId',assignDocumentsToPfe);
router.get('/affected', getPFEDetailsForStudent2);
// GET all documents of type 'rapport de pfe' uploaded by a specific student
router.get("/documents/:studentId", getAllDocumentsPfe);
// Route for uploading files 
router.post("/upload", upload.array("files", 5), uploadFiles);
//route to delete document 
router.delete("/documents/:id", deleteDocument);
//check if the user has an exisiting pfe 
router.get("/:userId", loggedMiddleware, accessByRole(['student']), checkPfe);

// route pour ouvrir une période de dépôt PFE:
router.post('/open', loggedMiddleware, accessByRole(['admin']), openPFEPeriod)
//route pour modifier une période de dépot PFE:
router.patch(
  '/open',
  loggedMiddleware,
  accessByRole(['admin']),
  updatePFEPeriod,
)


//Route pour sauvegarder un nouveau pfe
router.post('/post', loggedMiddleware, accessByRole(['student']), addPFE)
// Route pour mettre à jour un PFE
router.patch('/:id', loggedMiddleware, accessByRole(['student']), updatePFE)
//route pour recuperer tous les pfe non affected et affected pour teacher
router.get('/', getPFEDetailsForStudent);
//route pour recuperer tous les pfe assignés

router.get('/get/:id', loggedMiddleware, getPFEById);
//route pour recuperer les pfe assignés pour un teacher 
router.get('/assigned/:teacherId', getAssignedPFEs);

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
  '/planning2/publish/:response',
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
//
//recupere les pfes approved
router.get('/soutenance/approved', getApprovedPfes);
// route pour créer planning soutenances PFE
// Route pour récupérer toutes les soutenances
router.get("/liste/soutenances", getAllSoutenances);
router.post('/soutenances', loggedMiddleware, accessByRole(['admin']), assignTeacherToSoutenance)
//router pour publier oum masquer planning pfe
router.post('/soutenances/publish/:response', loggedMiddleware, accessByRole(['admin']), publishOrHideSoutenances)
//route pour envoi le planning par l'email
router.post('/soutenances/send', loggedMiddleware, accessByRole(['admin']), send_soutenance_planning)
//route pour mettre a jour le planning pfe
router.patch('/:id/soutenances/', loggedMiddleware, accessByRole(['admin']), updateSoutenance)
//route pour supprimer une soutenance 
router.delete('/soutenance/:id',deleteSoutenance)
//rote pour reuperer les soutenances de teacher
router.get('/teacher/me', loggedMiddleware, accessByRole(['teacher']), getTeacherSoutenances)
//route pour recuperer les soutenances d'un etudiant
router.get('/student/me', loggedMiddleware, accessByRole(['student']), getStudentSoutenances)


export default router
