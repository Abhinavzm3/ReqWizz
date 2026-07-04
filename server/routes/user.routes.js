import express from "express";

import {
  googleCallback,
  signup,
  login,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/auth/google/callback", googleCallback);

router.post("/auth/signup", signup);

router.post("/auth/login", login);

export default router;