import bcrypt from "bcryptjs";
import prisma from "../utils/prisma-client.mjs";
import signToken from "../utils/jwt.mjs"
import crypto from "crypto"


const RESET_TOKEN_EXPIRY_MINUTES = 30;

async function register({ name, email, password }) {
    const existing = await prisma.user.findUnique({
        where: { email }
    })

    if (existing) {
        const err = new Error("Email sudah terdaftar");
        err.statusCode = 409;
        throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { name, email, password, hashedPassword }
    })

    const token = signToken({ id: user.id, email: user.email })

    return {
        user: sanitizeUser(user), token
    }
}

async function login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        const err = new Error("Email atau Password salah")
        err.statusCode = 401
        throw err
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        const err = new Error("Email atau Password salah")
        err.statusCode = 401
        throw err
    }

    const token = signToken({ id: user.id, email: user.email });

    return {
        user: sanitizeUser(user),
        token
    }
}

async function findCreateGoogleUser({ googleId, email, name }) {
    let user = await prisma.user.findUnique({ where: { googleId } })

    if (!user) {
        user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId }
            });
        } else {
            const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);

            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    googleId,
                    password: randomPassword,
                    emailVerifiedAt: new Date()
                }
            })
        }
    }

    const token = signToken({ id: user.id, email: user.email });

    return {
        user: sanitizeUser(user),
        token
    }
}

async function requestPasswordReset(email) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return;

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt }
    })

    //email service

    return token;
}

async function resetPassword({ token, newPassword }) {
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
        const err = new Error("Token reset password tidak valid atau sudah kedaluwarsa");
        err.statusCode = 400;
        throw err;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.$transaction([
        prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword }
        }),
        prisma.passwordResetToken.update({
            where: { id: resetPassword.id },
            data: { userAt: new Date() }
        })
    ])
}

function sanitizeUser(user) {
    const { password, ...safeUser } = user;
    return safeUser;
}

export default {
    register,
    login,
    findCreateGoogleUser,
    requestPasswordReset,
    resetPassword,
    sanitizeUser,
}