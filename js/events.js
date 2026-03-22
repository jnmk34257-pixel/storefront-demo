$(document).ready(function() {
    const EVENTS_STORAGE_KEY = 'conference_events_catalog';

    // Fetch the catalog from events.json
    $.getJSON("events.json", function(data) {
        const storedEvents = JSON.parse(localStorage.getItem(EVENTS_STORAGE_KEY)) || [];
        const mergedEvents = [...data];
        storedEvents.forEach(e => {
            if (!mergedEvents.find(me => me.id === e.id)) {
                mergedEvents.push(e);
            }
        });
        
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(mergedEvents)); // <-- use mergedEvents, not data        
        
        setupEventPage();
    }).fail(function() {
        console.error("Could not load events.json. Make sure you are using VS Code Live Server.");
        //If fetch fails but we have old data in storage, use it anyway
        if (localStorage.getItem(EVENTS_STORAGE_KEY)) {
            setupEventPage();
        } else {
            $('#eventErrorMessage').text("Error loading event catalog. Please start a local server.").show();
        }
    });

    // Main function that handles searching and updating the UI
    function setupEventPage() {
    const $searchInput = $('#eventSearch');
    const $suggestionBox = $('#eventSuggestionBox');

    function getEventsFromStorage() {
        const storedCatalog = localStorage.getItem('conference_events_catalog');
        return storedCatalog ? JSON.parse(storedCatalog) : [];
    }

    $searchInput.on('input', function() {
        const query = $(this).val().toLowerCase();
        $suggestionBox.empty().hide();

            if (query.length > 0) {
                const eventsData = getEventsFromStorage();

                const matches = eventsData.filter(event =>
                    event.title.toLowerCase().includes(query) ||
                    event.id.toLowerCase().includes(query)
                );

                if (matches.length > 0) {
                    matches.forEach(match => {
                        $suggestionBox.append(`
                            <li class="list-group-item list-group-item-action suggestion-item" data-id="${match.id}" style="cursor: pointer;">
                                <strong>${match.title}</strong> <span class="badge bg-secondary float-end">${match.id}</span>                                </li>
                        `);
                    });
                    $suggestionBox.show();
                }
            }
        });

            $(document).on('click', '.suggestion-item', function() {
                const selectedId = $(this).data('id');
                const eventsData = getEventsFromStorage();
                const exactMatch = eventsData.find(event => event.id === selectedId);

                if (!exactMatch) return;

                $searchInput.val(exactMatch.title);
                $suggestionBox.hide();
                renderEventDetails(exactMatch);
            });

            $('#searchBtn').click(function() {
                const query = $searchInput.val().trim().toLowerCase();
                if (!query) return;

                const eventsData = getEventsFromStorage();
                console.log(eventsData);
                console.log(query);
                const foundEvent = eventsData.find(event =>
                    event.title.toLowerCase().includes(query) ||
                    event.id.toLowerCase().includes(query)
                );
            
            if (foundEvent) {
                renderEventDetails(foundEvent);
            } else {
                $('#eventDetailsResult').hide();
                $('#eventErrorMessage').text("Event not found. Please try another search.").fadeIn();                
            }
        });
    }

    //validations
    function getOrCreateErrorElement(formField) {
        const fieldId = formField.id;
        const existing = document.getElementById(fieldId + 'Error');
        if (existing) return existing;

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
        } else {
            formField.classList.add('is-invalid');
            formField.classList.remove('is-valid');
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
        }
    }

    function validateField(formField) {
        const value = formField.value.trim();
        const errorElement = getOrCreateErrorElement(formField);
        let isValid = true;
        let errorMessage = "";

        if (formField.hasAttribute('required') && value === '') {
            isValid = false;
            errorMessage = 'This field is required';
        }

        if (isValid && value !== '') {
            if (formField.id === 'eventFee') {
                if (value.toLowerCase() !== 'free' && !/[\d$]/.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter "Free" or a number with $ (e.g., $50)';
                }
            }
        }

        updateField(formField, errorElement, isValid, errorMessage);
        return isValid;
    }

    function validateForm(form) {
        let isValid = true;
        const formInputs = form.querySelectorAll('input:not([type="hidden"]), select');
        formInputs.forEach(field => {
            if (!validateField(field)) isValid = false;
        });
        return isValid;
    }

    //add/edit
    $('#eventForm').on('submit', function(e) {
        e.preventDefault();

        const form = this;
        if (!validateForm(form)) return;

        const events = JSON.parse(localStorage.getItem(EVENTS_STORAGE_KEY)) || [];
        const editIndex = parseInt($('#editIndex').val()) || -1;
        

        let maxNum = 0;

        events.forEach(e => {
            const match = e.id.match(/^EVT-(\d+)$/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNum) {
                    maxNum = num;
                }
            }
        });

        const generatedId = editIndex > -1
            ? events[editIndex].id
            : `EVT-${String(maxNum + 1).padStart(3, '0')}`;


        const eventData = {
            id: generatedId,
            title: $('#eventTitle').val().trim(),
            category: $('#eventCategory').val().trim(),
            speaker: $('#eventSpeaker').val().trim(),
            time: $('#eventTime').val().trim(),
            location: $('#eventLocation').val().trim(),
            description: $('#eventDescription').val().trim(),
            seatsAvailable: parseInt($('#eventSeats').val().trim(), 10),
            price: $('#eventFee').val().trim()
        };

        if (editIndex > -1) {
            events[editIndex] = eventData;
        } else {
            events.push(eventData);
        }

        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));

        form.reset();
        $('#editIndex').val('-1');
        renderEventDetails(eventData);
        $('#eventSearch').val(eventData.title).trigger('input');

        $('#eventErrorMessage')
            .hide()
            .removeClass('text-danger')
            .addClass('text-success')
            .text("Event added successfully!")
            .fadeIn();
    });


    // Update the DOM with the Event Details
    function renderEventDetails(event) {
        
        const $container = $('#eventDetailsResult');
        
        const detailsHtml = `
            <div class="col-md-10 col-lg-8">
                <div class="card shadow border-primary mb-4">
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h4 class="mb-0">Event Details</h4>
                        <span class="badge bg-light text-dark">ID: ${event.id}</span>
                    </div>
                    <div class="card-body p-4">
                        <h2 class="card-title text-primary mb-3">${event.title}</h2>
                        
                        <div class="row mb-4">
                            <div class="col-sm-6 mb-2">
                                <strong><span class="text-muted">Speaker:</span></strong><br> ${event.speaker}
                            </div>
                            <div class="col-sm-6 mb-2">
                                <strong><span class="text-muted">Time:</span></strong><br> ${event.time}
                            </div>
                            <div class="col-sm-6 mb-2">
                                <strong><span class="text-muted">Location:</span></strong><br> ${event.location}
                            </div>
                            <div class="col-sm-6 mb-2">
                                <strong><span class="text-muted">Availability:</span></strong><br> 
                                <span class="badge ${event.seatsAvailable > 20 ? 'bg-success' : 'bg-warning text-dark'}">
                                    ${event.seatsAvailable} Seats Left
                                </span>
                            </div>
                        </div>

                        <div class="p-3 bg-light rounded border">
                            <h5 class="mb-2">Session Description</h5>
                            <p class="card-text mb-0">${event.description}</p>
                        </div>
                        
                        <div class="mt-4 text-center">
                            <a href="signup.html" class="btn btn-success btn-lg px-5">Add to My Schedule</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $container.hide().html(detailsHtml).fadeIn();
    }
});