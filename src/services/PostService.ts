import { PostRepository } from "../repositories/PostRepository"

const postRepository = new PostRepository()

export class PostService {
async getAllPosts(userRole?: string) {
  const role = userRole?.trim().toUpperCase() ?? "";
  
    if (role !== "TEACHER") {
    return postRepository.findPublished();
  }
    return postRepository.findAll();
}

  async getPostById(id: string) {
    if (!id) {
      throw new Error("Post não encontrado")
    }
    return postRepository.findById(id)
  }

  async createPost(userRole: string, data: { title: string; content: string; authorId: string; authorName?: string; published: boolean; }) {
    if (userRole !== "TEACHER") {
      throw new Error("Criação de posts permitida apenas para professores")
    }
    return postRepository.create(data)
  }

  async updatePost(id: string, userRole: string, data: { title: string; content: string; authorName?: string; published: boolean; }) {
    if (!id) {
      throw new Error("Post não encontrado")
    }
    if (userRole !== "TEACHER") {
      throw new Error("Atualização de posts permitida apenas para professores")
    }
    return postRepository.update(id, data)
  }

  async deletePost(id: string, userRole: string) {
    if (!id) {
      throw new Error("Post não encontrado")
    }
    if (userRole !== "TEACHER") {
      throw new Error("Exclusão de posts permitida apenas para professores")
    }
    return postRepository.delete(id)
  }

  async searchPosts(keyword: string) { 
    const posts = await postRepository.searchByKeyword(keyword);
    if (posts.length === 0) {
      throw new Error("Nenhum post encontrado");
    }
    return posts;
  }
}