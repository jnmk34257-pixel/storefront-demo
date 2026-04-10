import React, { useState, useEffect } from 'react';

const AdminApproval = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingOrders();
    }, []);

    const fetchPendingOrders = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/submissions');
            if (!response.ok) throw new Error("Failed to fetch orders");
            const data = await response.json();
            // Filter only pending items for the admin dashboard
            const pendingOnly = data.filter(order => order.status === 'pending');
            setPendingOrders(pendingOnly);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/submissions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error("Failed to update status");
            
            // Remove the item from the UI after successful update
            setPendingOrders(prev => prev.filter(order => order.id !== id));
            
        } catch (err) {
            alert(`Error updating order: ${err.message}`);
        }
    };

    return (
        <div className="container my-5">
            <h2 className="mb-4 text-danger fw-bold">Admin Dashboard: Pending Approvals</h2>
            
            {loading ? (
                <p>Loading pending requests...</p>
            ) : pendingOrders.length === 0 ? (
                <div className="alert alert-success">All caught up! No pending registrations to review.</div>
            ) : (
                <div className="table-responsive shadow-sm rounded-3">
                    <table className="table table-hover align-middle mb-0 bg-white">
                        <thead className="table-dark">
                            <tr>
                                <th>Order ID</th>
                                <th>Attendee Details</th>
                                <th>Sessions Registered</th>
                                <th>Date Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingOrders.map(order => (
                                <tr key={order.id}>
                                    <td><strong>{order.id}</strong></td>
                                    <td>
                                        <div>{order.name}</div>
                                        <div className="text-muted small">{order.email}</div>
                                        <span className="badge bg-secondary mt-1 text-capitalize">{order.participationType}</span>
                                    </td>
                                    <td>
                                        <span className="badge bg-primary rounded-pill">
                                            {order.scheduledEvents?.length || 0} items
                                        </span>
                                    </td>
                                    <td className="small text-muted">
                                        {new Date(order.submissionTime).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <button 
                                            className="btn btn-sm btn-success me-2 fw-bold"
                                            onClick={() => handleUpdateStatus(order.id, 'approved')}
                                        >
                                            ✓ Approve
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-outline-danger fw-bold"
                                            onClick={() => handleUpdateStatus(order.id, 'declined')}
                                        >
                                            ✕ Decline
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminApproval;