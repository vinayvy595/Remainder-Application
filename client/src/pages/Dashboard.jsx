import React from 'react';
import { useEffect, useState } from "react";
import AddReminder from "../components/AddReminder";
import ReminderList from "../components/ReminderList";
import Navbar from "../components/Navbar";
import { fetchReminders } from "../api";

const Dashboard = ({ email }) => {
    const [reminders, setReminders] = useState([]);

    const loadReminders = async () => {
        const data = await fetchReminders();
        const userReminders = data.filter(r => r.email === email);
        setReminders(userReminders);
    };

    useEffect(() => {
        loadReminders();
    }, []);

    return (
        <div>
            <Navbar email={email} />
            <div className="p-4">
                <AddReminder email={email} onAdd={loadReminders} />
                <ReminderList reminders={reminders} />
            </div>
        </div>
    );
};

export default Dashboard;
