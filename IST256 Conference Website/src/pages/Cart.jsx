// src/pages/Cart.jsx
import React, { useContext, useState } from 'react';
import { EventContext } from '../context/EventContext';

const Cart = () => {
    const { events, cart, setCart, addToCart, removeFromCart } = useContext(EventContext);
    
    // --- STATE ---
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    
    // Form State
    const [email, setEmail] = useState('');
    const [specialRequests, setSpecialRequests] = useState('');
    const [emailError, setEmailError] = useState(false);
    
    // AJAX / API State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ajaxResponse, setAjaxResponse] = useState(null);

    // --- SEARCH LOGIC ---
    // Dynamically filter the catalog as the user types
    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (event.speaker && event.speaker.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    // --- CHECKOUT LOGIC (Replaces $.ajax) ---
    const handleCheckout = async (e) => {
        e.preventDefault();
        
        // 1. Validation Integrity Check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setEmailError(true);
            return; 
        }
        setEmailError(false);
        setIsSubmitting(true);
        setAjaxResponse(null);

        // 2. Prepare Payload
        const payloadData = {
            email: email.trim(),
            specialRequests: specialRequests.trim(),
            scheduledEvents: cart,
            submissionTime: new Date().toISOString()
        };

        // 3. API Request using native fetch
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payloadData)
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Success Feedback
            setAjaxResponse({
                type: 'success',
                message: `Success! API received your data. Assigned Server ID: ${data.id}`
            });

            // Reset Form and Cart State
            setEmail('');
            setSpecialRequests('');
            setCart([]); // Clears context state
            localStorage.setItem('conference_user_cart', JSON.stringify([])); // Clears storage

        } catch (error) {
            // Error Feedback
            setAjaxResponse({
                type: 'danger',
                message: `Error: Could not connect to the API. (${error.message})`
            });
        } finally {
            setIsSubmitting(false); // Stop loading indicator
        }
    };

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
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Search events by title or speaker..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button className="btn btn-outline-secondary" type="button" onClick={handleClearSearch}>
                                    Clear
                                </button>
                            </div>

                            <div className="row g-3">
                                {filteredEvents.length === 0 ? (
                                    <p className="text-muted">No sessions found.</p>
                                ) : (
                                    filteredEvents.map(event => (
                                        <div className="col-md-6" key={event.id}>
                                            <div className="card h-100 border-primary shadow-sm">
                                                <div className="card-body">
                                                    <h6 className="card-title text-primary">{event.title}</h6>
                                                    <p className="card-text small mb-1"><strong>Speaker:</strong> {event.speaker}</p>
                                                    <p className="card-text small mb-2"><strong>Time:</strong> {event.time}</p>
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary w-100" 
                                                        onClick={() => addToCart(event)}
                                                    >
                                                        Add to Schedule
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Cart & Checkout Section */}
                <div className="col-lg-5">
                    
                    {/* Selected Sessions List */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-4 bg-white rounded-4">
                            <h3 className="fw-bold text-success mb-3">My Selected Sessions</h3>
                            
                            {cart.length === 0 ? (
                                <div className="text-muted text-center my-3">Your schedule is currently empty.</div>
                            ) : (
                                <ul className="list-group mb-3">
                                    {cart.map(item => (
                                        <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="my-0">{item.title}</h6>
                                                <small className="text-muted">{item.id} | {item.time}</small>
                                            </div>
                                            <button className="btn btn-sm btn-danger" onClick={() => removeFromCart(item.id)}>X</button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Checkout Form */}
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body p-4">
                            <h4 className="fw-bold mb-3">Finalize Registration</h4>
                            <form onSubmit={handleCheckout} noValidate>
                                
                                <div className="mb-3">
                                    <label className="form-label">Confirmation Email *</label>
                                    <input 
                                        type="email" 
                                        className={`form-control ${emailError ? 'is-invalid' : ''}`}
                                        value={email} 
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (emailError) setEmailError(false); // Clear error on typing
                                        }}
                                        required 
                                    />
                                    {emailError && <div className="invalid-feedback">Please provide a valid email address.</div>}
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label">Special Accommodations</label>
                                    <textarea 
                                        className="form-control" 
                                        rows="2"
                                        value={specialRequests}
                                        onChange={(e) => setSpecialRequests(e.target.value)}
                                    ></textarea>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100 btn-lg" 
                                    disabled={cart.length === 0 || isSubmitting}
                                >
                                    {isSubmitting ? 'Sending...' : 'Submit Schedule'}
                                </button>
                            </form>

                            {/* AJAX Response Alert */}
                            {ajaxResponse && (
                                <div className={`mt-3 alert alert-${ajaxResponse.type}`}>
                                    {ajaxResponse.message}
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Cart;