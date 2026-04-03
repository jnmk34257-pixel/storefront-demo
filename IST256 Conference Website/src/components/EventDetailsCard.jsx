// src/components/EventDetailsCard.js
const EventDetailsCard = ({ event }) => {
    return (
        <div className="row justify-content-center mb-5">
            <div className="col-md-10 col-lg-8">
                <div className="card shadow border-primary">
                    <div className="card-header bg-primary text-white d-flex justify-content-between">
                        <h4 className="mb-0">Event Details</h4>
                        <span className="badge bg-light text-dark">ID: {event.id}</span>
                    </div>
                    <div className="card-body p-4">
                        <h2 className="text-primary mb-3">{event.title}</h2>
                        <div className="row mb-4">
                            <div className="col-sm-6"><strong>Speaker:</strong> {event.speaker}</div>
                            <div className="col-sm-6"><strong>Time:</strong> {event.time}</div>
                        </div>
                        <div className="p-3 bg-light rounded border">
                            <h5>Description</h5>
                            <p>{event.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsCard;