import React, { useState, useEffect } from 'react';
import { getSavedUsers, saveUsersToLocalStorage } from '../utils/storage';

const initialFormState = {
    firstName: '', lastName: '', email: '', phone: '',
    age: '', institution: '', street: '', city: '', state: '', zip: ''
};

const SignUp = () => {
    // --- STATE MANAGEMENT ---
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [editIndex, setEditIndex] = useState(-1);
    
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Load initial users
    useEffect(() => {
        setUsers(getSavedUsers());
    }, []);

    // --- VALIDATION LOGIC (From your validation.js) ---
    const validateField = (name, value) => {
        let errorMsg = "";
        if (!value && name !== 'phone') {
            return "This field is required";
        }

        switch(name) {
            case 'firstName':
            case 'lastName':
                if (!/^[A-Za-z\-\s']{2,50}$/.test(value)) errorMsg = '2-50 letters, spaces, apostrophes, or hyphens allowed';
                break;
            case 'email':
                if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) errorMsg = 'Enter a valid email';
                break;
            case 'phone':
                if (value && !/^(\+1\s?)?(\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}$/.test(value)) errorMsg = 'Valid US phone required';
                break;
            case 'age':
                if (!/^(?:[0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-5])$/.test(value)) errorMsg = "Enter a valid age (e.g., 20)";
                break;
            case 'institution':
                if (!/^[A-Za-z0-9\-\s.,&']{2,100}$/.test(value)) errorMsg = "Enter a valid institution name";
                break;
            case 'city':
                if(!/^[a-zA-Z\s-]+$/.test(value)) errorMsg = "Enter a valid city";
                break;
            case 'zip':
                if(!/^\d{5}(?:[-\s]\d{4})?$/.test(value)) errorMsg = "Valid US zip code (e.g., 12345)";
                break;
            default:
                break;
        }
        return errorMsg;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Real-time validation
        const errorMsg = validateField(name, value);
        setErrors({ ...errors, [name]: errorMsg });
    };

    // --- CRUD OPERATIONS ---
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate all fields before submitting
        let formErrors = {};
        let isValid = true;
        Object.keys(formData).forEach(key => {
            const errorMsg = validateField(key, formData[key]);
            if (errorMsg) {
                formErrors[key] = errorMsg;
                isValid = false;
            }
        });
        setErrors(formErrors);

        if (!isValid) return;

        const newUser = {
            ...formData,
            address: { 
                street: formData.street, city: formData.city, 
                state: formData.state, zip: formData.zip 
            },
            creationDate: editIndex > -1 ? users[editIndex].creationDate : new Date().toISOString()
        };

        let updatedList;
        if (editIndex > -1) {
            updatedList = [...users];
            updatedList[editIndex] = newUser;
            alert('User updated successfully!');
        } else {
            updatedList = [...users, newUser];
            alert('You successfully signed up!');
        }

        setUsers(updatedList);
        saveUsersToLocalStorage(updatedList);
        resetForm();
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setErrors({});
        setEditIndex(-1);
    };

    const handleEdit = (index) => {
        const user = users[index];
        setFormData({
            ...user,
            street: user.address.street,
            city: user.address.city,
            state: user.address.state,
            zip: user.address.zip
        });
        setEditIndex(index);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (index) => {
        if (window.confirm("Are you sure you want to remove this user?")) {
            const updatedList = users.filter((_, i) => i !== index);
            setUsers(updatedList);
            saveUsersToLocalStorage(updatedList);
        }
    };

    const handleExport = () => {
        if (users.length === 0) {
            alert('No users to export!');
            return;
        }
        const jsonString = JSON.stringify(users, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = "conference_attendees.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // --- SEARCH LOGIC (From your search.js) ---
    const filteredUsers = users.filter(user => 
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.institution.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSuggestionClick = (email) => {
        const user = users.find(u => u.email === email);
        if (user) {
            setSearchQuery(`${user.firstName} ${user.lastName}`);
            setShowSuggestions(false);
        }
    };

    // --- RENDER HELPERS ---
    const getInputClass = (fieldName) => {
        if (errors[fieldName]) return "form-control is-invalid";
        if (formData[fieldName] && !errors[fieldName]) return "form-control is-valid";
        return "form-control";
    };

    return (
        <div className="container my-5 p-10">
            {/* Form Section */}
            <div className="card p-4 md-4 shadow-sm mb-5">
                <h2 className="text-center mb-4">{editIndex > -1 ? 'Edit Attendee' : 'Sign Up'}</h2>
                <form onSubmit={handleSubmit} className="row g-3" noValidate>
                    
                    <div className="col-md-6">
                        <label className="form-label">First name <strong className="text-danger">*</strong></label>
                        <input type="text" className={getInputClass('firstName')} name="firstName" value={formData.firstName} onChange={handleChange} />
                        {errors.firstName && <div className="invalid-feedback show">{errors.firstName}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Last name <strong className="text-danger">*</strong></label>
                        <input type="text" className={getInputClass('lastName')} name="lastName" value={formData.lastName} onChange={handleChange} />
                        {errors.lastName && <div className="invalid-feedback show">{errors.lastName}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Email <strong className="text-danger">*</strong></label>
                        <input type="email" className={getInputClass('email')} name="email" value={formData.email} onChange={handleChange} />
                        {errors.email && <div className="invalid-feedback show">{errors.email}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Phone</label>
                        <input type="tel" className={getInputClass('phone')} name="phone" value={formData.phone} onChange={handleChange} />
                        {errors.phone && <div className="invalid-feedback show">{errors.phone}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Age <strong className="text-danger">*</strong></label>
                        <input type="number" className={getInputClass('age')} name="age" value={formData.age} onChange={handleChange} />
                        {errors.age && <div className="invalid-feedback show">{errors.age}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Institution <strong className="text-danger">*</strong></label>
                        <input type="text" className={getInputClass('institution')} name="institution" value={formData.institution} onChange={handleChange} />
                        {errors.institution && <div className="invalid-feedback show">{errors.institution}</div>}
                    </div>

                    <div className="col-md-12">
                        <label className="form-label">Street Address <strong className="text-danger">*</strong></label>
                        <input type="text" className={getInputClass('street')} name="street" value={formData.street} onChange={handleChange} />
                        {errors.street && <div className="invalid-feedback show">{errors.street}</div>}
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">City <strong className="text-danger">*</strong></label>
                        <input type="text" className={getInputClass('city')} name="city" value={formData.city} onChange={handleChange} />
                        {errors.city && <div className="invalid-feedback show">{errors.city}</div>}
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">State <strong className="text-danger">*</strong></label>
                        <select className={errors.state ? "form-select is-invalid" : formData.state ? "form-select is-valid" : "form-select"} name="state" value={formData.state} onChange={handleChange}>
                            <option value="">Choose...</option>
                            <option value="FL">Florida</option>
                            <option value="NY">New York</option>
                            <option value="PA">Pennsylvania</option>
                            <option value="TX">Texas</option>
                        </select>
                        {errors.state && <div className="invalid-feedback show">{errors.state}</div>}
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Zip <strong className="text-danger">*</strong></label>
                        <input type="text" className={getInputClass('zip')} name="zip" value={formData.zip} onChange={handleChange} />
                        {errors.zip && <div className="invalid-feedback show">{errors.zip}</div>}
                    </div>

                    <div className="col-12 mt-4">
                        <button className="btn btn-primary me-2" type="submit">
                            {editIndex > -1 ? 'Update Sign Up' : 'Sign Up'}
                        </button>
                        <button className="btn btn-secondary" type="button" onClick={resetForm}>Reset</button>
                    </div>
                </form>
            </div>

            {/* Search and Export Section */}
            <div className="row mt-5 mb-4 align-items-end"> 
                <div className="col-md-4">
                    <h3 className="text-white mb-0">Registered Attendees</h3>
                </div>
                
                <div className="col-md-5 position-relative">
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search attendees by name or institution..." 
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSuggestions(e.target.value.length > 0);
                        }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    />
                    
                    {/* Suggestion Box */}
                    {showSuggestions && filteredUsers.length > 0 && (
                        <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                            {filteredUsers.map(user => (
                                <li 
                                    key={user.email} 
                                    className="list-group-item list-group-item-action" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSuggestionClick(user.email)}
                                >
                                    <strong>{user.firstName} {user.lastName}</strong> <br/>
                                    <small className="text-muted">{user.institution}</small>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="col-md-3 text-end">
                    <button className="btn btn-info" onClick={handleExport}>Export to JSON</button>
                </div>
            </div>

            {/* Attendee Cards Grid */}
            <div className="row g-4 mb-5 pb-5">
                {filteredUsers.length === 0 ? (
                    <div className="col-12"><p className="text-center text-white mt-4">No attendees match your search.</p></div>
                ) : (
                    filteredUsers.map((user) => {
                        // Find the real index in the main users array so Edit/Delete affect the right person
                        const originalIndex = users.findIndex(u => u.email === user.email);
                        
                        return (
                            <div className="col-md-6 col-lg-4" key={user.email}>
                                <div className="card h-100 shadow-sm border-primary">
                                    <div className="card-body">
                                        <h5 className="card-title">{user.firstName} {user.lastName}</h5>
                                        <p className="card-text mb-1"><strong>Institution:</strong> {user.institution}</p>
                                        <p className="card-text mb-1"><strong>Email:</strong> {user.email}</p>
                                        <p className="card-text mb-1"><strong>Phone:</strong> {user.phone}</p>
                                        <p className="card-text mb-1"><strong>Age:</strong> {user.age}</p>
                                        <p className="card-text mb-3">
                                            <strong>Address:</strong> {user.address.street}, {user.address.city}, {user.address.state} {user.address.zip}
                                        </p>
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-sm btn-warning" onClick={() => handleEdit(originalIndex)}>Edit</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(originalIndex)}>Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default SignUp;