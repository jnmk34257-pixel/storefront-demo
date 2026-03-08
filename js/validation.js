// --- Validation Logic ---
function getOrCreateErrorElement(formField) {
    const fieldId = formField.id;
    const existing = document.getElementById(fieldId + 'Error');

    if (existing) {
        return existing;
    }

    const errorElement = document.createElement('div');
    errorElement.id = fieldId + 'Error';
    errorElement.className = 'invalid-feedback show';
    formField.insertAdjacentElement('afterend', errorElement);
    return errorElement;
}

function updateField(formField, errorElement, isValid, errorMessage) {
    if (isValid) {
        formField.classList.add('is-valid');
        formField.classList.remove('is-invalid');
        errorElement.textContent = "";
        errorElement.classList.remove('show');
    }
    else {
        formField.classList.add('is-invalid');
        formField.classList.remove('is-valid');
        errorElement.textContent = errorMessage;
        errorElement.classList.add('show');
    }
}

function validateField(formField) {
    const fieldId = formField.id;
    const value = formField.value.trim();
    if (fieldId === 'editIndex') return true; // Skip hidden field

    const errorElement = getOrCreateErrorElement(formField);
    let isValid = true;
    let errorMessage = "";

    if (formField.hasAttribute('required') && value === ''){
        isValid = false;
        errorMessage = 'This field is required';
    }

    if (isValid && value !== '') {
        switch(fieldId) {
            case 'firstName':
            case 'lastName':
                if (!/^[A-Za-z\-\s']{2,50}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Name must be 2-50 letters and may include spaces, apostrophes, or hyphens';
                }
                break;

            case 'email':
                const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailPattern.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email';
                }
                break;

            case 'phone':
                if (!/^(\+1\s?)?(\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Enter a valid US phone number (e.g., 123-456-7890)';
                }
                break;

            case 'age':
                if (!/^(?:[0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-5])$/.test(value)){
                    isValid = false;
                    errorMessage = "Enter a valid age (e.g., 20)";
                }
                break;

            case 'institution':
                if (!/^[A-Za-z0-9\-\s.,&']{2,100}$/.test(value)) {
                    isValid = false;
                    errorMessage = "Enter a valid institution name";
                }
                break;
            
            case 'city':
                if(!/^[a-zA-Z\s-]+$/.test(value)){
                    isValid = false;
                    errorMessage = "Enter a valid city";
                }
                break;

            case 'zip':
                if(!/^\d{5}(?:[-\s]\d{4})?$/.test(value)){
                    isValid = false;
                    errorMessage = "Please enter a valid US zip code (e.g., 12345)";
                }
                break;
        }
    }

    updateField(formField, errorElement, isValid, errorMessage);
    return isValid;
}

function validateForm(form) {
    let isValid = true;
    // Don't validate the hidden input
    const formInputs = form.querySelectorAll('input:not([type="hidden"]), select');
    
    formInputs.forEach(formField => {
        if (!validateField(formField)) {
            isValid = false;
        }
    });

    return isValid;
}

function getFormData(form) {
    const formData = new FormData(form);
    const data = {};

    for(let [key, value] of formData.entries()) {
        data[key] = value;
    }

    return {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        age: data.age,
        institution: data.institution,
        address: {
            street: data.street,
            city: data.city,
            state: data.state,
            zip: data.zip
        },
        creationDate: new Date().toISOString()
    };
}

// --- UI Display and Create,Update,Delete functions ---
function renderUsers() {
    const users = getSavedUsers(); //storage.js
    const container = document.getElementById('userCardContainer');
    if (!container) return;

    container.innerHTML = ''; // Clear existing cards

    users.forEach((user, index) => {
        const cardHtml = `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${user.firstName} ${user.lastName}</h5>
                        <p class="card-text mb-1"><strong>Institution:</strong> ${user.institution}</p>
                        <p class="card-text mb-1"><strong>Email:</strong> ${user.email}</p>
                        <p class="card-text mb-1"><strong>Phone:</strong> ${user.phone}</p>
                        <p class="card-text mb-1"><strong>Age:</strong> ${user.age}</p>
                        <p class="card-text mb-3"><strong>Address:</strong> ${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zip}</p>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-warning" onclick="editUser(${index})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteUser(${index})">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHtml;
    });
}

window.editUser = function(index) {
    const users = getSavedUsers();
    const user = users[index];

    // Populate all text inputs
    document.getElementById('firstName').value = user.firstName;
    document.getElementById('lastName').value = user.lastName;
    document.getElementById('email').value = user.email;
    document.getElementById('phone').value = user.phone;
    document.getElementById('age').value = user.age;
    document.getElementById('institution').value = user.institution;
    document.getElementById('street').value = user.address.street;
    document.getElementById('city').value = user.address.city;
    document.getElementById('state').value = user.address.state;
    document.getElementById('zip').value = user.address.zip; 
    
    document.getElementById('editIndex').value = index;
    document.getElementById('submitBtn').textContent = 'Update Sign Up';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteUser = function(index) {
    if (confirm("Are you sure you want to remove this user?")) {
        const users = getSavedUsers();
        users.splice(index, 1); 
        saveUsersToLocalStorage(users); //in storage.js
        renderUsers(); 
    }
};

window.resetForm = function() {
    const form = document.getElementById('signupForm');
    form.reset();
    document.getElementById('editIndex').value = "-1";
    document.getElementById('submitBtn').textContent = 'Sign Up';
    
    // Clear validation styling
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.classList.remove('is-valid', 'is-invalid');
        const errorMsg = document.getElementById(input.id + 'Error');
        if (errorMsg) errorMsg.classList.remove('show');
    });
};

function handleSignupSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    if(!validateForm(form)) {
        return;
    }

    const formData = getFormData(form);
    const users = getSavedUsers();
    const editIndex = parseInt(document.getElementById('editIndex').value);

    // If editIndex is greater than -1, we are updating. Otherwise, adding new.
    if (editIndex > -1) {
        formData.creationDate = users[editIndex].creationDate; // Preserve original signup date
        users[editIndex] = formData;
        window.alert('User updated successfully!');
    } else {
        users.push(formData);
        window.alert('You successfully signed up!');
    }

    if(saveUsersToLocalStorage(users)) {
        window.resetForm();
        renderUsers();
    } else {
        window.alert('Sign up failed!!');
    }
}

window.exportToJsonFile = function() {
    const users = getSavedUsers();

    if (users.length === 0) {
        window.alert('No users to export!');
        return;
    }

    const jsonString = JSON.stringify(users, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = "conference_attendees.json";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}

function initializeApp() {
    const signupForm = document.getElementById('signupForm') || document.querySelector('form.needs-validation');

    if (!signupForm) {
        return;
    }

    signupForm.addEventListener('submit', handleSignupSubmit);

    const formInputs = signupForm.querySelectorAll('input:not([type="hidden"]), select');
    formInputs.forEach(formField => {
        formField.addEventListener('blur', () => validateField(formField));
        formField.addEventListener('input', () => {
            if (formField.classList.contains('is-invalid')) {
                validateField(formField);
            }
        });
    });

    // Render users immediately when the page loads
    renderUsers();
}

document.addEventListener('DOMContentLoaded', initializeApp);