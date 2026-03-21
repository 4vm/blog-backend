import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "process";

const JWT_SECRET = env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("A variável JWT_SECRET não foi definida");
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as { id: string; role: string };

    (req as any).user = {
      id: decoded.id,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
}