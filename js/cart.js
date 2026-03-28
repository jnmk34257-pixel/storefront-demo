$(document).ready(function() {
    const EVENTS_STORAGE_KEY = 'conference_events_catalog';
    const CART_STORAGE_KEY = 'conference_user_cart';

    // Load data from LocalStorage
    let catalog = JSON.parse(localStorage.getItem(EVENTS_STORAGE_KEY)) || [];
    let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];

    // Initialize Page
    renderCatalog(catalog);
    renderCart();


    //Product Search with jQuery
    $('#cartSearchInput').on('input', function() {
        const query = $(this).val().toLowerCase();
        
        // Search JSON document collection
        const filteredCatalog = catalog.filter(event => 
            event.title.toLowerCase().includes(query) || 
            event.speaker.toLowerCase().includes(query)
        );
        renderCatalog(filteredCatalog);
    });

    $('#clearSearchBtn').click(function() {
        $('#cartSearchInput').val('');
        renderCatalog(catalog);
    });

    //---Adding and Removing Items from Cart with jQuery---
    
    // Add to Cart
    $(document).on('click', '.add-to-cart-btn', function() {
        const eventId = $(this).data('id');
        const eventToAdd = catalog.find(e => e.id === eventId);
        
        // Check if already in cart
        if (!cart.some(item => item.id === eventId)) {
            cart.push(eventToAdd);
            saveCart();
            renderCart();
        } else {
            alert("This session is already in your schedule!");
        }
    });

    // Remove from Cart
    $(document).on('click', '.remove-from-cart-btn', function() {
        const eventId = $(this).data('id');
        cart = cart.filter(item => item.id !== eventId);
        saveCart();
        renderCart();
    });

    //UI Rendering Functions
    function renderCatalog(eventsToDisplay) {
        const $container = $('#catalogResults');
        $container.empty();

        if (eventsToDisplay.length === 0) {
            $container.html('<p class="text-muted">No sessions found.</p>');
            return;
        }

        eventsToDisplay.forEach(event => {
            $container.append(`
                <div class="col-md-6">
                    <div class="card h-100 border-primary shadow-sm">
                        <div class="card-body">
                            <h6 class="card-title text-primary">${event.title}</h6>
                            <p class="card-text small mb-1"><strong>Speaker:</strong> ${event.speaker}</p>
                            <p class="card-text small mb-2"><strong>Time:</strong> ${event.time}</p>
                            <button class="btn btn-sm btn-outline-primary add-to-cart-btn w-100" data-id="${event.id}">Add to Schedule</button>
                        </div>
                    </div>
                </div>
            `);
        });
    }

    function renderCart() {
        const $cartList = $('#cartItemsList');
        const $emptyMsg = $('#emptyCartMsg');
        const $checkoutBtn = $('#checkoutBtn');
        
        $cartList.empty();

        if (cart.length === 0) {
            $emptyMsg.show();
            $checkoutBtn.prop('disabled', true);
        } else {
            $emptyMsg.hide();
            $checkoutBtn.prop('disabled', false);
            
            cart.forEach(item => {
                $cartList.append(`
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="my-0">${item.title}</h6>
                            <small class="text-muted">${item.id} | ${item.time}</small>
                        </div>
                        <button class="btn btn-sm btn-danger remove-from-cart-btn" data-id="${item.id}">X</button>
                    </li>
                `);
            });
        }
    }

    function saveCart() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }

    // Form Validation and AJAX Submission
    $('#checkoutForm').on('submit', function(e) {
        e.preventDefault();

        // Field Integrity Check (JavaScript Validation)
        const emailField = $('#attendeeEmail');
        const emailVal = emailField.val().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(emailVal)) {
            emailField.addClass('is-invalid');
            return; // Stop execution if validation fails
        } else {
            emailField.removeClass('is-invalid').addClass('is-valid');
        }

        const payloadData = {
            email: emailVal,
            specialRequests: $('#specialRequests').val().trim(),
            scheduledEvents: cart,
            submissionTime: new Date().toISOString()
        };

        const jsonPayload = JSON.stringify(payloadData);
        
        // UI feedback while loading
        const $btn = $('#checkoutBtn');
        $btn.text('Sending...').prop('disabled', true);

        // AJAX Request to the placeholder API, to be replaced with actual backend endpoint in later lessons
        $.ajax({
            url: 'https://jsonplaceholder.typicode.com/posts', // Placeholder API testing endpoint
            type: 'POST',
            contentType: 'application/json',
            data: jsonPayload,
            success: function(response) {
                // Success
                $('#ajaxResponse')
                    .removeClass('alert-danger')
                    .addClass('alert alert-success')
                    .html(`<strong>Success!</strong> API received your data. <br>Assigned Server ID: ${response.id}`)
                    .slideDown();
                
                // Clear cart after successful submission
                cart = [];
                saveCart();
                renderCart();
                $('#checkoutForm')[0].reset();
                emailField.removeClass('is-valid');
            },
            error: function(xhr, status, error) {
                // Error
                $('#ajaxResponse')
                    .removeClass('alert-success')
                    .addClass('alert alert-danger')
                    .text(`Error: Could not connect to the API. (${error})`)
                    .slideDown();
            },
            complete: function() {
                $btn.text('Submit Schedule');
            }
        });
    });
});