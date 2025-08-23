import React, { useState, useEffect } from 'react';
import { Row, Button } from 'react-bootstrap';
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
      console.log('Fetched event data:', response.data);
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
      <div className="admin-dashboard container-fluid">
        <MobileHeader active={activeSection} setActive={handleSectionChange} />
        <Row className="flex-nowrap">
          <div className="sidebar-col p-0 d-none d-lg-block">
            <Sidebar active={activeSection} setActive={handleSectionChange} />
          </div>
          <div className="">
            <Breadcrumb />
            <div style={{padding: '20px', backgroundColor: 'white'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', padding: '25px 30px', background: 'linear-gradient(135deg, #fff 0%, #f5efe9 100%)', borderRadius: '12px', boxShadow: '0 2px 10px rgba(225,55,64,0.15)', border: '1px solid rgba(225,55,64,0.2)'}}>
                <div style={{flex: 1}}>
                  <h1 style={{color: '#e13740', margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', lineHeight: '1.2'}}>Edit Event</h1>
                  <p style={{color: '#8b5a3c', margin: 0, fontSize: '16px', fontWeight: '400', lineHeight: '1.4'}}>Update event details and configuration</p>
                </div>
                <Button 
                  variant="outline-secondary" 
                  onClick={handleBack}
                  style={{padding: '12px 24px', border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg, #e13740 0%, #c12e3a 100%)', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(225,55,64,0.3)', display: 'flex', alignItems: 'center', gap: '8px'}}
                >
                  <ArrowLeft className="me-2" />
                  Back to Manage Events
                </Button>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(225,55,64,0.15)'}}>
                <div style={{width: '40px', height: '40px', border: '3px solid #f5efe9', borderTop: '3px solid #e13740', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px'}}></div>
                <p style={{color: '#8b5a3c', fontSize: '16px', margin: 0}}>Loading event data...</p>
              </div>
            </div>
          </div>
        </Row>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard container-fluid">
        <MobileHeader active={activeSection} setActive={handleSectionChange} />
        <Row className="flex-nowrap">
          <div className="sidebar-col p-0 d-none d-lg-block">
            <Sidebar active={activeSection} setActive={handleSectionChange} />
          </div>
          <div className="content-col">
            <Breadcrumb />
            <div style={{padding: '20px', backgroundColor: 'white'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', padding: '25px 30px', background: 'linear-gradient(135deg, #fff 0%, #f5efe9 100%)', borderRadius: '12px', boxShadow: '0 2px 10px rgba(225,55,64,0.15)', border: '1px solid rgba(225,55,64,0.2)'}}>
                <div style={{flex: 1}}>
                  <h1 style={{color: '#e13740', margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', lineHeight: '1.2'}}>Edit Event</h1>
                  <p style={{color: '#8b5a3c', margin: 0, fontSize: '16px', fontWeight: '400', lineHeight: '1.4'}}>Update event details and configuration</p>
                </div>
                <Button 
                  variant="outline-secondary" 
                  onClick={handleBack}
                  style={{padding: '12px 24px', border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg, #e13740 0%, #c12e3a 100%)', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(225,55,64,0.3)', display: 'flex', alignItems: 'center', gap: '8px'}}
                >
                  <ArrowLeft className="me-2" />
                  Back to Manage Events
                </Button>
              </div>
              <div className="alert alert-danger" style={{margin: '20px 0'}}>
                {error}
              </div>
            </div>
          </div>
        </Row>
      </div>
    );
  }

  return (
    <div className="admin-dashboard container-fluid">
      <MobileHeader active={activeSection} setActive={handleSectionChange} />
      <Row className="flex-nowrap">
        <div className="sidebar-col p-0 d-none d-lg-block">
          <Sidebar active={activeSection} setActive={handleSectionChange} />
        </div>
        <div className="EditFormContent" style={{flex: 1, overflow: 'auto', height: '100vh'}}>
          {/* <Breadcrumb /> */}
          <div style={{padding: '20px', backgroundColor: 'white'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', padding: '25px 30px', background: 'linear-gradient(135deg, #fff 0%, #f5efe9 100%)', borderRadius: '12px', boxShadow: '0 2px 10px rgba(225,55,64,0.15)', border: '1px solid rgba(225,55,64,0.2)'}}>
              <div style={{flex: 1}}>
                <h1 style={{color: '#e13740', margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', lineHeight: '1.2'}}>Edit Event</h1>
                <p style={{color: '#8b5a3c', margin: 0, fontSize: '16px', fontWeight: '400', lineHeight: '1.4'}}>Update event details and configuration</p>
              </div>
              <Button 
                variant="outline-secondary" 
                onClick={handleBack}
                style={{padding: '12px 24px', border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg, #e13740 0%, #c12e3a 100%)', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(225,55,64,0.3)', display: 'flex', alignItems: 'center', gap: '8px'}}
              >
                <ArrowLeft className="me-2" />
                Back to Manage Events
              </Button>
            </div>
            {eventData && (
              <EventForm 
                eventData={eventData} 
                onSuccess={handleSuccess}
              />
            )}
          </div>
        </div>
      </Row>
    </div>
  );
};

export default EditEventPage;