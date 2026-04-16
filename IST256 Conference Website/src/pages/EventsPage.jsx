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
            price: eventForm.fee
        };

        const updatedEvents = [...events, newEvent];
        setEvents(updatedEvents);
        localStorage.setItem('conference_events_catalog', JSON.stringify(updatedEvents));
        
        setFormSuccess('Event added successfully!');
        setEventForm(initialFormState);
        setErrors({});
        
        // This handles showing it in the hero card immediately
        setSelectedEvent(newEvent); 
        
        setTimeout(() => setFormSuccess(''), 3000);
    };

    const handleDeleteEvent = (eventIdToDelete) => {
    // Filter the event out of the array
    const updatedEvents = events.filter(event => event.id !== eventIdToDelete);
    
    //  Update React State 
    setEvents(updatedEvents);
    
    //  Update the storage so the deletion is permanent
    localStorage.setItem('conference_events_catalog', JSON.stringify(updatedEvents));
    
    if (selectedEvent && selectedEvent.id === eventIdToDelete) {
        setSelectedEvent(null);
    }
};

    const getInputClass = (fieldName) => {
        if (errors[fieldName]) return "form-control is-invalid";
        if (eventForm[fieldName] && !errors[fieldName]) return "form-control is-valid";
        return "form-control";
    };

    

    return (
        <div className="container-fluid my-5 pb-5 px-4">
            <div className="row g-4">
                
                {/* Search, Details, and Form */}
                <div className="col-lg-8">
                    {/* Search Section */}
                    <div className="card border-0 shadow-sm bg-light rounded-4 mb-4">
                        <div className="card-body p-4 text-center">
                            <div className="row justify-content-center">
                                <div className="col-12">
                                    <h1 className="display-6 fw-bold text-primary mb-3">Session & Workshop Details</h1>
                                    <p className="text-muted mb-4">
                                        Explore our curated list of events. Use the search below to find specific 
                                        technical workshops, keynote speakers, or networking sessions.
                                    </p>

                                    <div className="position-relative">
                                        <div className="input-group shadow-sm">
                                            <span className="input-group-text bg-white border-end-0">🔍</span>
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

                    {/* Event Details Result in a Hero Card */}
                    {searchError && <div className="alert alert-danger text-center mx-auto mb-4">{searchError}</div>}
                    {selectedEvent && (
                        <div className="mb-4">
                            <EventDetailsCard event={selectedEvent} />
                        </div>
                    )}

                    {/* Add / Edit Form Section */}
                    <div className="card border-0 shadow-sm bg-light rounded-4 overflow-hidden">
                        <div className="card-body p-4">
                            <h3 className="fw-bold text-primary mb-4">Add New Session</h3>
                            {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                            
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Session Title *</label>
                                        <input type="text" id="title" className={getInputClass('title')} value={eventForm.title} onChange={handleChange} required />
                                        {errors.title && <div className="invalid-feedback show">{errors.title}</div>}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Category *</label>
                                        <select id="category" className={errors.category ? "form-select is-invalid" : "form-select"} value={eventForm.category} onChange={handleChange} required>
                                            <option value="">Select Category</option>
                                            <option value="Workshop">Workshop</option>
                                            <option value="Keynote">Keynote</option>
                                            <option value="Panel">Panel</option>
                                        </select>
                                        {errors.category && <div className="invalid-feedback show">{errors.category}</div>}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Time / Duration *</label>
                                        <input type="text" id="time" className={getInputClass('time')} value={eventForm.time} onChange={handleChange} placeholder="e.g., 9:00 AM - 10:30 AM" required />
                                        {errors.time && <div className="invalid-feedback show">{errors.time}</div>}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Registration Fee</label>
                                        <input type="text" id="fee" className={getInputClass('fee')} value={eventForm.fee} onChange={handleChange} placeholder="Enter amount or 'Free'" />
                                        {errors.fee && <div className="invalid-feedback show">{errors.fee}</div>}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Speaker / Host</label>
                                        <input type="text" id="speaker" className="form-control" value={eventForm.speaker} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Location</label>
                                        <input type="text" id="location" className="form-control" value={eventForm.location} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea id="description" className="form-control" rows="2" value={eventForm.description} onChange={handleChange}></textarea>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Seats Available *</label>
                                    <input type="number" id="seatsAvailable" className={getInputClass('seatsAvailable')} value={eventForm.seatsAvailable} onChange={handleChange} min="0" required />
                                    {errors.seatsAvailable && <div className="invalid-feedback show">{errors.seatsAvailable}</div>}
                                </div>

                                <button type="submit" className="btn btn-primary me-2">Add Event</button>
                                <button type="button" className="btn btn-outline-secondary" onClick={() => { setEventForm(initialFormState); setErrors({}); }}>Clear Form</button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* All Events Directory */}
                <div className="col-lg-4">
                    <div className="position-sticky" style={{ top: '2rem' }}>
                        <div className="card border-0 shadow-sm bg-white rounded-4 d-flex flex-column">
                            <div className="card-header bg-primary text-white p-4 border-0 rounded-top-4">
                                <h4 className="mb-0 fw-bold">All Schedule Events</h4>
                                <small>{events.length} sessions available</small>
                            </div>
                        
                        {/* Scrollable List Container */}
                        <div className="card-body p-0 overflow-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                                <div className="list-group list-group-flush">
                                {events.length === 0 ? (
                                    <div className="p-4 text-center text-muted">No events currently scheduled.</div>
                                ) : (
                                    events.map((event) => (
                                        <button 
                                            key={event.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedEvent(event);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className={`list-group-item list-group-item-action p-4 border-bottom ${selectedEvent?.id === event.id ? 'bg-light border-primary border-start border-5' : ''}`}
                                        >
                                            <div className="d-flex w-100 justify-content-between align-items-start mb-2">
                                                <h6 className="mb-0 fw-bold text-dark">{event.title}</h6>
                                                <span className="badge bg-secondary rounded-pill ms-2">{event.id}</span>
                                            </div>
                                            <div className="mb-1 text-muted small">
                                                <i className="bi bi-person-fill me-1"></i> {event.speaker || 'TBA'}
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                <span className={`badge ${event.category === 'Keynote' ? 'bg-warning text-dark' : event.category === 'Workshop' ? 'bg-info text-dark' : 'bg-primary'}`}>
                                                    {event.category}
                                                </span>
                                                <small className="text-muted fw-bold">{event.time}</small>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent  card from being selected when clicking delete
                                                    handleDeleteEvent(event.id);
                                                }}
                                                className="btn btn-sm btn-outline-danger mt-2"
                                            >
                                                Delete Session
                                            </button>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};

export default EventsPage;