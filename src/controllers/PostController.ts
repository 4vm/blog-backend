import { Request, Response } from "express";
import { PostService } from "../services/PostService"

const postService = new PostService()

export class PostController {
  async getPosts(req: Request, res: Response) {
    const userRole = req.headers["x-role"] as string
        try {
            const posts = await postService.getAllPosts(userRole);
            res.status(200).json(posts);
        } catch (error) {
            res.status(400).json({ error: "Role inválido ou não informado" });
        }
    }

    async getPostById(req: Request, res: Response) {
        const { id } = req.params
        const post = await postService.getPostById(id)
        if (!post) {
            return res.status(404).json({ message: "Post não encontrado" });
        }
        res.json(post)
    }

async createPost(req: Request, res: Response) {
    const userRole = req.headers["x-role"] as string
    const { title, content, authorId, published } = req.body
    try {
        if (!title || !content || !authorId) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios." });
        }
        const post = await postService.createPost(userRole, {
            title, 
            content, 
            authorId: authorId, 
            published: published ?? false 
        })
        res.status(201).json({ message: "Post criado com sucesso!", post })
    } catch (error) {
        return res.status(500).json({ message: error instanceof Error ? error.message : "Erro ao criar post." });
    }
}

    async updatePost(req: Request, res: Response) {
        const userRole = req.headers["x-role"] as string
        const { id } = req.params
        const { title, content, published } = req.body
        try {
            if (!title || !content || published === undefined) {
                return res.status(400).json({ message: "Todos os campos são obrigatórios." });
            }
            const post = await postService.updatePost(id, userRole, { title, content, published })
            if (!post) { 
                return res.status(404).json({ message: "Post não encontrado" }); 
            }
            res.json(post)
        } catch (error) {
        return res.status(500).json({ message: error instanceof Error ? error.message : "Erro ao atualizar post." });
    }
}
        

    async deletePost(req: Request, res: Response) {
        const userRole = req.headers["x-role"] as string
        const { id } = req.params
        try {
            await postService.deletePost(id, userRole)
            return res.status(200).json({ message: "Post deletado com sucesso!" })
        } catch (error) {
            return res.status(500).json({
            message: error instanceof Error ? error.message : "Erro ao deletar post."
            })
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
            res.json(posts);
        } catch (error) {
            if (error instanceof Error && error.message === "Nenhum post encontrado") {
            return res.status(404).json({ error: "Nenhum post encontrado" });
        }
            res.status(500).json({ error: "Erro ao buscar posts" }); 
        } 
    }
}