const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDeleteMany = jest.fn();

jest.mock("../prisma/client", () => ({
  prisma: {
    post: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
      deleteMany: mockDeleteMany,
    },
  },
}));

import { PostRepository } from "../src/repositories/PostRepository";

describe("PostRepository", () => {
  let repo: PostRepository;

  const samplePosts = [
    { id: "1", title: "A", content: "AAA", authorId: "u1", published: true },
    { id: "2", title: "B", content: "BBB", authorId: "u2", published: false },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new PostRepository();
  });

  test("findAll deve retornar todos os posts", async () => {
    mockFindMany.mockResolvedValueOnce(samplePosts);
    const result = await repo.findAll();
    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(result).toBe(samplePosts);
  });

  test("findPublished deve filtrar por published true", async () => {
    const published = samplePosts.filter(p => p.published);
    mockFindMany.mockResolvedValueOnce(published);
    const result = await repo.findPublished();
    expect(mockFindMany).toHaveBeenCalledWith({ where: { published: true } });
    expect(result).toBe(published);
  });

  test("findById deve chamar findUnique com o id correto", async () => {
    const post = samplePosts[0];
    mockFindUnique.mockResolvedValueOnce(post);
    const result = await repo.findById(post.id);
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: post.id } });
    expect(result).toBe(post);
  });

  test("create deve criar um post com os dados fornecidos", async () => {
    const payload = { title: "Novo", content: "conteudo", authorId: "u3", published: false };
    const created = { id: "3", ...payload };
    mockCreate.mockResolvedValueOnce(created);
    const result = await repo.create(payload);
    expect(mockCreate).toHaveBeenCalledWith({ data: payload });
    expect(result).toBe(created);
  });

  test("update deve atualizar o post com id e dados", async () => {
    const id = "1";
    const data = { title: "Atualizado", content: "novo", published: true };
    const updated = { id, ...data, authorId: "u1" };
    mockUpdate.mockResolvedValueOnce(updated);
    const result = await repo.update(id, data);
    expect(mockUpdate).toHaveBeenCalledWith({ where: { id }, data });
    expect(result).toBe(updated);
  });

  test("delete deve remover e retornar resultado quando count > 0", async () => {
    const id = "1";
    mockDeleteMany.mockResolvedValueOnce({ count: 1 });
    const result = await repo.delete(id);
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { id } });
    expect(result).toEqual({ count: 1 });
  });

  test("delete deve lançar erro quando nenhum post for removido", async () => {
    const id = "errado";
    mockDeleteMany.mockResolvedValueOnce({ count: 0 });
    await expect(repo.delete(id)).rejects.toThrow("Post não encontrado");
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { id } });
  });

  test("searchByKeyword deve buscar por title ou content", async () => {
    const keyword = "termo";
    const found = [samplePosts[0]];
    mockFindMany.mockResolvedValueOnce(found);
    const result = await repo.searchByKeyword(keyword);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { content: { contains: keyword, mode: "insensitive" } },
        ],
      },
    });
    expect(result).toBe(found);
  });
});
