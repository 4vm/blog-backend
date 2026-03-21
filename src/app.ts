import express from "express";
import cors from "cors"; 
import postRoutes from "./routes/post.routes";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", authRoutes);
app.use("/posts", postRoutes);

export default app;