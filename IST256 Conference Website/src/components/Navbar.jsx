import React from 'react';
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
                                <Link className="nav-link btn text-info px-3" to="/admin">
                                    Admin
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;