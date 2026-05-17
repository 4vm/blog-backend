import express from "express";
import cors from "cors"; 
import postRoutes from "./routes/post.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", authRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);

export default app;