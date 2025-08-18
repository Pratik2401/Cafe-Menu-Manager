import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getAllEvents, deleteEvent } from '../../api/admin';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getAllEvents();
      const eventsData = response?.data || [];
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setError('');
    } catch (err) {
      setError('Failed to load events. Please try again.');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId);
        setDeleteSuccess('Event deleted successfully!');
        fetchEvents(); // Refresh the list
        setTimeout(() => setDeleteSuccess(''), 3000); // Clear success message after 3 seconds
      } catch (err) {
        setError('Failed to delete event. Please try again.');
        console.error('Error deleting event:', err);
      }
    }
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Events Management</h2>
        <Link to="/admin/events/create">
          <Button variant="primary">
            <FaPlus className="me-2" /> Create New Event
          </Button>
        </Link>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {deleteSuccess && <Alert variant="success">{deleteSuccess}</Alert>}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : events.length === 0 ? (
        <Alert variant="info">No events found. Create your first event!</Alert>
      ) : (
        <Table responsive striped hover className="shadow-sm">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Location</th>
              <th>Entry Type</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event._id}>
                <td>{event.title}</td>
                <td>{formatDate(event.startDate)}</td>
                <td>{event.location}</td>
                <td>
                  {event.entryType === 'free' ? 'Free Entry' : 
                   event.entryType === 'cover' ? 'Cover Charge' : 
                   event.entryType === 'ticket' ? 'Entry Fee' : 'N/A'}
                </td>
                <td>
                  {event.entryType !== 'free' ? `₹${Number(event.price || 0).toFixed(2)}` : 'Free'}
                </td>
                <td>
                  <Badge bg={event.isActive ? 'success' : 'secondary'}>
                    {event.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  <Link to={`/admin/events/update/${event.eventId}`} className="btn btn-sm btn-outline-primary me-2">
                    <FaEdit />
                  </Link>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDelete(event.eventId)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default EventsPage;