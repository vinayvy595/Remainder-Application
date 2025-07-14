const mongoose = require("mongoose");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const Reminder = require("./models/reminder.js");

dotenv.config();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Worker connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Email Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    pool: true
});

// Calculate next date for recurring reminders
const calculateNextDate = (date, unit, value) => {
    const newDate = new Date(date);
    switch (unit) {
        case "minutes": newDate.setMinutes(newDate.getMinutes() + value); break;
        case "hours": newDate.setHours(newDate.getHours() + value); break;
        case "days": newDate.setDate(newDate.getDate() + value); break;
        case "weeks": newDate.setDate(newDate.getDate() + (value * 7)); break;
    }
    return newDate;
};

// Send summary email
const sendSummary = async (email, reminders) => {
    try {
        await transporter.sendMail({
            from: `"Reminder App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Summary: ${reminders.length} Missed Reminders`,
            html: `
                <h2>Missed Reminders</h2>
                <ul>
                    ${reminders.map(r => `
                        <li>
                            <strong>${r.event}</strong>
                            <p>Due: ${r.date.toLocaleString()}</p>
                        </li>
                    `).join('')}
                </ul>
            `
        });
        console.log(`Sent summary to ${email} with ${reminders.length} reminders`);
    } catch (error) {
        console.error(`Failed to send summary to ${email}:`, error);
    }
};

// Process reminders
const processReminders = async () => {
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

    // Get all due reminders
    const dueReminders = await Reminder.find({
        date: { $lte: now },
        active: true
    });

    // Organize by email
    const remindersByEmail = {};
    dueReminders.forEach(reminder => {
        if (!remindersByEmail[reminder.email]) {
            remindersByEmail[reminder.email] = [];
        }
        remindersByEmail[reminder.email].push(reminder);
    });

    // Process each user's reminders
    for (const [email, reminders] of Object.entries(remindersByEmail)) {
        const unreadReminders = reminders.filter(r => !r.isRead);
        const readReminders = reminders.filter(r => r.isRead);

        // Send individual reminders first
        for (const reminder of unreadReminders) {
            try {
                await transporter.sendMail({
                    from: `"Reminder App" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: `Reminder: ${reminder.event}`,
                    html: `
                        <div>
                            <h3>${reminder.event}</h3>
                            <p>Due: ${reminder.date.toLocaleString()}</p>
                            <a href="${process.env.API_BASE_URL}/mark-read/${reminder._id}">
                                Mark as Read
                            </a>
                        </div>
                    `
                });
                console.log(`Sent reminder to ${email} for ${reminder.event}`);

                // Handle recurrence
                if (reminder.repeatUnit && reminder.repeatValue) {
                    const remainingCount = reminder.repeatCount - 1;
                    if (remainingCount > 0) {
                        const nextDate = calculateNextDate(reminder.date, reminder.repeatUnit, reminder.repeatValue);
                        await Reminder.findByIdAndUpdate(reminder._id, {
                            date: nextDate,
                            repeatCount: remainingCount,
                            isRead: false // Reset for next occurrence
                        });
                    } else {
                        await Reminder.findByIdAndUpdate(reminder._id, { active: false });
                    }
                } else {
                    await Reminder.findByIdAndUpdate(reminder._id, { active: false });
                }
            } catch (error) {
                console.error(`Error processing reminder:`, error);
            }
        }

        // Process read reminders (update status only)
        for (const reminder of readReminders) {
            if (reminder.repeatUnit && reminder.repeatValue) {
                const remainingCount = reminder.repeatCount - 1;
                if (remainingCount > 0) {
                    const nextDate = calculateNextDate(reminder.date, reminder.repeatUnit, reminder.repeatValue);
                    await Reminder.findByIdAndUpdate(reminder._id, {
                        date: nextDate,
                        repeatCount: remainingCount,
                        isRead: false // Reset for next occurrence
                    });
                } else {
                    await Reminder.findByIdAndUpdate(reminder._id, { active: false });
                }
            } else {
                await Reminder.findByIdAndUpdate(reminder._id, { active: false });
            }
        }

        // Check for summaries
        const currentUnread = await Reminder.countDocuments({
            email,
            isRead: false,
            date: { $lte: now }
        });

        if (currentUnread >= 3) {
            const summaryReminders = await Reminder.find({
                email,
                isRead: false,
                date: { $lte: now }
            }).limit(3);

            await sendSummary(email, summaryReminders);
            await Reminder.updateMany(
                { _id: { $in: summaryReminders.map(r => r._id) } },
                { $set: { isRead: true } }
            );
        }
    }

    // Daily cleanup for old reminders
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        const oldReminders = await Reminder.find({
            isRead: false,
            date: { $lte: oneDayAgo }
        });

        const oldByEmail = oldReminders.reduce((acc, reminder) => {
            if (!acc[reminder.email]) acc[reminder.email] = [];
            acc[reminder.email].push(reminder);
            return acc;
        }, {});

        for (const [email, reminders] of Object.entries(oldByEmail)) {
            await sendSummary(email, reminders);
            await Reminder.deleteMany({ _id: { $in: reminders.map(r => r._id) } });
        }
    }
};

// Main cron job
cron.schedule("* * * * *", async () => {
    try {
        await processReminders();
    } catch (error) {
        console.error("Cron job error:", error);
    }
});

console.log("Worker running with complete solution");
