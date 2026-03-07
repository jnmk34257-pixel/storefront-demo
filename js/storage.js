const STORAGE_KEY = 'conference_users_list';

function getSavedUsers() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const list = stored ? JSON.parse(stored) : [];

        
        return list.map(user => {
            if (!user.address) {
                user.address = {
                    street: user.street || "",
                    city: user.city || "",
                    state: user.state || "",
                    zip: user.zip || ""
                };
            }
            return user;
        });


    } catch {
        return [];
    }
}

function saveUsersToLocalStorage(users) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return true;
    } catch (error) {
        console.log('Error saving to local storage:', error);
        return false;
    }
}