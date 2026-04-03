// src/components/EventDetailsCard.jsx
import React, { useContext } from 'react';
import { EventContext } from '../context/EventContext';
import { useNavigate } from 'react-router-dom';

const EventDetailsCard = ({ event }) => {
    const { addToCart } = useContext(EventContext);
    const navigate = useNavigate();

    const handleAddToSchedule = () => {
        addToCart(event);
        navigate('/cart'); // Automatically redirect them to the cart after adding
    };

    return (
        <div className="row justify-content-center mb-5">
            <div className="col-md-10 col-lg-8">
                <div className="card shadow border-primary mb-4">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">Event Details</h4>
                        <span className="badge bg-light text-dark">ID: {event.id}</span>
                    </div>
                    <div className="card-body p-4">
                        <h2 className="card-title text-primary mb-3">{event.title}</h2>
                        
                        <div className="row mb-4">
                            <div className="col-sm-6 mb-2">
                                <strong><span className="text-muted">Speaker:</span></strong><br /> {event.speaker}
                            </div>
                            <div className="col-sm-6 mb-2">
                                <strong><span className="text-muted">Time:</span></strong><br /> {event.time}
                            </div>
                            <div className="col-sm-6 mb-2">
                                <strong><span className="text-muted">Location:</span></strong><br /> {event.location}
                            </div>
                            <div className="col-sm-6 mb-2">
                                <strong><span className="text-muted">Availability:</span></strong><br /> 
                                <span className={`badge ${event.seatsAvailable > 20 ? 'bg-success' : 'bg-warning text-dark'}`}>
                                    {event.seatsAvailable} Seats Left
                                </span>
                            </div>
                        </div>

                        <div className="p-3 bg-light rounded border">
                            <h5 className="mb-2">Session Description</h5>
                            <p className="card-text mb-0">{event.description}</p>
                        </div>
                        
                        <div className="mt-4 text-center">
                            <button onClick={handleAddToSchedule} className="btn btn-success btn-lg px-5">
                                Add to My Schedule
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsCard;