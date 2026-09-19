import { verifyToken } from "../utils/jwt.mjs";
import { error } from "../utils/response.mjs";

function authGuard(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return error(res, 401, "Token not found. Please log in first.");
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        return error(res, 401, "Invalid or expired token.");
    }
}

export default authGuard;