// src/context/EventContext.js
import React, { createContext, useState, useEffect } from 'react';
import defaultEvents from '../data/events.json'; // Import default events

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        // 1. Try to get existing data from localStorage
        const localData = JSON.parse(localStorage.getItem('conference_events_catalog'));
        
        if (!localData) {
            // 2. If localStorage is empty, fetch the default events from your JSON file
            setEvents(defaultEvents);
            localStorage.setItem('conference_events_catalog', JSON.stringify(defaultEvents));
        } else {
            // 3. If data exists in localStorage, use that (it contains your Add/Edit changes)
            setEvents(localData);
        }
        // Load cart from localStorage
        const savedCart = JSON.parse(localStorage.getItem('conference_user_cart')) || [];
        setCart(savedCart);
    }, []);

    const addToCart = (event) => {
        if (!cart.find(item => item.id === event.id)) {
            const newCart = [...cart, event];
            setCart(newCart);
            localStorage.setItem('conference_user_cart', JSON.stringify(newCart));
        } else {
            alert("This session is already in your schedule!");
        }
    };

    const removeFromCart = (id) => {
        const newCart = cart.filter(item => item.id !== id);
        setCart(newCart);
        localStorage.setItem('conference_user_cart', JSON.stringify(newCart));
    };

    return (
        <EventContext.Provider value={{ events, setEvents, cart, setCart, addToCart, removeFromCart }}>
            {children}
        </EventContext.Provider>
    );
};

export default EventContext;