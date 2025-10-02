import mongoose from "mongoose"

const leadSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
            default: "",
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Agent",
            required: true,
        },
    },
    {
        timestamps: true,
    },
)

const Lead = mongoose.model("Lead", leadSchema)

export default Lead
