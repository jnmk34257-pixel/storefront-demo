import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary" data-bs-theme="dark">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">Conference Event Website</Link>
            

                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/signup">SignUp</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/events">Events</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/orders">Order History</Link>
                        </li>
                    </ul>

                    <div className="d-flex">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className="nav-link btn text-info px-3" to="/cart">
                                    My Schedule
                                </Link>
                            </li>
                        </ul>
                        <ul className="navbar-nav me-2">
                            <li className="nav-item">
                                <Link className="nav-link btn text-info px-3 position-relative" to="/admin">
                                    Admin
                                    {pendingCount > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                                            {pendingCount}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const [pendingCount, setPendingCount] = useState(0);

useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 10000);
    return () => clearInterval(interval);
}, []);

const fetchPendingCount = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/submissions');
        if (!response.ok) return;
        const data = await response.json();
        const count = data.filter(order => order.status === 'pending').length;
        setPendingCount(count);
    } catch (err) {
        // silently fail if server is off
    }
};

export default Navbar;