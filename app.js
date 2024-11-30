import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import routerAuth from './routes/users-routes/users_route.js'
import dotenv from 'dotenv'
import pfa_route from './routes/pfa-routes/pfa_routes.js'
import pfa_period_route from './routes/period-routes/period_routes.js'

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

app.use('/api/v1/', pfa_route)
app.use('/api/v1/', pfa_period_route)
export default app
