import React from 'react';
import './style.css';

const ReminderList = ({ reminders }) => {
    const now = new Date();

    const future = reminders.filter(r => new Date(r.date) > now);
    const past = reminders.filter(r => new Date(r.date) <= now);

    const renderList = (list, label) => (
        <>

            <div className="reminders-list">
                <h3>{label}</h3>
                {list.length === 0 ? (
                    <p >None</p>
                ) : (
                    <ul>
                        {list.map(r => (
                            <li key={r._id} className="mb-2">
                                <strong>{r.event}</strong> —{" "}
                                {new Date(r.date).toLocaleString()}
                                {r.isRead && " ✅"}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

        </>
    );

    return (
        <div>
            {renderList(future, "Upcoming Reminders")}
            {/* {renderList(past, "Past Reminders")} */}
        </div>
    );
};

export default ReminderList;
