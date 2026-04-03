// src/components/AttendeeList.js
const AttendeeList = ({ users, setUsers }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.institution.toLowerCase().includes(searchTerm.toLowerCase())
    ); // Replaces search.js filtering logic

    const deleteUser = (email) => {
        const updated = users.filter(u => u.email !== email);
        setUsers(updated);
        localStorage.setItem('conference_users_list', JSON.stringify(updated));
    };

    return (
        <div className="mt-5">
            <h3 className="text-white mb-3">Registered Attendees</h3>
            <input 
                type="text" className="form-control mb-4" 
                placeholder="Search attendees..." 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
            
            <div className="row g-4">
                {filteredUsers.map((user, index) => (
                    <div className="col-md-4" key={user.email}>
                        <div className="card h-100 shadow-sm border-primary">
                            <div className="card-body">
                                <h5>{user.firstName} {user.lastName}</h5>
                                <p className="mb-1"><strong>Institution:</strong> {user.institution}</p>
                                <p className="mb-1"><strong>Email:</strong> {user.email}</p>
                                <button 
                                    className="btn btn-sm btn-danger mt-2" 
                                    onClick={() => deleteUser(user.email)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};