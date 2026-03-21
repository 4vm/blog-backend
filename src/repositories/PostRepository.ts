import { prisma } from "../client";

export class PostRepository {
  async findAll() {
    return prisma.post.findMany({
      include: {
        author: {
          select: { name: true, id: true }
        }
      }
    });
  }

  async findPublished() {
    return prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: { name: true }
        }
      }
    });
  }

  async findById(id: string) {
    return prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { name: true }
        }
      }
    });
  }

  async create(data: { 
    title: string; 
    content: string; 
    authorId: string; 
    authorName?: string;
    published: boolean 
    }) {
    return prisma.post.create({ data });
   }

async update(
  id: string, 
  data: { 
    title: string; 
    content: string; 
    published: boolean; 
    authorName?: string;
  }
) {
  return prisma.post.update({ 
    where: { id }, 
    data 
  });
}

  async delete(id: string) {
    const result = await prisma.post.deleteMany({
      where: { id }
    });

    if (result.count === 0) {
      throw new Error("Post não encontrado");
    }

    return result;
  }

  async searchByKeyword(keyword: string) {
    return prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { content: { contains: keyword, mode: "insensitive" } }
        ]
      },
      include: {
        author: {
          select: { name: true }
        }
      }
    });
  }
}