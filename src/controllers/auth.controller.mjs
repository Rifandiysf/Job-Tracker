import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

import prisma from '../config/prisma';
import { ApiError, asyncHandler } from '../utils/apiError';
import { generateAuthTokens, verifyRefreshToken } from '../utils/jwt';
import { sendResetPasswordEmail } from '../utils/mailer';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const SALT_ROUNDS = 10;

const publicUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerifiedAt: user.emailVerifiedAt,
    theme: user.theme,
    provider: user.provider,
    avatarUrl: user.avatarUrl,
});

const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new ApiError(409, 'Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            provider: 'local',
        },
    });

    const tokens = generateAuthTokens(user);

    res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: { user: publicUser(user), ...tokens },
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const tokens = generateAuthTokens(user);

    res.json({
        success: true,
        message: 'Login successful',
        data: { user: publicUser(user), ...tokens },
    });
});

const googleLogin = asyncHandler(async (req, res) => {
    const { idToken } = req.body;

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch (err) {
        throw new ApiError(401, 'Invalid Google token');
    }

    if (!payload?.email) {
        throw new ApiError(401, 'Google account has no email');
    }

    let user = await prisma.user.findUnique({ where: { email: payload.email } });

    if (user) {
        if (!user.googleId) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId: payload.sub,
                    provider: 'google',
                    avatarUrl: payload.picture || user.avatarUrl,
                    emailVerifiedAt: user.emailVerifiedAt || new Date(),
                },
            });
        }
    } else {
        user = await prisma.user.create({
            data: {
                name: payload.name || payload.email.split('@')[0],
                email: payload.email,
                password: null,
                provider: 'google',
                googleId: payload.sub,
                avatarUrl: payload.picture,
                emailVerifiedAt: new Date(),
            },
        });
    }

    const tokens = generateAuthTokens(user);

    res.json({
        success: true,
        message: 'Google login successful',
        data: { user: publicUser(user), ...tokens },
    });
});

const refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    let decoded;
    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
        throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) {
        throw new ApiError(401, 'User no longer exists');
    }

    const tokens = generateAuthTokens(user);

    res.json({ success: true, data: tokens });
});

const me = asyncHandler(async (req, res) => {
    res.json({ success: true, data: { user: req.user } });
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return res.json({
            success: true,
            message: 'If that email is registered, a reset link has been sent',
        });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const expiresInMin = Number(process.env.RESET_PASSWORD_TOKEN_EXPIRES_MIN) || 30;
    const expiresAt = new Date(Date.now() + expiresInMin * 60 * 1000);

    await prisma.passwordResetToken.create({
        data: {
            userId: user.id,
            token: hashedToken,
            expiresAt,
        },
    });

    const resetUrl = `${process.env.RESET_PASSWORD_URL}?token=${rawToken}&email=${encodeURIComponent(email)}`;

    await sendResetPasswordEmail(email, resetUrl);

    res.json({
        success: true,
        message: 'If that email is registered, a reset link has been sent',
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await prisma.passwordResetToken.findUnique({
        where: { token: hashedToken },
    });

    if (
        !resetRecord ||
        resetRecord.usedAt ||
        resetRecord.expiresAt < new Date()
    ) {
        throw new ApiError(400, 'Reset token is invalid or has expired');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await prisma.$transaction([
        prisma.user.update({
            where: { id: resetRecord.userId },
            data: { password: hashedPassword },
        }),
        prisma.passwordResetToken.update({
            where: { id: resetRecord.id },
            data: { usedAt: new Date() },
        }),
    ]);

    res.json({ success: true, message: 'Password has been reset successfully' });
});

const logout = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

export default {
    register,
    login,
    googleLogin,
    refresh,
    me,
    forgotPassword,
    resetPassword,
    logout,
};