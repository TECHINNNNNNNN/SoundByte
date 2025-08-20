import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import session from "express-session"
import passport from "passport"
import rateLimit from "express-rate-limit"
import authRoutes from "./routes/auth.js"
import "./config/passport.js"
import cookieParser from "cookie-parser"
import conversationRoutes from "./routes/conversations.js"
import messageRoutes from "./routes/messages.js"
import aiRoutes from "./routes/ai.routes.js"
import digestRoutes from "./routes/digests.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Rate Limiter - relaxed for development
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 for dev, 100 for prod
    message: "Too many requests, please try again later.",
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
})

app.use(limiter)

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())


// session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }
}))

// passport initialization
app.use(passport.initialize())

app.use("/api/auth", authRoutes)
app.use("/api/conversations", conversationRoutes)
app.use("/api/conversations", messageRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/digests", digestRoutes)


// Health check endpoint
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.use((err, _req, res, _next) => {
    console.error("Error:", err)
    res.status(500).json({ message: "SoundByte API is currently experiencing issues. Please try again later." })
})

// Catch-all 404 handler
app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" })
})

app.listen(PORT, () => {
    console.log(`🚀 SoundByte API running on port ${PORT}`);
    console.log(`📱 Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
})