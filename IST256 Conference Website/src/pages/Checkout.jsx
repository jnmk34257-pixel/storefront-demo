import React, { useContext, useState, useEffect } from 'react';
import { EventContext } from '../context/EventContext';
import { useNavigate, Link } from 'react-router-dom';
import { getSavedUsers } from '../utils/storage';

const Checkout = () => {
    const { cart, setCart } = useContext(EventContext);
    const navigate = useNavigate();
    
    // Form State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [participationType, setParticipationType] = useState('in-person');
    const [specialRequests, setSpecialRequests] = useState('');
    
    // UI State
    const [error, setError] = useState({ fullName: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ajaxResponse, setAjaxResponse] = useState(null);

    const [registeredUsers, setRegisteredUsers] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Load users from local storage on page load
    useEffect(() => {
        const savedUsers = getSavedUsers() || [];
        setRegisteredUsers(savedUsers);
    }, []);

    // Filter users based on what is typed in the Full Name field
    const filteredUsers = registeredUsers.filter(user => {
        const full = `${user.firstName} ${user.lastName}`.toLowerCase();
        return full.includes(fullName.toLowerCase());
    });


    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            // Support both 'price' and 'fee' 
            let itemPrice = item.price || item.fee || "Free"; 
            
            if (typeof itemPrice === 'string') {
                if (itemPrice.toLowerCase() === 'free') return total;
                // Strip out the '$' and parse the number
                const numericPrice = parseFloat(itemPrice.replace(/[^0-9.]/g, ''));
                if (!isNaN(numericPrice)) {
                    return total + numericPrice;
                }
            } else if (typeof itemPrice === 'number') {
                return total + itemPrice;
            }
            return total;
        }, 0);
    };

    const totalCost = calculateTotal();

    const validateField = (name, value) => {
        let errorMsg = '';
        if (!value.trim()) {
            return "This field is required.";
        }

        switch(name) {
            case 'fullName':
                if (!/^[A-Za-z\-\s']{2,50}$/.test(value)) errorMsg = '2-50 letters, spaces, apostrophes, or hyphens allowed';
                break;
            case 'email':
                if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) errorMsg = 'Enter a valid email';
                break;
            default:
                break;
        }
        return errorMsg;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'fullName') { 
            setFullName(value);
            setShowSuggestions(value.trim().length > 0);
        }
        if (name === 'email') setEmail(value);

        const errorMsg = validateField(name, value);
        setError(prev => ({ ...prev, [name]: errorMsg }));
    }

    // Auto-fill form when a suggestion is clicked
    const handleSuggestionClick = (user) => {
        setFullName(`${user.firstName} ${user.lastName}`);
        setEmail(user.email);
        setShowSuggestions(false);
        
        // Clear any validation errors since we know this data is good
        setError(prev => ({ ...prev, fullName: '', email: '' }));
    };

    const getInputClass = (fieldName, value) => {
        if (error[fieldName]) return "form-control is-invalid";
        if (value && !error[fieldName]) return "form-control is-valid";
        return "form-control";
    };

    // If the user gets here with an empty cart, prompt to go back
    if (cart.length === 0 && !ajaxResponse) {
        return (
            <div className="container my-5 text-center">
                <h2>Your schedule is empty!</h2>
                <p>Please select some sessions before finalizing your registration.</p>
                <Link to="/cart" className="btn btn-primary mt-3">Go Back to Cart</Link>
            </div>
        );
    }

    const handleCheckout = async (e) => {
        e.preventDefault();

        let formErrors = {};
        let isValid = true;

        const nameError = validateField('fullName', fullName);
        const emailError = validateField('email', email);

        if (nameError) {
            formErrors.fullName = nameError;
            isValid = false;
        }

        if (emailError) {
            formErrors.email = emailError;
            isValid = false;
        }

        setError(formErrors);
        if (!isValid) return;

        setIsSubmitting(true);
        setAjaxResponse(null);

        const payloadData = {
            name: fullName.trim(),
            email: email.trim(),
            participationType: participationType,
            specialRequests: specialRequests.trim(),
            scheduledEvents: cart,
            totalCost: totalCost,
            submissionTime: new Date().toISOString()
        };

        try {
            //L10 change - actual node.js server endpoint instead of mock API
            const response = await fetch('http://localhost:5000/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadData)
            });

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const data = await response.json();
            
            setAjaxResponse({
                type: 'success',
                message: `Success! Registration confirmed for ${fullName}. API Assigned ID: ${data.id}`
            });

            // Clear the cart globally and locally after success
            setCart([]); 
            localStorage.setItem('conference_user_cart', JSON.stringify([])); 

        } catch (error) {
            setAjaxResponse({ type: 'danger', message: `Error connecting to API: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container my-5 pb-5">
            <div className="row justify-content-center g-5">
                
                {/* Left Column: Final Registration Form */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body p-5">
                            <h2 className="fw-bold mb-4">Finalize Registration</h2>
                            
                            {ajaxResponse ? (
                                <div className={`alert alert-${ajaxResponse.type} py-4`}>
                                    <h4 className="alert-heading">{ajaxResponse.type === 'success' ? 'All set!' : 'Oops!'}</h4>
                                    <p className="mb-0">{ajaxResponse.message}</p>
                                    {ajaxResponse.type === 'success' && (
                                        <Link to="/" className="btn btn-success mt-3">Return to Home</Link>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleCheckout} noValidate>
                                    <div className="mb-3 position-relative">
                                        <label className="form-label">Full Name *</label>
                                        <input 
                                            type="text" className={getInputClass('fullName', fullName)}
                                            value={fullName} onChange={handleInputChange} name="fullName"
                                            autoComplete="off"
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                            required 
                                        />
                                        
                                        {/* AUTOCOMPLETE DROPDOWN */}
                                        {showSuggestions && filteredUsers.length > 0 && (
                                            <ul className="list-group position-absolute w-100 shadow-sm mt-1" style={{ zIndex: 1000 }}>
                                                {filteredUsers.map((user, idx) => (
                                                    <li 
                                                        key={idx} 
                                                        className="list-group-item list-group-item-action py-2"
                                                        style={{ cursor: 'pointer' }}
                                                        onMouseDown={() => handleSuggestionClick(user)}
                                                    >
                                                        <strong>{user.firstName} {user.lastName}</strong> <br/>
                                                        <small className="text-muted">{user.email}</small>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {error.fullName && <div className="invalid-feedback">{error.fullName}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Confirmation Email *</label>
                                        <input 
                                            type="email" className={getInputClass('email', email)}
                                            value={email} onChange={handleInputChange} name="email"
                                            required 
                                        />
                                        {error.email && <div className ="invalid-feedback">{error.email}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-bold d-block">Participation Type *</label>
                                        <div className="form-check form-check-inline">
                                            <input className="form-check-input" type="radio" name="participationType" id="inPerson" value="in-person" checked={participationType === 'in-person'} onChange={(e) => setParticipationType(e.target.value)} />
                                            <label className="form-check-label" htmlFor="inPerson">In-Person</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input className="form-check-input" type="radio" name="participationType" id="virtual" value="virtual" checked={participationType === 'virtual'} onChange={(e) => setParticipationType(e.target.value)} />
                                            <label className="form-check-label" htmlFor="virtual">Virtual</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input className="form-check-input" type="radio" name="participationType" id="vip" value="vip" checked={participationType === 'vip'} onChange={(e) => setParticipationType(e.target.value)} />
                                            <label className="form-check-label" htmlFor="vip">VIP (All-Access)</label>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="form-label">Special Accommodations</label>
                                        <textarea 
                                            className="form-control" rows="3" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)}
                                            placeholder="Dietary restrictions, accessibility needs, etc."
                                        ></textarea>
                                    </div>
                                    
                                    <div className="d-flex gap-3">
                                        <button type="button" className="btn btn-outline-secondary flex-grow-1" onClick={() => navigate('/cart')}>
                                            &larr; Back to Cart
                                        </button>
                                        <button type="submit" className="btn btn-primary flex-grow-1" disabled={isSubmitting}>
                                            {isSubmitting ? 'Processing...' : 'Confirm Submission'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Review Order Summary */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 bg-light">
                        <div className="card-body p-4">
                            <h4 className="fw-bold mb-3 text-secondary">Your Session Summary</h4>
                            <p className="text-muted small mb-4">Review your selected events before submitting.</p>
                            
                            <ul className="list-group list-group-flush bg-transparent">
                                {cart.map(item => (
                                    <li key={item.id} className="list-group-item bg-transparent px-0 border-bottom border-secondary-subtle d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="my-0 text-dark fw-bold">{item.title}</h6>
                                            <small className="text-muted">{item.time} | {item.id}</small>
                                        </div>
                                        {/* Show individual event price */}
                                        <span className="text-success fw-semibold">
                                            {item.price === 'Free' || item.fee === 'Free' || !item.price ? 'Free' : (item.price || item.fee)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            
                            {/* Updated Totals Section */}
                            <div className="mt-4 pt-3 border-top border-secondary-subtle">
                                <div className="d-flex justify-content-between mb-2 text-muted">
                                    <strong>Total Sessions:</strong>
                                    <strong>{cart.length}</strong>
                                </div>
                                <div className="d-flex justify-content-between fs-5 text-dark">
                                    <strong>Total Cost:</strong>
                                    <strong className="text-success">
                                        ${totalCost.toFixed(2)}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;