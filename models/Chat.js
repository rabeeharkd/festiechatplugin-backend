const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true }, // "admin" | "member"
  joinedAt: { type: Date, required: true },
  lastRead: { type: Date, required: true },
});

const lastMessageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  sender: { type: String, required: true },
  timestamp: { type: Date, required: true },
});

const settingsSchema = new mongoose.Schema({
  allowFileSharing: { type: Boolean, required: true },
  allowMediaSharing: { type: Boolean, required: true },
  allowParticipantMessages: { type: Boolean, required: true },
  messageRetention: { type: Number, required: true },
});

const chatSchema = new mongoose.Schema(
  {
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    avatar: String,
    category: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: { type: String },
    isAdminDM: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isMuted: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    lastMessage: lastMessageSchema,
    legacyLastMessage: lastMessageSchema,
    legacyParticipants: [Object],
    name: { type: String, required: true },
    participants: [participantSchema],
    settings: settingsSchema,
    type: { type: String, enum: ["group", "dm"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
