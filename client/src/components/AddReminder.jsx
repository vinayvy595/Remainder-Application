import React, { useState } from 'react';
import './style.css';

const AddReminder = ({ email, onAdd, reminders }) => {
    const [event, setEvent] = useState("");
    const [date, setDate] = useState("");
    const [repeatUnit, setRepeatUnit] = useState("");
    const [repeatValue, setRepeatValue] = useState("");
    const [repeatCount, setRepeatCount] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const reminder = {
            email,
            event,
            date,
            repeatUnit: repeatUnit || null,
            repeatValue: repeatValue ? parseInt(repeatValue) : null,
            repeatCount: repeatCount ? parseInt(repeatCount) : null
        };

        const res = await fetch("http://localhost:5000/add-reminder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reminder)
        });

        if (res.ok) {
            alert("Reminder added!");
            setEvent(""); setDate(""); setRepeatUnit(""); setRepeatValue(""); setRepeatCount("");
            onAdd(); // tells parent to reload reminder list
        } else {
            alert("Error adding reminder");
        }
    };
    const handleLogout = () => {
        localStorage.removeItem("email");
        window.location.reload();
    };

    return (
        <div className="container">
            <div className="welcome-bar">
                <span>Welcome, {email}</span>
                <button onClick={handleLogout}>Logout</button>
            </div>

            <h1>Add Reminder</h1>

            <form className="reminder-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Event"
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                    required
                />
                <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
                <select
                    value={repeatUnit}
                    onChange={(e) => setRepeatUnit(e.target.value)}
                >
                    <option value="">Repeat Unit</option>
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                </select>
                <input
                    type="number"
                    placeholder="Repeat Value"
                    min="1"
                    value={repeatValue}
                    onChange={(e) => setRepeatValue(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Count"
                    min="1"
                    value={repeatCount}
                    onChange={(e) => setRepeatCount(e.target.value)}
                />
                <button type="submit">Add Reminder</button>
            </form>


        </div>
    );
};

export default AddReminder;
