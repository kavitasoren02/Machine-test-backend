import express from "express"
import { createAgent, getAgents, getAgent, deleteAgent } from "../controllers/agentController.js"
import { protect, adminOnly } from "../middleware/auth.js"

const router = express.Router()

router.use(protect)

router.route("/").post(adminOnly, createAgent).get(adminOnly, getAgents)
router.route("/:id").get(getAgent).delete(adminOnly, deleteAgent)

export default router
