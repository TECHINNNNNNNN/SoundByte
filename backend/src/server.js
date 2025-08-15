import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import session from "express-session"
import passport from "passport"
import rateLimit from "express-rate-limit"
import authRoutes from "./routes/auth.js"
import "./config/passport.js"
import cookieParser from "cookie-parser"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later."
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


// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.use((err, req, res, next) => {
    console.error("Error:", err)
    res.status(500).json({ message: "SoundByte API is currently experiencing issues. Please try again later." })
})

// Catch-all 404 handler - Express 5 compatible
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" })
})

app.listen(PORT, () => {
    console.log(`🚀 SoundByte API running on port ${PORT}`);
    console.log(`📱 Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
})