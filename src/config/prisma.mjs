import { PrismaClient } from "@prisma/client";


const prisma = global.__prisma || new PrismaClient({
    log: process.env.NODE_ENV = "development" ? ["warn", "error"] : ["error"],
});

if (process.env.NODE_ENV === "development") {
    global.__prisma = prisma;
}

export default prisma;