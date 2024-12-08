import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import routerAuth from './routes/users-routes/users_route.js'
import routerSubject from './routes/subject-routes/subject.js'
import routerAcademicYear from './routes/academic-year-routes/academicYear_route.js'
import dotenv from 'dotenv'
import routerSkill from './routes/skill-routes/skill.js'
import routerChapter from './routes/chapter-routes/chapter.js'
import routerCurriculum from './routes/curriculum-routes/currilculum_route.js'
import routerAssesmentSkill from './routes/assesment-skill-routes/assesmentskill_route.js'
import routerAssesmentSubject from './routes/subject-assesment-route/subjectAssesment_route.js'
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
app.use('/api/auth', routerAuth)
// app.use("/api/internship", loggedMiddleware, isAdmin, routerInternship);
app.use('/api/subject', routerSubject)
app.use('/api/academicyear', routerAcademicYear)
app.use('/api/skill', routerSkill)
app.use('/api/chapter',routerChapter)
app.use('/api/curriculum',routerCurriculum)
app.use('/api/assesmentskill', routerAssesmentSkill)
app.use('/api/assesmentsubject', routerAssesmentSubject)
export default app
