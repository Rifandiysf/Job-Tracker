const { error } = require("../utils/response");

function notFoundHandler(req, res, next) {
    return error(res, 404, `Route ${req.method} ${req.originalUrl} tidak ditemukan`);
}

function errorHandler(err, req, res, next) {
    console.error(err);

    if (err.code === "P2002") {
        return error(res, 409, `Data dengan ${err.meta?.target?.join(", ")} sudah terdaftar`);
    }

    if (err.code === "P2025") {
        return error(res, 404, "Data tidak ditemukan");
    }

    return error(res, err.statusCode || 500, err.message || "Terjadi kesalahan pada server");
}

export default { notFoundHandler, errorHandler };