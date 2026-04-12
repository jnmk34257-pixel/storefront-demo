// src/pages/EventsPage.jsx
import React, { useState, useContext } from 'react';
import { EventContext } from '../context/EventContext';
import EventDetailsCard from '../components/EventDetailsCard';

const initialFormState = {
    title: '', category: '', time: '', fee: '', 
    speaker: '', location: '', description: '', seatsAvailable: ''
};

const EventsPage = () => {
    const { events, setEvents } = useContext(EventContext);
    
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [searchError, setSearchError] = useState('');

    // Form State
    const [eventForm, setEventForm] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [formSuccess, setFormSuccess] = useState('');

    // --- SEARCH & SUGGESTION LOGIC ---
    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        event.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearchInput = (e) => {
        setSearchQuery(e.target.value);
        setShowSuggestions(e.target.value.length > 0);
        setSearchError('');
    };

    const handleSuggestionClick = (id) => {
        const exactMatch = events.find(e => e.id === id);
        if (exactMatch) {
            setSearchQuery(exactMatch.title);
            setShowSuggestions(false);
            setSelectedEvent(exactMatch);
            setSearchError('');
        }
    };

    const handleSearchBtnClick = () => {
        if (!searchQuery.trim()) return;
        
        const foundEvent = events.find(event => 
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            event.id.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (foundEvent) {
            setSelectedEvent(foundEvent);
            setSearchError('');
            setShowSuggestions(false);
        } else {
            setSelectedEvent(null);
            setSearchError("Event not found. Please try another search.");
        }
    };

    // --- FORM VALIDATION & SUBMISSION ---
    const validateField = (name, value) => {
        let errorMsg = "";
        if (['title', 'category', 'time', 'seatsAvailable'].includes(name) && !value) {
            return "This field is required";
        }

        if (name === 'fee' && value) {
            if (value.toLowerCase() !== 'free' && !/[\d$]/.test(value)) {
                errorMsg = 'Please enter "Free" or a number with $ (e.g., $50)';
            }
        }
        return errorMsg;
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setEventForm({ ...eventForm, [id]: value });
        setErrors({ ...errors, [id]: validateField(id, value) });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate all fields
        let formErrors = {};
        let isValid = true;
        Object.keys(eventForm).forEach(key => {
            const errorMsg = validateField(key, eventForm[key]);
            if (errorMsg) {
                formErrors[key] = errorMsg;
                isValid = false;
            }
        });
        setErrors(formErrors);

        if (!isValid) return;

        // Generate next ID (EVT-XXX)
        const maxIdNum = events.reduce((max, ev) => {
            const match = ev.id.match(/^EVT-(\d+)$/);
            if (match) {
                const num = parseInt(match[1], 10);
                return num > max ? num : max;
            }
            return max;
        }, 0);
        
        const newEvent = {
            ...eventForm,
            id: `EVT-${String(maxIdNum + 1).padStart(3, '0')}`,
            seatsAvailable: parseInt(eventForm.seatsAvailable, 10),
            price: eventForm.fee // Mapping fee back to price
        };

        const updatedEvents = [...events, newEvent];
        setEvents(updatedEvents);
        localStorage.setItem('conference_events_catalog', JSON.stringify(updatedEvents));
        
        setFormSuccess('Event added successfully!');
        setEventForm(initialFormState);
        setErrors({});
        setSelectedEvent(newEvent); // Automatically show the new event
        
        // Clear success message after 3 seconds
        setTimeout(() => setFormSuccess(''), 3000);
    };

    const getInputClass = (fieldName) => {
        if (errors[fieldName]) return "form-control is-invalid";
        if (eventForm[fieldName] && !errors[fieldName]) return "form-control is-valid";
        return "form-control";
    };

    return (
        <div className="container my-5 pb-5">
            {/* Search Section */}
            <div className="card border-0 shadow-sm bg-light rounded-4 overflow-hidden mb-5">
                <div className="card-body p-5 text-center">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <h1 className="display-5 fw-bold text-primary mb-3">Session & Workshop Details</h1>
                            <p className="lead text-muted mb-4">
                                Explore our curated list of events. Use the search below to find specific 
                                technical workshops, keynote speakers, or networking sessions.
                            </p>

                            <div className="position-relative">
                                <div className="input-group input-group-lg shadow-sm">
                                    <span className="input-group-text bg-white border-end-0">
                                        🔍
                                    </span>
                                    <input 
                                        type="text" 
                                        className="form-control border-start-0 ps-0" 
                                        placeholder="Search events by title or ID (e.g., EVT-001)..."
                                        value={searchQuery}
                                        onChange={handleSearchInput}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    />
                                    <button className="btn btn-primary px-4" onClick={handleSearchBtnClick}>Find Event</button>
                                </div>
                                
                                {/* Suggestion Box */}
                                {showSuggestions && filteredEvents.length > 0 && (
                                    <ul className="list-group position-absolute w-100 shadow text-start" style={{ zIndex: 1000, top: '100%' }}>
                                        {filteredEvents.map(event => (
                                            <li 
                                                key={event.id} 
                                                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleSuggestionClick(event.id)}
                                            >
                                                <strong>{event.title}</strong>
                                                <span className="badge bg-secondary">{event.id}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Details Result */}
            {searchError && <div className="alert alert-danger text-center mx-auto mb-5" style={{ maxWidth: '600px' }}>{searchError}</div>}
            {selectedEvent && <EventDetailsCard event={selectedEvent} />}

            {/* Add / Edit Form Section */}
            <div className="card border-0 shadow-sm bg-light rounded-4 overflow-hidden mb-5">
                <div className="card-body p-5">
                    <h2 className="fw-bold text-primary mb-4">Add / Edit Sessions</h2>
                    {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                    
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="mb-3">
                            <label className="form-label">Session Title *</label>
                            <input type="text" id="title" className={getInputClass('title')} value={eventForm.title} onChange={handleChange} required />
                            {errors.title && <div className="invalid-feedback show">{errors.title}</div>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Category *</label>
                            <select id="category" className={errors.category ? "form-select is-invalid" : "form-select"} value={eventForm.category} onChange={handleChange} required>
                                <option value="">Select Category</option>
                                <option value="Workshop">Workshop</option>
                                <option value="Keynote">Keynote</option>
                                <option value="Panel">Panel</option>
                            </select>
                            {errors.category && <div className="invalid-feedback show">{errors.category}</div>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Time / Duration *</label>
                            <input type="text" id="time" className={getInputClass('time')} value={eventForm.time} onChange={handleChange} placeholder="e.g., 9:00 AM - 10:30 AM" required />
                            {errors.time && <div className="invalid-feedback show">{errors.time}</div>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Registration Fee</label>
                            <input type="text" id="fee" className={getInputClass('fee')} value={eventForm.fee} onChange={handleChange} placeholder="Enter amount or 'Free'" />
                            {errors.fee && <div className="invalid-feedback show">{errors.fee}</div>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Speaker / Host</label>
                            <input type="text" id="speaker" className="form-control" value={eventForm.speaker} onChange={handleChange} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Location</label>
                            <input type="text" id="location" className="form-control" value={eventForm.location} onChange={handleChange} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea id="description" className="form-control" rows="3" value={eventForm.description} onChange={handleChange}></textarea>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Seats Available *</label>
                            <input type="number" id="seatsAvailable" className={getInputClass('seatsAvailable')} value={eventForm.seatsAvailable} onChange={handleChange} min="0" required />
                            {errors.seatsAvailable && <div className="invalid-feedback show">{errors.seatsAvailable}</div>}
                        </div>

                        <button type="submit" className="btn btn-primary me-2">Add Event</button>
                        <button type="button" className="btn btn-secondary" onClick={() => { setEventForm(initialFormState); setErrors({}); }}>Reset</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EventsPage;