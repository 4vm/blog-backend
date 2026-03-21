import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "process";

const prisma = new PrismaClient();

const JWT_SECRET = env.JWT_SECRET as string;

if (!JWT_SECRET) {
    throw new Error("A variável JWT_SECRET não foi definida");
}

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ error: "E-mail ou senha inválidos." });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "E-mail ou senha inválidos." });
      }

      // Gera Token JWT
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({
        token,
        user: userWithoutPassword,
      });

    } catch (error) {
      console.error("Erro no login:", error);
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }
}