import express from "express"
import multer from "multer"
import { uploadLeads, getLeads, getLeadsByAgent, getLeadStats, getMyLeads } from "../controllers/leadController.js"
import { protect, adminOnly, agentOnly } from "../middleware/auth.js"

const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error("Invalid file type. Only CSV, XLSX, and XLS are allowed"), false)
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
})

router.get("/my-leads", protect, agentOnly, getMyLeads)

router.post("/upload", protect, adminOnly, upload.single("file"), uploadLeads)
router.get("/", protect, adminOnly, getLeads)
router.get("/stats", protect, adminOnly, getLeadStats)
router.get("/agent/:agentId", protect, adminOnly, getLeadsByAgent)

export default router
