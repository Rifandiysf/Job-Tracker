import { error } from "../utils/response.mjs";

function notFoundHandler(req, res, next) {
    return error(res, 404, `Route ${req.method} ${req.originalUrl} not found.`);
}

function errorHandler(err, req, res, next) {
    console.error(err);

    if (err.code === "P2002") {
        return error(res, 409, `Data with ${err.meta?.target?.join(", ")} already exists.`);
    }
    if (err.code === "P2025") {
        return error(res, 404, "Data not found.");
    }

    return error(res, err.statusCode || 500, err.message || "An error occurred on the server.");
}

export { notFoundHandler, errorHandler };