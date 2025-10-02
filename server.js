import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDB from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import agentRoutes from './routes/agentRoutes.js'
import leadRoutes from "./routes/leadRoutes.js"
import fs from "fs"
import path from "path"
import { createAdmin } from "./script/createAdmin.js"

dotenv.config()

connectDB()

const app = express()

const uploadsDir = path.join(process.cwd(), "uploads")
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir)
}

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/agents", agentRoutes)
app.use("/api/leads", leadRoutes)

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
    })
})

app.use((err, req, res, next) => {
    console.error("Error:", err)
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Server error",
    })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, async() => {
    await createAdmin()
    console.log(`Server running on port ${PORT}`)
})