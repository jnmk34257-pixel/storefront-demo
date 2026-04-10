import React, { useState, useEffect } from 'react';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try { 
            const response = await fetch('http://localhost:5000/api/submissions');
            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="badge bg-warning text-dark">Pending</span>;
            case 'approved': return <span className="badge bg-success">Approved</span>;
            case 'declined': return <span className="badge bg-danger">Declined</span>;
            default: return <span className="badge bg-secondary">{status}</span>;
        }
    };

    return (
        <div className="container my-5">
            <div className="card border-0 shadow-sm rounded-4 mb-5">
                <div className="card-body p-4 d-flex align-items-center">
                    <div>
                        <h2 className="text-primary fw-bold mb-0">My Order History</h2>
                        <span className="text-muted small">View the status of your past and current session registrations.</span>
                    </div>
                </div>
            </div>
            
            {loading && <p>Loading your orders...</p>}
            {error && <div className="alert alert-danger">{error}</div>}
            
            {!loading && !error && orders.length === 0 ? (
                <div className="alert alert-info">No previous orders found.</div>
            ) : (
                <div className="row g-4">
                    {orders.map(order => (
                        <div className="col-md-6" key={order.id}>
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-header bg-white d-flex justify-content-between align-items-center border-bottom-0 pt-3">
                                    <strong>Order ID: {order.id}</strong>
                                    {getStatusBadge(order.status)}
                                </div>
                                <div className="card-body">
                                    <p className="mb-1"><strong>Name:</strong> {order.name}</p>
                                    <p className="mb-1"><strong>Email:</strong> {order.email}</p>
                                    <p className="mb-3"><strong>Type:</strong> <span className="text-capitalize">{order.participationType}</span></p>
                                    
                                    <h6 className="text-muted mb-2">Registered Sessions:</h6>
                                    <ul className="list-group list-group-flush mb-0">
                                        {order.scheduledEvents?.map(event => (
                                            <li key={event.id} className="list-group-item px-0 py-1 border-0 small">
                                                • {event.title} ({event.id})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="card-footer bg-light text-muted small">
                                    Submitted: {new Date(order.submissionTime).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;