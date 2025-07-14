import React from 'react';

const Navbar = ({ email }) => {
    const handleLogout = () => {
        localStorage.removeItem("email");
        window.location.reload();
    };

    return (
        <div className="bg-blue-600 text-white p-4 flex justify-between">
            <h1>Welcome</h1>
            {/* <button onClick={handleLogout}>Logout</button> */}
        </div>
    );
};

export default Navbar;
