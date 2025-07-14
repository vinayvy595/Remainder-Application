export const fetchReminders = async () => {
    const res = await fetch("http://localhost:5000/reminders");
    const data = await res.json();
    return data;
};
