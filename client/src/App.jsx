import React from 'react';
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [email, setEmail] = useState(localStorage.getItem("email"));

  const handleLogin = (email) => {
    localStorage.setItem("email", email);
    setEmail(email);
  };

  return email ? <Dashboard email={email} /> : <Login onLogin={handleLogin} />;
}

export default App;



