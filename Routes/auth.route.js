import express from "express"
import { googleAuth } from "../Server/Controllers/auth.controller.js"

const authRouter = express.Router()

authRouter.post("/google", googleAuth)

export default authRouter