const STORAGE_KEY = 'storefront_user';

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

            case 'street':
                if (value.length < 5 || value.length > 100) {
                    isValid = false;
                    errorMessage = 'Street address must be between 5 and 100 characters';
                }
                break;

            case 'city':
                if (!/^[A-Za-z\-\s.']{2,50}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Enter a valid city name';
                }
                break;

            case 'state':
                if (!/^[A-Z]{2}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Please select a valid 2-letter state code';
                }
                break;

            case 'zip':
                if (!/^\d{5}(-\d{4})?$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Enter a valid ZIP code (12345 or 12345-6789)';
                }
                break;
        }
    }

    updateField(formField, errorElement, isValid, errorMessage);

    return isValid;
}

function validateForm(form) {
    // const form = document.getElementById("signupForm");
    let isValid = true;

    const formInputs = form.querySelectorAll('input, select');
    
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
        address: {
            street: data.street,
            city: data.city,
            state: data.state,
            zip: data.zip
        },
        creationDate: new Date().toISOString()
    };
}

function savaFormDataToLocalStorage(formData) {
    try {
        const userJSON = JSON.stringify(formData);
        localStorage.setItem(STORAGE_KEY, userJSON);
        console.log('Saved successfully!');
        return true;
    }
    catch (error) {
        console.log('Error saving to local storage:', error);
        return false;
    }
    
}

function displayUserCard(userData) {
    const userCardContainer = document.getElementById('userCard');
    if (!userCardContainer) {
        return;
    }

    let cardHtml = `
        <div class="card">
            <div>
                <h5>${userData.firstName} ${userData.lastName}</h5>
                <p class="card-text">Email: ${userData.email}</p>
                <p class="card-text">Address: ${userData.address.street}, ${userData.address.city}, ${userData.address.state} ${userData.address.zip}</p>
                <button class="btn btn-danger">Delete User</button>
            </div>
        </div>
    `;

    userCardContainer.innerHTML = cardHtml;
}

function handleSignupSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    if(!validateForm(form)) {
        // window.alert('Form is not valid');
        return;
    }

    const formData = getFormData(form);

    if(savaFormDataToLocalStorage(formData)) {
        window.alert('You successfully signed up!');
    }
    else {
        window.alert('Sign up failed!!');
    }

    displayUserCard(formData);
}

function initilizeApp() {
    const signupForm = document.getElementById('signupForm') || document.querySelector('form.needs-validation');

    if (!signupForm) {
        return;
    }

    signupForm.addEventListener('submit', handleSignupSubmit);

    const formInputs = signupForm.querySelectorAll('input, select');
    formInputs.forEach(formField => {
        formField.addEventListener('blur', () => validateField(formField));
        formField.addEventListener('input', () => {
            if (formField.classList.contains('is-invalid')) {
                validateField(formField);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initilizeApp);