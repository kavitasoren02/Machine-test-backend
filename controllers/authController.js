import User from "../models/User.js"
import Agent from "../models/Agent.js"
import generateToken from "../utils/generateToken.js"

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password",
            })
        }

        let user = await User.findOne({ email })
        let role = "admin"

        if (!user) {
            user = await Agent.findOne({ email })
            role = "agent"
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            })
        }

        const isPasswordMatch = await user.matchPassword(password)

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            })
        }

        generateToken(res, user._id, role)

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                name: user.name || undefined,
                role: role,
            },
        })
    } catch (error) {
        console.error("Login error:", error)
        res.status(500).json({
            success: false,
            message: "Server error",
        })
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            sameSite: "none",
            expires: new Date(0),
        })

        res.status(200).json({
            success: true,
            message: "Logout successful",
        })
    } catch (error) {
        console.error("Logout error:", error)
        res.status(500).json({
            success: false,
            message: "Server error",
        })
    }
}

export const getMe = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                email: req.user.email,
                name: req.user.name || undefined,
                role: req.user.role,
            },
        })
    } catch (error) {
        console.error("Get me error:", error)
        res.status(500).json({
            success: false,
            message: "Server error",
        })
    }
}
