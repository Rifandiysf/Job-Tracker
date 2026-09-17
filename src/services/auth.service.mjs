import bcrypt from "bcryptjs";
import crypto from "crypto";
import userModel from "../models/user.model.mjs";
import { create as createResetToken, findByToken, markUsed } from "../models/passwordResetToken.model.mjs";
import { signToken } from "../utils/jwt.mjs";
import { sendResetPasswordEmail } from "../utils/mailer.mjs";

const RESET_TOKEN_EXPIRY_MINUTES = 30;

async function register({ name, email, password }) {
    const existing = await userModel.findByEmail(email);
    if (existing) {
        const err = new Error("Email sudah terdaftar");
        err.statusCode = 409;
        throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, email, password: hashedPassword, provider: "local" });
    const token = signToken({ id: user.id, email: user.email });

    return { user: sanitizeUser(user), token };
}

async function login({ email, password }) {
    const user = await userModel.findByEmail(email);
    if (!user || !user.password) {
        const err = new Error("Email atau password salah");
        err.statusCode = 401;
        throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const err = new Error("Email atau password salah");
        err.statusCode = 401;
        throw err;
    }

    const token = signToken({ id: user.id, email: user.email });
    return { user: sanitizeUser(user), token };
}

async function findOrCreateGoogleUser({ googleId, email, name, avatarUrl }) {
    let user = await userModel.findByGoogleId(googleId);

    if (!user) {
        user = await userModel.findByEmail(email);

        if (user) {
            user = await userModel.update(user.id, {
                googleId,
                provider: "google",
                avatarUrl: avatarUrl || user.avatarUrl,
                emailVerifiedAt: user.emailVerifiedAt || new Date(),
            });
        } else {
            const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
            user = await userModel.create({
                name,
                email,
                googleId,
                provider: "google",
                avatarUrl,
                password: randomPassword,
                emailVerifiedAt: new Date(),
            });
        }
    }

    const token = signToken({ id: user.id, email: user.email });
    return { user: sanitizeUser(user), token };
}

async function requestPasswordReset(email) {
    const user = await userModel.findByEmail(email);
    if (!user) return;

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await createResetToken({ userId: user.id, token, expiresAt });

    const resetUrl = `${process.env.RESET_PASSWORD_URL}?token=${token}`;
    await sendResetPasswordEmail(email, resetUrl);
}

async function resetPassword({ token, newPassword }) {
    const resetToken = await findByToken(token);

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
        const err = new Error("Token reset password tidak valid atau sudah kedaluwarsa");
        err.statusCode = 400;
        throw err;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userModel.update(resetToken.userId, { password: hashedPassword });
    await markUsed(resetToken.id);
}

function sanitizeUser(user) {
    const { password, ...safeUser } = user;
    return safeUser;
}

export default { register, login, findOrCreateGoogleUser, requestPasswordReset, resetPassword, sanitizeUser };