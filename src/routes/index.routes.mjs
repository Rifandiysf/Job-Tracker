import express from "express";
import authRoutes from "./auth.routes.mjs";

const router = express.Router();

router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Job Tracker API is running' });
});

router.use('/auth', authRoutes);

export default router