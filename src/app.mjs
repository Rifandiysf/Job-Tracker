import express from "express";
import cors from "cors";
import passport from "./config/passport.js";
import routes from "./routes/index.routes.mjs";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.mjs";

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.get("/", (req, res) => res.json({ message: "Job Tracker API is running" }));

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;