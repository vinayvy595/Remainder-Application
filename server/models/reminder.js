const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema({
    email: { type: String, required: true },
    event: { type: String, required: true },
    date: { type: Date, required: true },
    repeatUnit: {
        type: String,
        enum: ["minutes", "hours", "days", "weeks"],
        default: null
    },
    repeatValue: {
        type: Number,
        min: 1,
        default: null
    },
    repeatCount: { type: Number, min: 1, default: 3 },
    active: { type: Boolean, default: true },
    isRead: { type: Boolean, default: false },
    isPendingSummary: { type: Boolean, default: false },
    // assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});


const Reminder = mongoose.model("Reminder", ReminderSchema);

module.exports = Reminder;