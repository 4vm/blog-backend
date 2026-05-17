import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/UserRepository";
import { env } from "process";

const userRepository = new UserRepository();
const ADMIN_KEY = env.ADMIN_KEY as string | undefined;

export class UserService {
  async register(name: string, email: string, password: string, role?: string, adminKey?: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Formato de e-mail inválido.");
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new Error("E-mail já está em uso.");
    }

    let roleToSet: string | undefined;
    if (role) {
      const roleUpper = role.trim().toUpperCase();
      if (!["STUDENT", "TEACHER"].includes(roleUpper)) {
        throw new Error("Role inválida.");
      }
      if (roleUpper === "TEACHER") {
        if (!ADMIN_KEY || adminKey !== ADMIN_KEY) {
          throw new Error("Não autorizado para atribuir role TEACHER.");
        }
      }
      roleToSet = roleUpper;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userRepository.create({ name, email, password: hashedPassword, role: roleToSet });
    const { password: _p, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }

  async authenticate(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("E-mail ou senha inválidos.");
    }

    const isPasswordValid = await bcrypt.compare(password, (user as any).password);
    if (!isPasswordValid) {
      throw new Error("E-mail ou senha inválidos.");
    }

    return user;
  }

  async getAllUsers(userRole: string) {
    if (userRole !== "TEACHER") {
      throw new Error("Acesso negado");
    }

    return userRepository.findAll();
  }

  async getUserById(requesterId: string, requesterRole: string, id: string) {
    if (requesterId !== id && requesterRole !== "TEACHER") {
      throw new Error("Acesso negado");
    }

    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const { password: _p, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }

  async updateUser(
    requesterId: string,
    requesterRole: string,
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    },
    adminKey?: string
  ) {
    if (requesterId !== id && requesterRole !== "TEACHER") {
      throw new Error("Acesso negado");
    }

    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error("Usuário não encontrado");
    }

    if (data.email) {
      const existingEmailUser = await userRepository.findByEmail(data.email);
      if (existingEmailUser && existingEmailUser.id !== id) {
        throw new Error("E-mail já está em uso.");
      }
    }

    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error("Formato de e-mail inválido.");
      }
    }

    if (data.role) {
      const roleUpper = data.role.trim().toUpperCase();
      if (!["STUDENT", "TEACHER"].includes(roleUpper)) {
        throw new Error("Role inválida.");
      }
      if (roleUpper === "TEACHER" && requesterRole !== "TEACHER") {
        throw new Error("Não autorizado para atribuir role TEACHER.");
      }
      if (roleUpper === "TEACHER" && (!ADMIN_KEY || adminKey !== ADMIN_KEY)) {
        throw new Error("Não autorizado para atribuir role TEACHER.");
      }
      data.role = roleUpper;
    }

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    const updated = await userRepository.update(id, data);
    const { password: _p, ...userWithoutPassword } = updated as any;
    return userWithoutPassword;
  }

  async deleteUser(requesterId: string, requesterRole: string, id: string) {
    if (requesterId !== id && requesterRole !== "TEACHER") {
      throw new Error("Acesso negado");
    }

    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error("Usuário não encontrado");
    }

    await userRepository.delete(id);
  }
}
