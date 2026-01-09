"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
async function main() {
    await client_1.prisma.post.deleteMany();
    await client_1.prisma.user.deleteMany({});
    //usuário TEACHER
    const teacher = await client_1.prisma.user.create({
        data: {
            name: "João",
            email: "joao@professor.com",
            role: "TEACHER"
        }
    });
    //usuário STUDENT
    const student = await client_1.prisma.user.create({
        data: {
            name: "Maria",
            email: "maria@aluno.com",
            role: "STUDENT"
        }
    });
    console.log("Usuários criados:");
    console.log("Teacher:", teacher);
    console.log("Student:", student);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await client_1.prisma.$disconnect();
});
