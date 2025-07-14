require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const Reminder = require('./models/reminder')


const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // update this if using a different port
    credentials: true // if you're using cookies or auth headers
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));


// const userControl = require('./controller/userControl');
// const authenticate = require('./midleware/authentic');

// app.post('/api/user/register', userControl.register);
// app.post('/api/user/login', userControl.login);

// API Endpoints
app.post("/add-reminder", async (req, res) => {
    try {
        const { email, event, date, repeatUnit, repeatValue, repeatCount } = req.body;

        // Validate required fields
        if (!email || !event || !date) {
            return res.status(400).json({ error: "Email, event and date are required" });
        }

        // Validate repeat parameters if provided
        if (repeatUnit && !repeatValue) {
            return res.status(400).json({ error: "Repeat value is required when repeat unit is provided" });
        }

        const newReminder = new Reminder({
            email,
            event,
            date: new Date(date),
            repeatUnit: repeatUnit || null,
            repeatValue: repeatValue || null,
            repeatCount: repeatCount || null,
            active: true,
            // assignedTo: req.user.userId
        });

        await newReminder.save();
        res.status(201).json({
            message: "Reminder created successfully!",
            reminder: newReminder
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/reminders", async (req, res) => {
    try {
        const reminders = await Reminder.find();
        res.json(reminders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch reminders" });
    }
});

app.delete("/delete-reminder/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReminder = await Reminder.findByIdAndDelete(id);
        if (!deletedReminder) {
            return res.status(404).json({ error: "Reminder not found" });
        }
        res.json({ message: "Reminder deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete reminder" });
    }
});

// Mark reminder as read
app.get('/mark-read/:id', async (req, res) => {
    await Reminder.findByIdAndUpdate(req.params.id, { isRead: true });
    res.send('<script>window.close();</script>'); // Closes the tab after marking
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));