import { PostRepository } from "../repositories/PostRepository"

const postRepository = new PostRepository()

export class PostService {
  async getAllPosts(userRole: string) {
    if (userRole === "STUDENT") {
      // alunos só veem posts publicados
      return postRepository.findPublished();
    }
    if (userRole === "TEACHER") {
      // professores veem todos os posts
      return postRepository.findAll();
    }
    throw new Error("Role inválido");
  }

     async getPostById(id: string) {
        if (!id) {
            throw new Error("Post não encontrado")
        }
        return postRepository.findById(id)
     }

     async createPost(userRole: string, data: { title: string; content: string; authorId: string; published: boolean; }) {
         if (userRole !== "TEACHER") {
            throw new Error("Criação de posts permitida apenas para professores")
         }
        return postRepository.create(data)
     }

     async updatePost(id: string, userRole: string, data: { title: string; content: string, published: boolean; }) {
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