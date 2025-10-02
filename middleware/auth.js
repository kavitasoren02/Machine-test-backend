import jwt from "jsonwebtoken"
import User from "../models/User.js"
import Agent from "../models/Agent.js"

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token",
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (decoded.role === "admin") {
            req.user = await User.findById(decoded.id).select("-password")
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Not authorized, user not found",
                })
            }
        } else if (decoded.role === "agent") {
            req.user = await Agent.findById(decoded.id).select("-password")
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Not authorized, agent not found",
                })
            }
        } else {
            return res.status(401).json({
                success: false,
                message: "Not authorized, invalid role",
            })
        }

        next()
    } catch (error) {
        console.error("Auth middleware error:", error)
        return res.status(401).json({
            success: false,
            message: "Not authorized, token failed",
        })
    }
}

export const adminOnly = async (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next()
    } else {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin only.",
        })
    }
}

export const agentOnly = async (req, res, next) => {
    if (req.user && req.user.role === "agent") {
        next()
    } else {
        return res.status(403).json({
            success: false,
            message: "Access denied. Agent only.",
        })
    }
}
