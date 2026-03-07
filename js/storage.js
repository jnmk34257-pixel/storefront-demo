const STORAGE_KEY = 'conference_users_list';

function getSavedUsers() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
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