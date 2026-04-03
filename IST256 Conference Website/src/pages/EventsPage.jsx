// src/pages/EventsPage.js
import React, { useState, useEffect, useContext } from 'react';
import { EventContext } from '../context/EventContext';
import EventDetailsCard from '../components/EventDetailsCard';

const EventsPage = () => {
    const { events, setEvents } = useContext(EventContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form State for Add/Edit
    const [eventForm, setEventForm] = useState({
        title: '', category: '', time: '', fee: '', 
        speaker: '', location: '', description: '', seats: 0
    });

    // Handle Search Logic (Replaces setupEventPage in events.js)
    const handleSearch = () => {
        const found = events.find(e => 
            e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            e.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSelectedEvent(found || null);
    };

    // Handle Form Submission (Replaces $('#eventForm').on('submit'))
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Generate ID logic from your original code
        const maxId = events.reduce((max, ev) => {
            const num = parseInt(ev.id.split('-')[1]);
            return num > max ? num : max;
        }, 0);
        
        const newEvent = {
            ...eventForm,
            id: `EVT-${String(maxId + 1).padStart(3, '0')}`,
            seatsAvailable: parseInt(eventForm.seats)
        };

        const updatedEvents = [...events, newEvent];
        setEvents(updatedEvents);
        localStorage.setItem('conference_events_catalog', JSON.stringify(updatedEvents));
        
        setShowSuccess(true);
        setEventForm({ title: '', category: '', time: '', fee: '', speaker: '', location: '', description: '', seats: 0 });
    };

    return (
        <div className="container my-5">
            {/* Search Section */}
            <div className="card border-0 shadow-sm bg-light rounded-4 p-5 mb-5 text-center">
                <h1 className="display-5 fw-bold text-primary">Session & Workshop Details</h1>
                <div className="input-group input-group-lg mt-4">
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search events by title or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={handleSearch}>Find Event</button>
                </div>
            </div>

            {/* Event Display Result */}
            {selectedEvent && <EventDetailsCard event={selectedEvent} />}

            {/* Add/Edit Form Section */}
            <div className="card border-0 shadow-sm bg-light rounded-4 p-5">
                <h2 className="fw-bold text-primary mb-4">Add / Edit Sessions</h2>
                {showSuccess && <div className="alert alert-success">Event added successfully!</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Session Title *</label>
                        <input 
                            type="text" className="form-control" required
                            value={eventForm.title}
                            onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                        />
                    </div>
                    {/* Add other inputs (Category, Time, Fee, etc.) similar to above */}
                    
                    <button type="submit" className="btn btn-primary">Add Event</button>
                </form>
            </div>
        </div>
    );
};

export default EventsPage;