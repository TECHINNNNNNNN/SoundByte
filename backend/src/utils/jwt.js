import jwt from "jsonwebtoken"

export const generateToken = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    )

    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    )

    return { accessToken, refreshToken }
}

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET)
}