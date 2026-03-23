import "dotenv/config"
import { env } from "node:process"
import app from "./app"

const PORT = env.PORT || 3000;

app.listen(PORT, () => console.log(`O servidor está rodando na porta ${PORT}`))