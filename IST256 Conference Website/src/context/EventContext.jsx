// src/context/EventContext.js
import React, { createContext, useState, useEffect } from 'react';

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        // 1. Try to get existing data from localStorage
        const localData = JSON.parse(localStorage.getItem('conference_events_catalog'));
        
        if (!localData) {
            // 2. If localStorage is empty, fetch the default events from your JSON file
            fetch('/events.json')
                .then(res => {
                    if (!res.ok) throw new Error("Could not find events.json");
                    return res.json();
                })
                .then(data => {
                    setEvents(data);
                    // Save it so future refreshes use the local version (with any edits)
                    localStorage.setItem('conference_events_catalog', JSON.stringify(data));
                })
                .catch(err => console.error("Error loading initial events:", err));
        } else {
            // 3. If data exists in localStorage, use that (it contains your Add/Edit changes)
            setEvents(localData);
        }

        // Also load the user's cart/schedule
        const storedCart = JSON.parse(localStorage.getItem('conference_user_cart')) || [];
        setCart(storedCart);
    }, []); 
    // The empty array [] means this only runs ONCE when the app starts.

    // Helper functions to manage the cart
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
        <EventContext.Provider value={{ events, setEvents, cart, addToCart, removeFromCart }}>
            {children}
        </EventContext.Provider>
    );
};

export default EventContext;