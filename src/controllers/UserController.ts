import { Request, Response } from "express";
import { UserService } from "../services/UserService";

const userService = new UserService();

export class UserController {
  async getUsers(req: Request, res: Response) {
    const userRole = (req as any).user?.role;

    try {
      const users = await userService.getAllUsers(userRole);
      return res.status(200).json(users);
    } catch (error: any) {
      if (error.message === "Acesso negado") {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro ao buscar usuários." });
    }
  }

  async getUserById(req: Request, res: Response) {
    const requesterId = (req as any).user?.id;
    const requesterRole = (req as any).user?.role;
    const { id } = req.params;

    if (!requesterId || !requesterRole) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    try {
      const user = await userService.getUserById(requesterId, requesterRole, id);
      return res.status(200).json(user);
    } catch (error: any) {
      if (error.message === "Acesso negado") {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === "Usuário não encontrado") {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro ao buscar usuário." });
    }
  }

  async updateUser(req: Request, res: Response) {
    const requesterId = (req as any).user?.id;
    const requesterRole = (req as any).user?.role;
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    const adminKey = (req.headers["x-admin-key"] || req.headers["admin-key"]) as string | undefined;

    if (!requesterId || !requesterRole) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    try {
      const user = await userService.updateUser(requesterId, requesterRole, id, {
        name,
        email,
        password,
        role,
      }, adminKey);

      return res.status(200).json(user);
    } catch (error: any) {
      if (error.message === "Acesso negado" || error.message === "Não autorizado para atribuir role TEACHER.") {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === "E-mail já está em uso." || error.message === "Role inválida." || error.message === "Formato de e-mail inválido.") {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === "Usuário não encontrado") {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro ao atualizar usuário." });
    }
  }

  async deleteUser(req: Request, res: Response) {
    const requesterId = (req as any).user?.id;
    const requesterRole = (req as any).user?.role;
    const { id } = req.params;

    if (!requesterId || !requesterRole) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    try {
      await userService.deleteUser(requesterId, requesterRole, id);
      return res.status(200).json({ message: "Usuário deletado com sucesso!" });
    } catch (error: any) {
      if (error.message === "Acesso negado") {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === "Usuário não encontrado") {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro ao deletar usuário." });
    }
  }
}
