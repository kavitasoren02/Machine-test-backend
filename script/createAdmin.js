import dotenv from "dotenv"
import User from "../models/User.js"

dotenv.config()

export const createAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: "admin@example.com" })

        if (adminExists) {
            console.log("Admin user already exists")
        }

        const admin = await User.create({
            email: "admin@example.com",
            password: "admin123",
            role: "admin",
        })

        console.log("Admin user created successfully")
        console.log("Email: admin@example.com")
        console.log("Password: admin123")
        console.log("Please change the password after first login")
    } catch (error) {
        console.error("Error:", error.message)
    }
}
