import { Router } from "express"
import { PostController } from "../controllers/PostController"
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router()
const postController = new PostController()

router.get("/", postController.getPosts.bind(postController))
router.get("/search", postController.searchPosts.bind(postController))
router.get("/:id", postController.getPostById.bind(postController))

router.post("/", authMiddleware, postController.createPost.bind(postController))
router.put("/:id", authMiddleware, postController.updatePost.bind(postController))
router.delete("/:id", authMiddleware, postController.deletePost.bind(postController))

export default router