// src/pages/Cart.js
import React, { useContext, useState } from 'react';
import { EventContext } from '../context/EventContext';

const Cart = () => {
    const { events, cart, addToCart, removeFromCart } = useContext(EventContext);
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic from your cart.js AJAX call goes here
        console.log("Submitting schedule for:", email, cart);
    };

    return (
        <div className="container my-5">
            <div className="row g-5">
                {/* Search / Catalog Section */}
                <div className="col-lg-7">
                    <h3 className="fw-bold text-primary mb-3">Search Sessions</h3>
                    <div className="row g-3">
                        {events.map(event => (
                            <div className="col-md-6" key={event.id}>
                                <div className="card h-100 border-primary shadow-sm">
                                    <div className="card-body">
                                        <h6>{event.title}</h6>
                                        <button 
                                            className="btn btn-sm btn-outline-primary w-100" 
                                            onClick={() => addToCart(event)}
                                        >
                                            Add to Schedule
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cart Section */}
                <div className="col-lg-5">
                    <div className="card shadow-sm p-4 mb-4">
                        <h3 className="text-success">My Selected Sessions</h3>
                        <ul className="list-group">
                            {cart.length === 0 && <p className="text-muted">Your schedule is empty.</p>}
                            {cart.map(item => (
                                <li key={item.id} className="list-group-item d-flex justify-content-between">
                                    {item.title}
                                    <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)}>X</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Checkout Form */}
                    <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                        <label className="form-label">Confirmation Email *</label>
                        <input 
                            type="email" 
                            className="form-control mb-3" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                        <button className="btn btn-primary w-100" disabled={cart.length === 0}>
                            Submit Schedule
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Cart;