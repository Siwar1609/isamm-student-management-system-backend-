import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import cors from 'cors'
import dotenv from 'dotenv'
import routerAuth from './routes/users-routes/auth_route.js'
import routerSubject from './routes/subject-routes/subject.js'
import routerAcademicYear from './routes/academic-year-routes/academicYear_route.js'
import routerInternship from './routes/internship-routes/internship_route.js'
import usersRouter from './routes/users-routes/users_route.js'
import studentsRouter from './routes/users-routes/students_route.js'
import teachersRouter from './routes/users-routes/teachers_route.js'
import gestionPFERoutes from './routes/GestionPfe-routes/GestionPfe_route.js'
import { scheduleStudentReminder } from './controllers/notifications-controller/student_reminder.js'
import { scheduleTeacherReminder } from './controllers/notifications-controller/teacher_reminder.js'
import { loggedMiddleware } from './middlewares/users-middlewares/auth_middleware.js'
import pfa_route from './routes/pfa-routes/pfa_routes.js'
import choice_pfa_route from './routes/pfa-routes/pfa_choice_routes.js'
import pfa_period_route from './routes/period-routes/period_routes.js'
import internship_period_route from './routes/period-routes/internship_period_routes.js'
import routerSkill from './routes/skill-routes/skill.js'
import routerChapter from './routes/chapter-routes/chapter.js'
import routerCurriculum from './routes/curriculum-routes/currilculum_route.js'
import routerAssesmentSkill from './routes/assesment-skill-routes/assesmentskill_route.js'
import routerAssesmentSubject from './routes/subject-assesment-route/subjectAssesment_route.js'
import RouterPublishSubject from './routes/subject-routes/subject.js'
import option_period_route from './routes/options-routes/option_period_routes.js'
import routerOption from './routes/options-routes/option_routes.js'
import soutenance_pfa_route from './routes/soutenance-routes/soutenanance_pfa.js'
import routerEvaluation from './routes/subject-routes/evaluation_routes.js'
import routerYears from './routes/academic-year-routes/years_route.js'

dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL

const app = express()

mongoose
  .connect(DATABASE_URL)
  .then(function () {
    console.log('Connected to the database ✅')
  })
  .catch(function (e) {
    console.log('Correction Error ⛔' + e)
  })

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.send(' <h1> Server is Running correctly ✅ </h1> ')
})

scheduleStudentReminder()
scheduleTeacherReminder()

app.use('/api/auth', routerAuth)
app.use('/api/accounts', usersRouter)
app.use('/api/students', studentsRouter)
app.use('/api/teachers', teachersRouter)
app.use('/api/internship', loggedMiddleware, routerInternship)
app.use('/api/v1/PFE', gestionPFERoutes)
app.use('/api/v1/pfa', pfa_route)
app.use('/api/v1/pfaperiod', pfa_period_route)
app.use('/api/v1/pfachoice', choice_pfa_route)
app.use('/api/v1/pfasoutenance', soutenance_pfa_route)
app.use('/api/period/', internship_period_route)
app.use('/api/subject', routerSubject)
app.use('/api/academicyear', routerAcademicYear)
app.use('/api/years', routerYears)
app.use('/api/skill', routerSkill)
app.use('/api/chapter', routerChapter)
app.use('/api/curriculum', routerCurriculum)
app.use('/api/assesmentskill', routerAssesmentSkill)
app.use('/api/assesmentsubject', routerAssesmentSubject)
app.use('/api/accounts', usersRouter)
app.use('/api/students', studentsRouter)
app.use('/api/teachers', teachersRouter)
app.use('/api/subject/publish/:response', RouterPublishSubject)
app.use('/api/option', option_period_route)
app.use('/api/options', loggedMiddleware, routerOption)
app.use('/api/evaluation', routerEvaluation)

export default app
