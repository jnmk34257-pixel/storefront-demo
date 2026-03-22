$(document).ready(function() {
    const EVENTS_STORAGE_KEY = 'conference_events_catalog';

    // Fetch the catalog from events.json
    $.getJSON("events.json", function(data) {
        
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(data));
        
        
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
        // Retrieve the data from Local Storage 
        const storedCatalog = localStorage.getItem(EVENTS_STORAGE_KEY);
        const eventsData = storedCatalog ? JSON.parse(storedCatalog) : [];

        const $searchInput = $('#eventSearch');
        const $suggestionBox = $('#eventSuggestionBox');

        // Auto-Suggestions on input
        $searchInput.on('input', function() {
            const query = $(this).val().toLowerCase();
            $suggestionBox.empty().hide();

            if (query.length > 0) {
                
                const matches = eventsData.filter(event => 
                    event.title.toLowerCase().includes(query) || 
                    event.id.toLowerCase().includes(query)
                );

                if (matches.length > 0) {
                    matches.forEach(match => {
                        $suggestionBox.append(`
                            <li class="list-group-item list-group-item-action suggestion-item" data-id="${match.id}" style="cursor: pointer;">
                                <strong>${match.title}</strong> <span class="badge bg-secondary float-end">${match.id}</span>
                            </li>
                        `);
                    });
                    $suggestionBox.show();
                }
            }
        });

        // clicking a specific auto-suggestion
        $(document).on('click', '.suggestion-item', function() {
            const selectedId = $(this).data('id');
            const exactMatch = eventsData.find(event => event.id === selectedId);
            
            $searchInput.val(exactMatch.title);
            $suggestionBox.hide();
            renderEventDetails(exactMatch);
        });

        // manual search button click
        $('#searchBtn').click(function() {
            const query = $searchInput.val().trim().toLowerCase();
            if (!query) return;

            const foundEvent = eventsData.find(event => 
                event.title.toLowerCase() === query || 
                event.id.toLowerCase() === query
            );

            if (foundEvent) {
                renderEventDetails(foundEvent);
            } else {
                $('#eventDetailsResult').hide();
                $('#eventErrorMessage').text("Event not found. Please try another search.").fadeIn();
            }
        });

        // Hide suggestions if clicking outside the search container
        $(document).click(function(e) {
            if (!$(e.target).closest('#eventSearchContainer').length) {
                $suggestionBox.hide();
            }
        });
    }

    // Update the DOM with the Event Details
    function renderEventDetails(event) {
        $('#eventErrorMessage').hide();
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
