import Agent from "../models/Agent.js"

export const createAgent = async (req, res) => {
    try {
        const { name, email, mobile, password } = req.body

        if (!name || !email || !mobile || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            })
        }

        const agentExists = await Agent.findOne({ email })

        if (agentExists) {
            return res.status(400).json({
                success: false,
                message: "Agent with this email already exists",
            })
        }

        const agent = await Agent.create({
            name,
            email,
            mobile,
            password,
        })

        res.status(201).json({
            success: true,
            message: "Agent created successfully",
            agent: {
                id: agent._id,
                name: agent.name,
                email: agent.email,
                mobile: agent.mobile,
            },
        })
    } catch (error) {
        console.error("Create agent error:", error)
        res.status(500).json({
            success: false,
            message: "Server error",
        })
    }
}

export const getAgents = async (req, res) => {
    try {
        const agents = await Agent.find().select("-password").sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            count: agents.length,
            agents,
        })
    } catch (error) {
        console.error("Get agents error:", error)
        res.status(500).json({
            success: false,
            message: "Server error",
        })
    }
}

export const getAgent = async (req, res) => {
    try {
        if (req.user.role === "agent" && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only view your own profile.",
            })
        }

        const agent = await Agent.findById(req.params.id).select("-password")

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: "Agent not found",
            })
        }

        res.status(200).json({
            success: true,
            agent,
        })
    } catch (error) {
        console.error("Get agent error:", error)
        res.status(500).json({
            success: false,
            message: "Server error",
        })
    }
}

export const deleteAgent = async (req, res) => {
    try {
        const agent = await Agent.findById(req.params.id)

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: "Agent not found",
            })
        }

        await agent.deleteOne()

        res.status(200).json({
            success: true,
            message: "Agent deleted successfully",
        })
    } catch (error) {
        console.error("Delete agent error:", error)
        res.status(500).json({
            success: false,
            message: "Server error",
        })
    }
}
