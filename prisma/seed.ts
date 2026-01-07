import { prisma } from "./client"

async function main() {
  await prisma.user.deleteMany({})

  //usuário TEACHER
  const teacher = await prisma.user.create({
    data: {
      name: "João",
      email: "joao@professor.com",
      role: "TEACHER"
    }
  })

  //usuário STUDENT
  const student = await prisma.user.create({
    data: {
      name: "Maria",
      email: "maria@aluno.com",
      role: "STUDENT"
    }
  })

  console.log("✅ Usuários criados:")
  console.log("Teacher:", teacher)
  console.log("Student:", student)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })