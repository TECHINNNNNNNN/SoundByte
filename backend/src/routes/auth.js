import express from "express"
import { prisma } from "../lib/db.js"
import { hashPassword, comparePassword } from "../utils/password.js"
import { generateToken } from "../utils/jwt.js"
import { authenticateToken } from "../middleware/auth.js"
import { verifyToken } from "../utils/jwt.js"
import passport from "passport"

const router = express.Router()

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" })
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        const { accessToken, refreshToken } = generateToken(user.id)

        await prisma.session.create({
            data: {
                sessionToken: refreshToken,
                userId: user.id,
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        })

        // Store both tokens in cookies
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 15 * 60 * 1000 // 15 minutes
        })

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            }
            // Note: accessToken removed from response since it's in cookie
        })

    } catch (error) {
        console.error("Error registering user:", error)
        res.status(500).json({ message: "Internal server error" })
    }
})


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required to login both email and password" })
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user || !user.password) {
            return res.status(401).json({ message: "Invalid credentials in login process" })
        }

        const isPasswordValid = await comparePassword(password, user.password)

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password while logging in" })
        }

        const { accessToken, refreshToken } = generateToken(user.id)

        await prisma.session.create({
            data: {
                sessionToken: refreshToken,
                userId: user.id,
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        })

        // Store both tokens in cookies
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 15 * 60 * 1000 // 15 minutes
        })

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            }
            // Note: accessToken removed from response since it's in cookie
        })
    } catch (error) {
        console.error("Error logging in:", error)
        res.status(500).json({ message: "Internal server error in login process" })
    }
})

router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token is required" })
        }

        // Verify the refresh token is valid JWT
        try {
            verifyToken(refreshToken)
        } catch (error) {
            return res.status(401).json({ message: "Invalid refresh token format" })
        }

        // check if refresh token is valid in database
        const session = await prisma.session.findUnique({
            where: {
                sessionToken: refreshToken
            },
            include: { user: true }
        })

        if (!session || session.expires < new Date()) {
            return res.status(401).json({ message: "Invalid or expired refresh token" })
        }

        const { accessToken, refreshToken: newRefreshToken } = generateToken(session.user.id)

        // Delete old session and create new one (token rotation)
        await prisma.$transaction([
            // Delete the old session
            prisma.session.delete({
                where: { id: session.id }
            }),
            // Create new session with new refresh token
            prisma.session.create({
                data: {
                    sessionToken: newRefreshToken,
                    userId: session.user.id,
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                }
            })
        ])

        // Store both new tokens in cookies
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 15 * 60 * 1000 // 15 minutes
        })

        res.status(200).json({
            message: "Tokens refreshed successfully"
            // Note: accessToken removed from response since it's in cookie
        })
    } catch (error) {
        console.error("Error refreshing token:", error)
        res.status(500).json({ message: "Internal server error in refresh token process" })
    }
})

router.post('/logout', authenticateToken, async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken

        if (refreshToken) {
            await prisma.session.deleteMany({
                where: { sessionToken: refreshToken }
            })
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        })

        res.json({ message: "Logged out successfully" })

    } catch (error) {
        console.error("Error logging out:", error)
        res.status(500).json({ message: "Internal server error in logout process" })
    }
})


router.get('/me', authenticateToken, async (req, res) => {
    res.json({ user: req.user })
})


router.get('/google', passport.authenticate("google", { scope: ["profile", "email"] }))

router.get('/google/callback',
    passport.authenticate('google', { session: false }),
    async (req, res) => {
        try {
            const { accessToken, refreshToken } = generateToken(req.user.id)
            // store refresh token in database
            await prisma.session.create({
                data: {
                    sessionToken: refreshToken,
                    userId: req.user.id,
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                }
            })

            // Set both tokens as cookies
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 15 * 60 * 1000 // 15 minutes
            })

            // Redirect without exposing tokens in URL
            const clientUrl = process.env.NODE_ENV === 'production' 
                ? process.env.CLIENT_URL 
                : (process.env.CLIENT_URL || 'http://localhost:5173');
            res.redirect(`${clientUrl}/auth/callback?success=true`)

        } catch (error) {
            console.error("Error in Google login callback:", error)
            res.status(500).json({ message: "Internal server error in Google login process" })
        }
    }
)

router.get('/github', passport.authenticate("github", { scope: ["user:email"] }))

router.get('/github/callback',
    passport.authenticate('github', { session: false }),
    async (req, res) => {
        try {
            const { accessToken, refreshToken } = generateToken(req.user.id)
            // store refresh token in database
            await prisma.session.create({
                data: {
                    sessionToken: refreshToken,
                    userId: req.user.id,
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                }
            })

            // Set both tokens as cookies
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 15 * 60 * 1000 // 15 minutes
            })

            // Redirect without exposing tokens in URL
            const clientUrl = process.env.NODE_ENV === 'production' 
                ? process.env.CLIENT_URL 
                : (process.env.CLIENT_URL || 'http://localhost:5173');
            res.redirect(`${clientUrl}/auth/callback?success=true`)

        } catch (error) {
            console.error("Error in Github login callback:", error)
            res.status(500).json({ message: "Internal server error in Github login process" })
        }
    }
)

export default router