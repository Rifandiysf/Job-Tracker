import authService from "../services/auth.service.mjs";
import { success } from "../utils/response.mjs";

async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;
        const result = await authService.register({ name, email, password });
        return success(res, 201, "Registration successful", result);
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const result = await authService.login({ email, password });
        return success(res, 200, "Login successful", result);
    } catch (err) {
        next(err);
    }
}

async function googleCallback(req, res, next) {
    try {
        const { id: googleId, emails, displayName, photos } = req.user;
        const result = await authService.findOrCreateGoogleUser({
            googleId,
            email: emails[0].value,
            name: displayName,
            avatarUrl: photos?.[0]?.value,
        });

        return res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${result.token}`);
    } catch (err) {
        next(err);
    }
}

async function forgotPassword(req, res, next) {
    try {
        await authService.requestPasswordReset(req.body.email);
        return success(res, 200, "If the email is registered, a password reset link has been sent");
    } catch (err) {
        next(err);
    }
}

async function resetPassword(req, res, next) {
    try {
        const { token, newPassword } = req.body;
        await authService.resetPassword({ token, newPassword });
        return success(res, 200, "Password reset successfully. Please log in again");
    } catch (err) {
        next(err);
    }
}

export default { register, login, googleCallback, forgotPassword, resetPassword };