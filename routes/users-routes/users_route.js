import {
  login,
  SignUp,
} from "../../controllers/users-controller/auth_controller.js";
import express from "express";

const router = express.Router();

router.post("/signup", SignUp);
router.post("/login", login);

export default router;
