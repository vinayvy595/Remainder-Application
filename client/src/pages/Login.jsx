import React from 'react';
import { useState } from "react";

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email.trim()) onLogin(email.trim());
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-2xl mb-4">Enter Your Email to Continue</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full p-2 border rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button className="mt-4 w-full bg-blue-500 text-white p-2 rounded" type="submit">
                    Continue
                </button>
            </form>
        </div>
    );
};

export default Login;
