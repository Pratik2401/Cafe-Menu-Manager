import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Switch from 'react-switch';
import { getAllEvents, toggleEventStatus, deleteEvent } from '../../api/admin';
import { useBreadcrumb } from './AdminBreadcrumbContext';

const ManageEventsPage = ({ setActiveSection }) => {
  const { updateBreadcrumb } = useBreadcrumb();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    updateBreadcrumb([
      { label: 'Event Management' },
      { label: 'Manage Events' }
    ]);
    fetchEvents();
  }, [updateBreadcrumb]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getAllEvents();
      setEvents(response.data || []);
      setError('');
    } catch (error) {
      setError('Failed to load events. Please try again.');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (eventId) => {
    try {
      // Find the current event to get its current status
      const currentEvent = events.find(event => event.eventId === eventId);
      const newStatus = !currentEvent.isActive;
      
      // Update UI immediately for better user experience
      setEvents(events.map(event => {
        if (event.eventId === eventId) {
          return { ...event, isActive: newStatus };
        }
        return event;
      }));
      
      // Then make the API call
      await toggleEventStatus(eventId, newStatus);
      setError('');
    } catch (error) {
      // Revert the state change if the API call fails
      setEvents(events.map(event => {
        if (event.eventId === eventId) {
          return { ...event, isActive: !newStatus };
        }
        return event;
      }));
      setError('Failed to update event status. Please try again.');
      console.error('Error toggling event status:', error);
    }
  };

  const handleEdit = (event) => {
    navigate(`/admin/edit-event/${event.eventId}`);
  };
 

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await deleteEvent(eventId);
        setEvents(events.filter(event => event.eventId !== eventId)); // Update state without refetching
        setError('');
      } catch (error) {
        setError('Failed to delete event. Please try again.');
        console.error('Error deleting event:', error);
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
        <h2 className="mb-0">Manage Events</h2>
        <Button 
          style={{ backgroundColor: '#3F61D8', borderColor: '#3F61D8', borderRadius: '30px' }}
          onClick={() => setActiveSection && setActiveSection('create-event')}
        >
          Create New Event
        </Button>
      </div>
      
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
            <Table responsive striped hover className="shadow-sm">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.eventId}>
                    <td>
                      {event.title}
                      {event.isRecurring && (
                        <div>
                          <small className="badge bg-info text-dark ms-2">Recurring</small>
                        </div>
                      )}
                    </td>
                    <td>
                      {event.isRecurring ? (
                        <div>
                          <div><strong>Period:</strong> {formatDate(event.startDate)} - {formatDate(event.endDate)}</div>
                          <small className="text-muted">
                            {event.recurringPattern?.frequency === 'weekly' ? 
                              `Every ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][event.recurringPattern.dayOfWeek]}` :
                              `Monthly on day ${event.recurringPattern?.dayOfMonth}`
                            }
                          </small>
                        </div>
                      ) : (
                        <div>
                          {formatDate(event.startDate)}
                          <br />
                          <small className="text-muted">to {formatDate(event.endDate)}</small>
                        </div>
                      )}
                    </td>
                    <td>{event.location}</td>
                    <td>
                      <span className={`badge ${event.isRecurring ? 'bg-primary' : 'bg-secondary'}`}>
                        {event.isRecurring ? 'Recurring' : 'One-time'}
                      </span>
                    </td>
                    <td>
                      <Switch
                        checked={event.isActive}
                        onChange={() => handleToggleStatus(event.eventId)}
                        onColor="#28a745"
                        offColor="#6c757d"
                        checkedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 12, color: 'white', paddingRight: 2}}>Active</span>}
                        uncheckedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 12, color: 'white', paddingLeft: 2}}>Inactive</span>}
                        width={70}
                        height={30}
                        handleDiameter={24}
                      />
                    </td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleEdit(event)}
                          title="Edit event details"
                        >
                          Edit
                        </Button>
                       

                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(event.eventId)}
                          title="Permanently delete this event"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
      
    </Container>
  );
};

export default ManageEventsPage;