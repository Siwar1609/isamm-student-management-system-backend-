import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import cors from 'cors'
import routerAuth from './routes/users-routes/auth_route.js'
import dotenv from 'dotenv'
import routerInternship from './routes/internship-routes/internship_route.js'
import routerDocument from './routes/document-routes/document_route.js'
import usersRouter from './routes/users-routes/users_route.js'
import studentsRouter from './routes/users-routes/students_route.js'
import teachersRouter from './routes/users-routes/teachers_route.js'
import gestionPFERoutes from './routes/GestionPfe-routes/GestionPfe_route.js'
import { loggedMiddleware } from './middlewares/users-middlewares/auth_controller.js'

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

app.use('/api/accounts', usersRouter)
app.use('/api/teachers', teachersRouter)
app.use('/api/students', studentsRouter)
app.use('/api/auth', routerAuth)
app.use('/api/internship', loggedMiddleware, routerInternship)
app.use('/api', loggedMiddleware, routerDocument)
app.use('/PFE', gestionPFERoutes)
export default app
