import { PostService } from "../src/services/PostService";
import { PostRepository } from "../src/repositories/PostRepository";

describe("PostService", () => {
  let postService: PostService;

  beforeEach(() => {
    postService = new PostService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getAllPosts", () => {
    it("deve retornar apenas posts publicados para STUDENT", async () => {
      const published = [{ id: "1", title: "Pub", content: "c", authorId: "a", published: true }];
      jest.spyOn(PostRepository.prototype, "findPublished").mockResolvedValue(published as any);

      const result = await postService.getAllPosts("STUDENT");
      expect(result).toEqual([expect.objectContaining({ id: "1", title: "Pub" })]);
    });

    it("deve retornar todos os posts para TEACHER", async () => {
      const all = [{ id: "1", title: "Qualquer", content: "Conteúdo", authorId: "author1", published: false }];
      jest.spyOn(PostRepository.prototype, "findAll").mockResolvedValue(all as any);

      const result = await postService.getAllPosts("TEACHER");
      expect(result).toEqual([expect.objectContaining({ id: "1", title: "Qualquer" })]);
    });

    it("deve lançar erro para role inválido", async () => {
      await expect(postService.getAllPosts("ADMIN")).rejects.toThrow("Role inválido");
    });
  });

  describe("getPostById", () => {
    it("deve lançar erro se id não for fornecido", async () => {
      await expect(postService.getPostById("")).rejects.toThrow("Post não encontrado");
    });

    it("deve retornar post pelo id", async () => {
      const post = { id: "1", title: "Post", content: "abc", authorId: "a", published: true };
      jest.spyOn(PostRepository.prototype, "findById").mockResolvedValue(post as any);

      const result = await postService.getPostById("1");
      expect(result).toEqual(expect.objectContaining({ id: "1", title: "Post" }));
    });
  });

  describe("createPost", () => {
    const data = { title: "t", content: "c", authorId: "a", published: true };

    it("deve lançar erro se role não for TEACHER", async () => {
      await expect(postService.createPost("STUDENT", data)).rejects.toThrow(
        "Criação de posts permitida apenas para professores"
      );
    });

    it("deve criar post se role for TEACHER", async () => {
      const created = { id: "1", ...data };
      jest.spyOn(PostRepository.prototype, "create").mockResolvedValue(created as any);

      const result = await postService.createPost("TEACHER", data);
      expect(result).toEqual(expect.objectContaining({ id: "1", title: "t", content: "c" }));
    });
  });

  describe("updatePost", () => {
    const updateData = { title: "t2", content: "c2", published: false };

    it("deve lançar erro se id não for fornecido", async () => {
      await expect(postService.updatePost("", "TEACHER", updateData)).rejects.toThrow("Post não encontrado");
    });

    it("deve lançar erro se role não for TEACHER", async () => {
      await expect(postService.updatePost("1", "STUDENT", updateData)).rejects.toThrow(
        "Atualização de posts permitida apenas para professores"
      );
    });

    it("deve atualizar post se role for TEACHER", async () => {
      const updated = { id: "1", ...updateData };
      jest.spyOn(PostRepository.prototype, "update").mockResolvedValue(updated as any);

      const result = await postService.updatePost("1", "TEACHER", updateData);
      expect(result).toEqual(expect.objectContaining({ id: "1", title: "t2" }));
    });
  });

  describe("deletePost", () => {
    it("deve lançar erro se id não for fornecido", async () => {
      await expect(postService.deletePost("", "TEACHER")).rejects.toThrow("Post não encontrado");
    });

    it("deve lançar erro se role não for TEACHER", async () => {
      await expect(postService.deletePost("1", "STUDENT")).rejects.toThrow(
        "Exclusão de posts permitida apenas para professores"
      );
    });

    it("deve deletar post se role for TEACHER", async () => {
      jest.spyOn(PostRepository.prototype, "delete").mockResolvedValue(true as any);

      const result = await postService.deletePost("1", "TEACHER");
      expect(result).toBe(true);
    });
  });

  describe("searchPosts", () => {
    it("deve lançar erro se nenhum post encontrado", async () => {
      jest.spyOn(PostRepository.prototype, "searchByKeyword").mockResolvedValue([] as any);
      await expect(postService.searchPosts("nada")).rejects.toThrow("Nenhum post encontrado");
    });

    it("deve retornar posts encontrados", async () => {
      const found = [{ id: "1", title: "Post", content: "abc", authorId: "a", published: true }];
      jest.spyOn(PostRepository.prototype, "searchByKeyword").mockResolvedValue(found as any);

      const result = await postService.searchPosts("Post");
      expect(result).toEqual([expect.objectContaining({ id: "1", title: "Post" })]);
    });
  });
});
