import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Row, Col } from 'react-bootstrap';
import { useParams, useLocation } from 'react-router-dom';
import { getEventById } from '../../api/customer';
import '../../styles/EventDetails.css';

const EventDetails = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Check if event data was passed via location state
        if (location.state && location.state.event) {
          setEvent(location.state.event);
          // console.log(location.state.event)
          setLoading(false);
          return;
        }

        // Otherwise fetch event by ID
        if (eventId) {
          const response = await getEventById(eventId);
          // console.log(response.data)
          setEvent(response.data || response);
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, location.state]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <Container className="py-5 text-center">Loading event details...</Container>;
  }

  if (!event) {
    return <Container className="py-5 text-center">Event not found</Container>;
  }

  return (
    <Container className="py-4">
      <Card className="event-details-card shadow">
        <Card.Header as="h3" className="bg-primary text-white py-3">
          {event.title}
        </Card.Header>
        <Card.Body className="p-4">
          {(event.eventImageUrl || event.imageUrl) && (
            <div className="event-image-container mb-4">
              <img 
                src={event.eventImageUrl || event.imageUrl} 
                alt={event.title} 
                className="event-image"
              />
            </div>
          )}
          
          <div className="event-meta mb-4">
            <div className="event-meta-item">
              <strong>Date & Time:</strong> {formatDate(event.startDate)}
            </div>
            <div className="event-meta-item">
              <strong>Location:</strong> {event.location}
            </div>
            <div className="event-meta-item">
              <strong>Entry:</strong> {
                event.entryType === 'free' ? 'Free Entry' :
                event.entryType === 'cover' ? `Cover Charge: ₹${Number(event.price || 0).toFixed(2)}` :
                event.entryType === 'ticket' ? `Entry Fee: ₹${Number(event.price || 0).toFixed(2)}` :
                event.price ? `₹${Number(event.price).toFixed(2)}` : 'Free Entry'
              }
            </div>
            {event.maxAttendees && (
              <div className="event-meta-item">
                <strong>Max Attendees:</strong> {event.maxAttendees}
              </div>
            )}
            {event.isRecurring && (
              <div className="event-meta-item">
                <strong>Recurring:</strong> {event.recurringPattern?.frequency === 'weekly' ? 
                  `Every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][event.recurringPattern.dayOfWeek]}` :
                  `Monthly on day ${event.recurringPattern?.dayOfMonth}`
                }
                {event.recurringPattern?.endRecurrence && (
                  <span> until {formatDate(event.recurringPattern.endRecurrence)}</span>
                )}
              </div>
            )}
          </div>
          
          <p className="event-description mb-4">{event.description}</p>
          
          {event.tags && event.tags.length > 0 && (
            <div className="event-tags mb-4">
              {event.tags.map((tag, index) => (
                <Badge bg="secondary" key={index} className="me-1">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {event.offers && event.offers.length > 0 && (
            <div className="event-offers mb-4">
              <h5>Available Offers</h5>
              <Row xs={1} md={2} className="g-3">
                {event.offers.map((offer, index) => (
                  <Col key={index}>
                    <Card className="offer-card">
                      {offer.imageUrl && (
                        <Card.Img 
                          variant="top"
                          src={offer.imageUrl} 
                          alt={offer.name} 
                          style={{ height: '120px', objectFit: 'cover' }}
                        />
                      )}
                      <Card.Footer className="text-center">
                        <div className="offer-name fw-bold">{offer.name}</div>
                        {offer.items && offer.items.length > 0 && (
                          <div className="offer-items small text-muted mb-1">
                            {offer.items.map((item, i) => (
                              <div key={i}>
                                {item.name || `Item ${i+1}`}
                                {item.quantity > 1 && ` x${item.quantity}`}
                              </div>
                            ))}
                          </div>
                        )}
                        <span className="offer-price-value">₹{Number(offer.offerPrice).toFixed(2)}</span>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
          
          {event.registrationFormUrl && (
            <div className="event-registration mb-4 text-center">
              <h5 className="mb-3">Event Registration</h5>
              <a 
                href={event.registrationFormUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
              >
                Register for Event
              </a>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EventDetails;