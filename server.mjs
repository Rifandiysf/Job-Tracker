import app from "./src/app.mjs";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Job Tracker API running on http://localhost:${PORT}`)
})