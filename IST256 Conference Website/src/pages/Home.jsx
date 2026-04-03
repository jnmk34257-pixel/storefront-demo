// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <>
            <section className="container my-5">
                <div className="bg-light rounded-4 p-5 text-center shadow-sm">
                    <h1 className="display-5 fw-bold">Register Now for the 2026 Conference Event</h1>
                    <p className="lead mb-2">Join students, faculty, and industry guests for a full day of ideas and networking.</p>
                    <p className="mb-4">
                        <strong>Date:</strong> April 18, 2026 | <strong>Location:</strong> Penn State
                    </p>
                    <Link className="btn btn-primary btn-lg" to="/signup">Register Now</Link>
                </div>
            </section>

            <section className="container mb-5">
                <h2 className="text-center mb-4 why-attend-title">Why Attend</h2>
                <div className="row g-4">
                    <div className="col-md-6 col-lg-3">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title text-primary">Expert Speakers</h5>
                                <p className="card-text">Learn from sessions led by experienced professionals and faculty.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title text-primary">Career Networking</h5>
                                <p className="card-text">Connect with peers, alumni, and potential employers in one place.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title text-primary">Hands-On Learning</h5>
                                <p className="card-text">Participate in practical workshops that build real-world skills.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title text-primary">Project Inspiration</h5>
                                <p className="card-text">Discover ideas and tools you can apply to your own projects.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;