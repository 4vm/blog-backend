import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando limpeza do banco...');

  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log('Criando usuários...');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);

  const teacher = await prisma.user.create({
    data: {
      name: 'Professor Paulo',
      email: 'professor@teste.com',
      password: hashedPassword,
      role: Role.TEACHER,
    },
  });

  const student = await prisma.user.create({
    data: {
      name: 'Aluno Joao',
      email: 'aluno@teste.com',
      password: hashedPassword,
      role: Role.STUDENT,
    },
  });

  console.log('Criando 5 posts com nomes de autores personalizados...');

  const postsData = [
    {
      title: 'Introdução ao TypeScript',
      content: 'TypeScript é um superset de JavaScript que adiciona tipagem estática.',
      published: true,
      authorId: teacher.id,
      authorName: 'Especialista em TS', // Nome livre
    },
    {
      title: 'Dicas de React Hooks',
      content: 'useEffect e useState são fundamentais para gerenciar estados.',
      published: true,
      authorId: teacher.id,
      authorName: 'React Team Core', // Nome livre
    },
    {
      title: 'Configurando MongoDB com Prisma',
      content: 'A integração do Prisma com MongoDB facilita muito o uso de ObjectIDs.',
      published: true,
      authorId: student.id,
      authorName: 'Comunidade MongoDB', // Nome livre
    },
    {
      title: 'Post Rascunho (Não publicado)',
      content: 'Este conteúdo ainda não deve aparecer na Home.',
      published: false,
      authorId: teacher.id,
      authorName: 'Paulo (Privado)', // Nome livre
    },
    {
      title: 'O Futuro do Full-stack',
      content: 'A stack React + Node + Prisma é extremamente produtiva em 2026.',
      published: true,
      authorId: student.id,
      authorName: 'Futurista Tech', // Nome livre
    },
  ];

  for (const post of postsData) {
    await prisma.post.create({ data: post });
  }

  console.log('Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });