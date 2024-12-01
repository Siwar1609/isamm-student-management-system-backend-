import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import routerAuth from './routes/users-routes/users_route.js'
import dotenv from 'dotenv'
import routerInternship from './routes/internship-routes/internship_period_route.js'
import routerDocument from './routes/document-routes/document_route.js'
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
app.use('/api/auth', routerAuth)
app.use('/api/internship', loggedMiddleware, routerInternship)
app.use('/api', loggedMiddleware, routerDocument)
export default app
