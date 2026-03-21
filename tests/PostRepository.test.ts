const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDeleteMany = jest.fn();

jest.mock("../src/client", () => ({
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

  // Atualizei o sample para refletir o que o Prisma retorna com o include
  const samplePosts = [
    { 
      id: "1", title: "A", content: "AAA", authorId: "u1", published: true,
      author: { name: "Professor Paulo", id: "u1" } 
    },
    { 
      id: "2", title: "B", content: "BBB", authorId: "u2", published: false,
      author: { name: "Aluno Joao" } 
    },
  ];

  // Objeto de include padrão que usamos no repositório
  const expectedInclude = {
    author: {
      select: { name: true }
    }
  };

  const expectedIncludeWithId = {
    author: {
      select: { name: true, id: true }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new PostRepository();
  });

  test("findAll deve retornar todos os posts com include do autor", async () => {
    mockFindMany.mockResolvedValueOnce(samplePosts);
    const result = await repo.findAll();
    
    expect(mockFindMany).toHaveBeenCalledWith({
      include: expectedIncludeWithId
    });
    expect(result).toBe(samplePosts);
  });

  test("findPublished deve filtrar por published true e incluir autor", async () => {
    const published = samplePosts.filter(p => p.published);
    mockFindMany.mockResolvedValueOnce(published);
    const result = await repo.findPublished();
    
    expect(mockFindMany).toHaveBeenCalledWith({ 
      where: { published: true },
      include: expectedInclude
    });
    expect(result).toBe(published);
  });

  test("findById deve chamar findUnique com o id correto e incluir autor", async () => {
    const post = samplePosts[0];
    mockFindUnique.mockResolvedValueOnce(post);
    const result = await repo.findById(post.id);
    
    expect(mockFindUnique).toHaveBeenCalledWith({ 
      where: { id: post.id },
      include: expectedInclude
    });
    expect(result).toBe(post);
  });

  test("create deve criar um post com os dados fornecidos (sem include)", async () => {
    const payload = { title: "Novo", content: "conteudo", authorId: "u3", published: false };
    const created = { id: "3", ...payload };
    mockCreate.mockResolvedValueOnce(created);
    const result = await repo.create(payload);
    
    expect(mockCreate).toHaveBeenCalledWith({ data: payload });
    expect(result).toBe(created);
  });

  test("update deve atualizar o post com id e dados (sem include)", async () => {
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

  test("searchByKeyword deve buscar por title ou content e incluir autor", async () => {
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
      include: expectedInclude
    });
    expect(result).toBe(found);
  });
});