import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/login", authController.login.bind(authController));

export default authRoutes;