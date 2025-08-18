import React from 'react';
import { Nav, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCalendarPlus, FaListAlt, FaUserCheck, FaEdit } from 'react-icons/fa';

const EventsSidebar = ({ activeKey }) => {
  return (
    <div className="events-sidebar">
      <div className="sidebar-header mb-4">
        <h4>Events Management</h4>
      </div>
      
      <Nav className="flex-column" activeKey={activeKey}>
        <Nav.Item>
          <Link to="/admin/events/create" className="nav-link">
            <FaCalendarPlus className="me-2" /> Create Event
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link to="/admin/events" className="nav-link">
            <FaListAlt className="me-2" /> All Events
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link to="/admin/events/registrations" className="nav-link">
            <FaUserCheck className="me-2" /> Registrations
          </Link>
        </Nav.Item>
      </Nav>
      
      <div className="mt-4">
        <Link to="/admin/dashboard">
          <Button variant="outline-secondary" size="sm" className="w-100">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EventsSidebar;