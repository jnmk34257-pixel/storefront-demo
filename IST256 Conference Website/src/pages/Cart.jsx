// src/pages/Cart.jsx
import React, { useContext, useState } from 'react';
import { EventContext } from '../context/EventContext';
import { useNavigate } from 'react-router-dom'; 

const Cart = () => {
    const { events, cart, addToCart, removeFromCart } = useContext(EventContext);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate(); // Initialize navigation
    
    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (event.speaker && event.speaker.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="container my-5 pb-5">
            <div className="row g-5">
                {/* Left Column: Search / Catalog Section */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-4">
                            <h3 className="fw-bold text-primary mb-3">Search Sessions</h3>
                            <div className="input-group mb-4">
                                <input 
                                    type="text" className="form-control" 
                                    placeholder="Search events by title or speaker..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchQuery('')}>Clear</button>
                            </div>

                            <div className="row g-3">
                                {filteredEvents.map(event => (
                                    <div className="col-md-6" key={event.id}>
                                        <div className="card h-100 border-primary shadow-sm">
                                            <div className="card-body">
                                                <h6 className="card-title text-primary">{event.title}</h6>
                                                <p className="card-text small mb-1"><strong>Speaker:</strong> {event.speaker}</p>
                                                <button className="btn btn-sm btn-outline-primary w-100 mt-2" onClick={() => addToCart(event)}>
                                                    Add to Schedule
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Cart Summary */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm rounded-4 mb-4 position-sticky" style={{top: "20px"}}>
                        <div className="card-body p-4 bg-white rounded-4">
                            <h3 className="fw-bold text-success mb-3">My Selected Sessions</h3>
                            
                            {cart.length === 0 ? (
                                <div className="text-muted text-center my-4">Your schedule is currently empty.</div>
                            ) : (
                                <>
                                    <ul className="list-group mb-4">
                                        {cart.map(item => (
                                            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="my-0">{item.title}</h6>
                                                    <small className="text-muted">{item.time}</small>
                                                </div>
                                                <button className="btn btn-sm btn-danger" onClick={() => removeFromCart(item.id)}>X</button>
                                            </li>
                                        ))}
                                    </ul>
                                    {/* Navigate to the new checkout page */}
                                    <button 
                                        className="btn btn-success w-100 btn-lg" 
                                        onClick={() => navigate('/checkout')}
                                    >
                                        Proceed to Registration
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;