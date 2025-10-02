import Lead from "../models/Lead.js"
import Agent from "../models/Agent.js"
import csv from "csv-parser"
import fs from "fs"
import xlsx from "xlsx"

export const uploadLeads = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a file",
            })
        }

        const filePath = req.file.path
        const fileExtension = req.file.originalname.split(".").pop().toLowerCase()

        let leads = []

        if (fileExtension === "csv") {
            leads = await new Promise((resolve, reject) => {
                const results = []
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on("data", (data) => {
                        const normalizedData = {}
                        Object.keys(data).forEach((key) => {
                            normalizedData[key.toLowerCase().trim()] = data[key]
                        })

                        results.push({
                            firstName: normalizedData.firstname || normalizedData.first_name || "",
                            phone: normalizedData.phone || "",
                            notes: normalizedData.notes || "",
                        })
                    })
                    .on("end", () => resolve(results))
                    .on("error", (error) => reject(error))
            })
        }
        else if (fileExtension === "xlsx" || fileExtension === "xls") {
            const workbook = xlsx.readFile(filePath)
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const data = xlsx.utils.sheet_to_json(worksheet)

            leads = data.map((row) => {
                const normalizedData = {}
                Object.keys(row).forEach((key) => {
                    normalizedData[key.toLowerCase().trim()] = row[key]
                })

                return {
                    firstName: normalizedData.firstname || normalizedData.first_name || "",
                    phone: String(normalizedData.phone || ""),
                    notes: normalizedData.notes || "",
                }
            })
        } else {
            fs.unlinkSync(filePath)
            return res.status(400).json({
                success: false,
                message: "Invalid file format. Only CSV, XLSX, and XLS are allowed",
            })
        }

        const validLeads = leads.filter((lead) => lead.firstName && lead.phone)

        if (validLeads.length === 0) {
            fs.unlinkSync(filePath)
            return res.status(400).json({
                success: false,
                message: "No valid leads found in the file. Please ensure FirstName and Phone columns are present",
            })
        }

        const agents = await Agent.find()

        if (agents.length === 0) {
            fs.unlinkSync(filePath)
            return res.status(400).json({
                success: false,
                message: "No agents available. Please create agents first",
            })
        }

        const leadsPerAgent = Math.floor(validLeads.length / agents.length)
        const remainingLeads = validLeads.length % agents.length

        const distributedLeads = []
        let currentIndex = 0

        for (let i = 0; i < agents.length; i++) {
            const leadsCount = leadsPerAgent + (i < remainingLeads ? 1 : 0)

            for (let j = 0; j < leadsCount; j++) {
                if (currentIndex < validLeads.length) {
                    distributedLeads.push({
                        ...validLeads[currentIndex],
                        assignedTo: agents[i]._id,
                    })
                    currentIndex++
                }
            }
        }

        const savedLeads = await Lead.insertMany(distributedLeads)

        fs.unlinkSync(filePath)

        res.status(201).json({
            success: true,
            message: `Successfully uploaded and distributed ${savedLeads.length} leads among ${agents.length} agents`,
            totalLeads: savedLeads.length,
            agentsCount: agents.length,
        })
    } catch (error) {
        console.error("Upload leads error:", error)

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path)
        }

        res.status(500).json({
            success: false,
            message: "Server error",
        })
    }
}

export const getLeads = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1
        const limit = Number.parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit

        const totalLeads = await Lead.countDocuments()
        const leads = await Lead.find()
            .populate("assignedTo", "name email mobile")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        res.status(200).json({
            success: true,
            count: leads.length,
            totalLeads,
            totalPages: Math.ceil(totalLeads / limit),
            currentPage: page,
            leads,
        })
    } catch (error) {
        console.error("Get leads error:", error)
        res.status(500).json({
            success: false,
            message: "Server error",
        })
    }
}

export const getLeadsByAgent = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1
        const limit = Number.parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit

        const totalLeads = await Lead.countDocuments({ assignedTo: req.params.agentId })
        const leads = await Lead.find({ assignedTo: req.params.agentId })
            .populate("assignedTo", "name email mobile")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        res.status(200).json({
            success: true,
            count: leads.length,
            totalLeads,
            totalPages: Math.ceil(totalLeads / limit),
            currentPage: page,
            leads,
        })
    } catch (error) {
        console.error("Get leads by agent error:", error)
        res.status(500).json({
            success: false,
            message: "Server error",
        })
    }
}

export const getMyLeads = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1
        const limit = Number.parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit

        const totalLeads = await Lead.countDocuments({ assignedTo: req.user._id })
        const leads = await Lead.find({ assignedTo: req.user._id })
            .populate("assignedTo", "name email mobile")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        res.status(200).json({
            success: true,
            count: leads.length,
            totalLeads,
            totalPages: Math.ceil(totalLeads / limit),
            currentPage: page,
            leads,
        })
    } catch (error) {
        console.error("Get my leads error:", error)
        res.status(500).json({
            success: false,
            message: "Server error",
        })
    }
}

export const getLeadStats = async (req, res) => {
    try {
        const stats = await Lead.aggregate([
            {
                $group: {
                    _id: "$assignedTo",
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "agents",
                    localField: "_id",
                    foreignField: "_id",
                    as: "agent",
                },
            },
            {
                $unwind: "$agent",
            },
            {
                $project: {
                    agentId: "$_id",
                    agentName: "$agent.name",
                    agentEmail: "$agent.email",
                    leadsCount: "$count",
                },
            },
        ])

        res.status(200).json({
            success: true,
            stats,
        })
    } catch (error) {
        console.error("Get lead stats error:", error)
        res.status(500).json({
            success: false,
            message: "Server error",
        })
    }
}
