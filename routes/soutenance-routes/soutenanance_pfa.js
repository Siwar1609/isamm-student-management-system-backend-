import express from 'express'
import { fetch_by_filter, fetch_my_soutenance, fetch_my_soutenance_byId, fetch_my_soutenances_as_student, fetch_soutenances, planifier, publish_soutenances, send_soutenancePfa_list_email, updateSoutenance } from '../../controllers/soutenance-controller/soutenance_pfa_controller.js'
import { accessByRole } from '../../middlewares/users-middlewares/auth_middleware.js'
import { createPV, fetch_my_pv, updatePV } from '../../controllers/soutenance-controller/soutenance_pv_controller.js'


const soutenance_pfa_route = express.Router()

// -------------------------- Admin ------------------------------------------------
soutenance_pfa_route.post("/assign",accessByRole(['admin']),planifier)
soutenance_pfa_route.get("/",accessByRole(['admin']),fetch_soutenances)
soutenance_pfa_route.patch("/:id/soutenances",accessByRole(['admin']),updateSoutenance)
soutenance_pfa_route.post("/publish/:response",accessByRole(['admin']),publish_soutenances)
soutenance_pfa_route.post("/list/send",accessByRole(['admin']),send_soutenancePfa_list_email)
soutenance_pfa_route.get("/:filter/:id",accessByRole(['admin']),fetch_by_filter)

// -------------------------- Teacher ----------------------------------------------------
soutenance_pfa_route.get("/mine",accessByRole(['teacher']),fetch_my_soutenance)
soutenance_pfa_route.get("/mine/:id",accessByRole(['teacher']),fetch_my_soutenance_byId)

// --------------------------- Student ---------------------------------------------------
soutenance_pfa_route.get("/student/mine",accessByRole(['student']),fetch_my_soutenances_as_student)

// --------------------------PV ----------------------------------------------------
soutenance_pfa_route.patch("/pv/update/:id/",accessByRole(['teacher']),updatePV)
soutenance_pfa_route.post("/pv/:soutenanceId/create",accessByRole(['admin']),createPV)
soutenance_pfa_route.get("/pv/student/:id",accessByRole(['student']),fetch_my_pv)



export default soutenance_pfa_route 