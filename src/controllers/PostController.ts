import { Request, Response } from "express";
import { PostService } from "../services/PostService";

const postService = new PostService();

export class PostController {
  
  async getPosts(req: Request, res: Response) {
    const userRole = (req as any).user?.role || "STUDENT";
    
    try {
      const posts = await postService.getAllPosts(userRole);
      return res.status(200).json(posts);
    } catch (error) {
      return res.status(400).json({ error: "Erro ao buscar posts." });
    }
  }

  async getPostById(req: Request, res: Response) {
    const { id } = req.params;
    const post = await postService.getPostById(id);
    
    if (!post) {
      return res.status(404).json({ message: "Post não encontrado" });
    }
    return res.json(post);
  }

  async createPost(req: Request, res: Response) {
    const userRole = (req as any).user.role;
    const authorId = (req as any).user.id; 
    
    const { title, content, published } = req.body;
    
    try {
      if (!title || !content) {
        return res.status(400).json({ message: "Título e conteúdo são obrigatórios." });
      }
      
      const post = await postService.createPost(userRole, {
        title, 
        content, 
        authorId,
        published: published ?? false 
      });
      
      return res.status(201).json({ message: "Post criado com sucesso!", post });
    } catch (error) {
      return res.status(500).json({ message: error instanceof Error ? error.message : "Erro ao criar post." });
    }
  }

  async updatePost(req: Request, res: Response) {
    const userRole = (req as any).user.role;
    const { id } = req.params;
    const { title, content, published } = req.body;
    
    try {
      if (!title || !content || published === undefined) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
      }
      
      const post = await postService.updatePost(id, userRole, { title, content, published });
      
      if (!post) { 
        return res.status(404).json({ message: "Post não encontrado" }); 
      }
      return res.json(post);
    } catch (error) {
      return res.status(500).json({ message: error instanceof Error ? error.message : "Erro ao atualizar post." });
    }
  }

  async deletePost(req: Request, res: Response) {
    const userRole = (req as any).user.role;
    const { id } = req.params;
    
    try {
      await postService.deletePost(id, userRole);
      return res.status(200).json({ message: "Post deletado com sucesso!" });
    } catch (error) {
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Erro ao deletar post."
      });
    }
  }

  async searchPosts(req: Request, res: Response) {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        error: "Informe uma palavra para buscar" 
      });
    }
    
    try {
      const posts = await postService.searchPosts(String(q)); 
      return res.json(posts);
    } catch (error) {
      if (error instanceof Error && error.message === "Nenhum post encontrado") {
        return res.status(404).json({ error: "Nenhum post encontrado" });
      }
      return res.status(500).json({ error: "Erro ao buscar posts" }); 
    } 
  }
}