import React, { useState, useEffect } from 'react';
import { Container, Row, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'react-bootstrap-icons';
import Sidebar from './AdminSideBar';
import Breadcrumb from './AdminBreadcrumb';
import MobileHeader from './AdminMobileHeader';
import EventForm from './AdminEventForm';
import { getEventById } from '../../api/admin';
import '../../styles/AdminDashboard.css';

const EditEventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('manage-events');

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const response = await getEventById(eventId);
      setEventData(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load event data. Please try again.');
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    navigate('/admin/dashboard', { state: { activeSection: 'manage-events' } });
  };

  const handleBack = () => {
    navigate('/admin/dashboard', { state: { activeSection: 'manage-events' } });
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    navigate('/admin/dashboard', { state: { activeSection: section } });
  };

  if (loading) {
    return (
      <Container fluid className="admin-dashboard">
        <MobileHeader active={activeSection} setActive={handleSectionChange} />
        <Row className="flex-nowrap">
          <div className="sidebar-col p-0 d-none d-lg-block">
            <Sidebar active={activeSection} setActive={handleSectionChange} />
          </div>
          <div className="content-col">
            <Breadcrumb />
            <Container className="py-3">
              <Button 
                variant="outline-secondary" 
                onClick={handleBack}
                className="mb-3 d-flex align-items-center"
              >
                <ArrowLeft className="me-2" />
                Back to Manage Events
              </Button>
            </Container>
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading event data...</p>
            </div>
          </div>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="admin-dashboard">
        <MobileHeader active={activeSection} setActive={handleSectionChange} />
        <Row className="flex-nowrap">
          <div className="sidebar-col p-0 d-none d-lg-block">
            <Sidebar active={activeSection} setActive={handleSectionChange} />
          </div>
          <div className="content-col">
            <Breadcrumb />
            <Container className="py-3">
              <Button 
                variant="outline-secondary" 
                onClick={handleBack}
                className="mb-3 d-flex align-items-center"
              >
                <ArrowLeft className="me-2" />
                Back to Manage Events
              </Button>
            </Container>
            <div className="alert alert-danger m-4">
              {error}
            </div>
          </div>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="admin-dashboard">
      <MobileHeader active={activeSection} setActive={handleSectionChange} />
      <Row className="flex-nowrap">
        <div className="sidebar-col p-0 d-none d-lg-block">
          <Sidebar active={activeSection} setActive={handleSectionChange} />
        </div>
        <div className="content-col">
          <Breadcrumb />
          <Container className="py-3">
            <Button 
              variant="outline-secondary" 
              onClick={handleBack}
              className="mb-3 d-flex align-items-center"
            >
              <ArrowLeft className="me-2" />
              Back to Manage Events
            </Button>
          </Container>
          {eventData && (
            <EventForm 
              eventData={eventData} 
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </Row>
    </Container>
  );
};

export default EditEventPage;