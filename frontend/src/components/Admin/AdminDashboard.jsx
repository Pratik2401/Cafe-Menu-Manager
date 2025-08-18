import React, { useState, useEffect } from 'react';
import { Container, Row } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import Sidebar from './AdminSideBar';
// import OrderTrackingPage from './OrderTrackingPage';
// import PaymentList from './PaymentList';
import Breadcrumb from './AdminBreadcrumb';
import MobileHeader from './AdminMobileHeader';
import '../../styles/AdminDashboard.css';
import AdminCategoryMainPage from './AdminCategoryMainPage';
import AdminSocialControl from './AdminSocialControl';
import AdminControls from './AdminControls';
import EventForm from './AdminEventForm';
import ManageEventsPage from './AdminManageEventsPage';
import ReviewAnalytics from './AdminReviewAnalytics';
import AdminDailyOffers from './AdminDailyOffers';
import AdminVariationManagement from './AdminVariationManagement';
import AdminSizeManagement from './AdminSizeManagement';
import AdminUserInfoList from './AdminUserInfoList';
import ManagementControls from './AdminManagementControls';
import AdminImageUploadPage from './AdminImageUploadPage';
import ErrorBoundary from '../utils/ErrorBoundary';
const AdminDashboard = () => {
  const { state } = useLocation();
  const [activeSection, setActiveSection] = useState('admin-controls');
  
  useEffect(() => {
    if (state?.activeSection) {
      setActiveSection(state.activeSection);
    }
  }, [state?.activeSection]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'category':
        return <AdminCategoryMainPage/>;
      case 'daily-offers':
        return <AdminDailyOffers />;
      // case 'order-tracking':
      //   return <OrderTrackingPage />;
      case 'social':
        return <AdminSocialControl isStandalone={true}/>;
      // case 'payment-list':
        // return <PaymentList />;
      case 'admin-controls':
        return <AdminControls />;
      case 'management-controls':
        return <ManagementControls />;
      case 'create-event':
        return <EventForm onSuccess={() => setActiveSection('manage-events')} />;
      case 'manage-events':
        return <ManageEventsPage setActiveSection={setActiveSection} />;
      case 'review-analytics':
        return <ReviewAnalytics />;
      case 'variations':
        return <AdminVariationManagement />;
      case 'sizes':
        return <AdminSizeManagement />;
      case 'user-info':
        
        return <AdminUserInfoList />;
      case 'image-uploads':
        return <AdminImageUploadPage />;
      case 'menu-item':
        return <div>New Menu Item</div>;
      default:
        // return <OrderTrackingPage />;
    }
  };

  return (
    <Container fluid className="admin-dashboard">
      <MobileHeader active={activeSection} setActive={setActiveSection} />
      <Row className="flex-nowrap">
        <div className="sidebar-col p-0 d-none d-lg-block">
          <Sidebar active={activeSection} setActive={setActiveSection} />
        </div>
        <div className="content-col">
          <Breadcrumb />
          <ErrorBoundary>
            {renderActiveSection()}
          </ErrorBoundary>
        </div>
      </Row>
    </Container>
  );
};

export default AdminDashboard;