$(document).ready(function() {
    const $searchInput = $('#attendeeSearch');
    const $suggestionBox = $('#suggestionBox');

    $searchInput.on('input', function() {
        const query = $(this).val().toLowerCase();
        $suggestionBox.empty().hide();

        const storedJSON = localStorage.getItem('conference_users_list');
        const users = storedJSON ? JSON.parse(storedJSON) : [];
        if (query.length > 0) { 
            const matches = users.filter(user => user.firstName.toLowerCase().includes(query)
                || user.lastName.toLowerCase().includes(query)
                || user.institution.toLowerCase().includes(query)
            );

           if (matches.length > 0) {
                matches.forEach(match => {
                    $suggestionBox.append(`
                        <li class="list-group-item list-group-item-action suggestion-item" data-email="${match.email}" style="cursor: pointer;">
                            <strong>${match.firstName} ${match.lastName}</strong> <br>
                            <small class="text-muted">${match.institution}</small>
                        </li>
                    `);
                });
                $suggestionBox.show();
            }
            renderFilteredUsers(matches);
        } else { 
            renderFilteredUsers(users);
        }
    });

    $(document).on('click', '.suggestion-item', function() { 
        const selectedEmail = $(this).data('email');
        const storedJSON = localStorage.getItem('conference_users_list');
        const users = storedJSON ? JSON.parse(storedJSON) : [];

        const exactMatch = users.filter(user => user.email === selectedEmail);

        const nameText = $(this).find('strong').text();
        $searchInput.val(nameText);
        $suggestionBox.hide();

        renderFilteredUsers(exactMatch);
    });

     $(document).click(function(e) { 
            if (!$(e.target).closest('#searchContainer').length) {
                $suggestionBox.hide();
            }
    });

    function renderFilteredUsers(filteredUsers) { 
        const $container = $('#userCardContainer');
        $container.empty();
        if (filteredUsers.length === 0) {
            $container.html('<div class="col-12"><p class="text-center text-white mt-4">No attendees match your search.</p></div>');
            return;
        }
        const storedJSON = localStorage.getItem('conference_users_list');
        const allUsers = storedJSON ? JSON.parse(storedJSON) : [];
        filteredUsers.forEach((user) => { 
            const originalIndex = allUsers.findIndex(u => u.email === user.email);
            const cardHtml = `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm border-primary">
                        <div class="card-body">
                            <h5 class="card-title">${user.firstName} ${user.lastName}</h5>
                            <p class="card-text mb-1"><strong>Institution:</strong> ${user.institution}</p>
                            <p class="card-text mb-1"><strong>Email:</strong> ${user.email}</p>
                            <p class="card-text mb-1"><strong>Phone:</strong> ${user.phone}</p>
                            <p class="card-text mb-1"><strong>Age:</strong> ${user.age}</p>
                            <p class="card-text mb-3"><strong>Address:</strong> ${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zip}</p>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-warning" onclick="editUser(${originalIndex})">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteUser(${originalIndex})">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $container.append(cardHtml);
        })
    }
});
