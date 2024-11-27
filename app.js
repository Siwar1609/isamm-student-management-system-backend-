import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import routerAuth from "./routes/users-routes/users_route.js";

import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

const app = express();
mongoose
  .connect(DATABASE_URL)
  .then(function () {
    console.log("Connected !!");
  })
  .catch(function (e) {
    console.log("No connection for u !!" + e);
  });

app.use(cors());
app.use(express.json());
app.use("/api/auth", routerAuth);
// app.use("/api/internship", loggedMiddleware, isAdmin, routerInternship);

export default app;
