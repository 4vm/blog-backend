import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const userController = new UserController();

router.get("/", authMiddleware, userController.getUsers.bind(userController));
router.put("/:id", authMiddleware, userController.updateUser.bind(userController));
router.delete("/:id", authMiddleware, userController.deleteUser.bind(userController));

export default router;
