import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "process";
import { UserService } from "../services/UserService";

const userService = new UserService();

const JWT_SECRET = env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("A variável JWT_SECRET não foi definida");
}

export class AuthController {
  async register(req: Request, res: Response) {
    const { name, email, password, role } = req.body;
    const adminKey = (req.headers["x-admin-key"] || req.headers["admin-key"]) as string | undefined;

    try {
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
      }

      const user = await userService.register(name, email, password, role, adminKey);
      return res.status(201).json(user);
    } catch (error: any) {
      if (error.message === "E-mail já está em uso.") {
        return res.status(409).json({ error: error.message });
      }
      if (error.message === "Formato de e-mail inválido.") {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === "Role inválida.") {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === "Não autorizado para atribuir role TEACHER.") {
        return res.status(403).json({ error: error.message });
      }
      console.error("Erro no registro:", error);
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
      }

      const user = await userService.authenticate(email, password);

      // Gera Token JWT
      const token = jwt.sign({ id: (user as any).id, role: (user as any).role }, JWT_SECRET, { expiresIn: "1d" });

      const { password: _, ...userWithoutPassword } = user as any;

      return res.status(200).json({
        token,
        user: userWithoutPassword,
      });

    } catch (error: any) {
      console.error("Erro no login:", error);
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }
  }
}