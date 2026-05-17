import { prisma } from "../client";

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: { name: string; email: string; password: string; role?: any }) {
    return prisma.user.create({ data });
  }
}
