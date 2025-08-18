import React, { useState, useEffect } from 'react';
import { Container, Form, Spinner, Alert, Card } from 'react-bootstrap';
import { getAllEvents } from '../../api/admin';
import { useBreadcrumb } from './BreadcrumbContext';

const EventRegistrationsPage = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    updateBreadcrumb([
      { label: 'Event Management' },
      { label: 'Event Registrations' }
    ]);
    fetchEvents();
  }, [updateBreadcrumb]);

  useEffect(() => {
    if (selectedEventId && events.length > 0) {
      // Find the selected event from the events array
      const selectedEvent = events.find(event => event.eventId === selectedEventId);
      setEventDetails(selectedEvent || null);
    }
  }, [selectedEventId, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getAllEvents();
      setEvents(response.data || []);
      
      // Auto-select the first event if available
      if (response.data && response.data.length > 0) {
        setSelectedEventId(response.data[0].eventId);
      }
      
      setError('');
    } catch (error) {
      setError('Failed to load events. Please try again.');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (e) => {
    setSelectedEventId(e.target.value);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Events</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          {events.length === 0 ? (
            <Alert variant="info">No events found. Create your first event!</Alert>
          ) : (
            <>
              <Form.Group className="mb-4">
                <Form.Label>Select Event</Form.Label>
                <Form.Select 
                  value={selectedEventId} 
                  onChange={handleEventChange}
                >
                  {events.map(event => (
                    <option key={event.eventId} value={event.eventId}>
                      {event.title} - {formatDate(event.startDate)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {eventDetails && (
                <Card className="mb-4 shadow-sm">
                  <Card.Body>
                    <Card.Title>{eventDetails.title}</Card.Title>
                    <Card.Text>
                      <strong>Date:</strong> {formatDate(eventDetails.startDate)} to {formatDate(eventDetails.endDate)}<br />
                      <strong>Attendees:</strong> {eventDetails.currentAttendees}/{eventDetails.maxAttendees}
                    </Card.Text>
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default EventRegistrationsPage;