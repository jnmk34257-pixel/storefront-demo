// src/pages/SignUp.js
import React, { useState, useEffect } from 'react';
import { getSavedUsers, saveUsersToLocalStorage } from '../utils/storage'; // Logic from your storage.js

const SignUp = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        age: '', institution: '', street: '', city: '', 
        state: '', zip: ''
    });

    useEffect(() => {
        setUsers(getSavedUsers()); // Load initial list from local storage
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newUser = {
            ...formData,
            address: { 
                street: formData.street, 
                city: formData.city, 
                state: formData.state, 
                zip: formData.zip 
            }
        };
        const updatedList = [...users, newUser];
        setUsers(updatedList);
        saveUsersToLocalStorage(updatedList); //
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            firstName: '', lastName: '', email: '', phone: '',
            age: '', institution: '', street: '', city: '', 
            state: '', zip: ''
        });
    };

    return (
        <div className="container my-5">
            <div className="card p-4 shadow-sm">
                <h2 className="text-center mb-4">Sign Up</h2>
                <form onSubmit={handleSubmit} className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">First Name *</label>
                        <input 
                            type="text" name="firstName" className="form-control"
                            value={formData.firstName} onChange={handleChange} required 
                        />
                    </div>
                    {/* Repeat for other fields: lastName, email, etc. */}
                    
                    <div className="col-md-4">
                        <label className="form-label">State *</label>
                        <select name="state" className="form-select" value={formData.state} onChange={handleChange} required>
                            <option value="">Choose...</option>
                            <option value="PA">Pennsylvania</option>
                            <option value="FL">Florida</option> 
                            {/* Map through all states from your signup.html */}
                        </select>
                    </div>

                    <div className="col-12 mt-4">
                        <button className="btn btn-primary me-2" type="submit">Sign Up</button>
                        <button className="btn btn-secondary" type="button" onClick={resetForm}>Reset</button>
                    </div>
                </form>
            </div>

            {/* Render Attendee Cards Below */}
            {/* <AttendeeList users={users} setUsers={setUsers} /> */}
        </div>
    );
};

export default SignUp;