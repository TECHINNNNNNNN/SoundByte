import { verifyToken } from "../utils/jwt.js";
import { prisma } from "../lib/db.js";

export const authenticateToken = async (req, res, next) => {
    // Check for token in Authorization header first (for backward compatibility)
    const authHeader = req.headers['authorization']
    const headerToken = authHeader && authHeader.split(' ')[1]

    // Also check for token in cookies
    const cookieToken = req.cookies?.accessToken

    // Use header token if present, otherwise use cookie token
    const token = headerToken || cookieToken

    if (!token) {
        return res.status(401).json({ message: "Access Token is required" })
    }

    try {
        const decoded = verifyToken(token)
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true, avatar: true }
        })

        if (!user) {
            return res.status(401).json({ message: "Invalid token" })
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(403).json({ message: "Invalid token or expired" })
    }
}