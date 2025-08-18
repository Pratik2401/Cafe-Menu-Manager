/**
 * @fileoverview Main Application Component for TopchiOutpost Cafe Management System
 * 
 * This is the root component that sets up routing, global context providers,
 * and manages the overall application structure. It handles both customer-facing
 * and admin routes with proper authentication and layout management.
 * 
 * @author TopchiOutpost Development Team
 * @version 1.0.0
 * @since 2025-01-01
 * 
 * @requires react - React library for component creation
 * @requires react-router-dom - Client-side routing
 * @requires ./BreadcrumbContext - Breadcrumb navigation context
 * @requires ./ApiContext - API state management context
 * @requires ./GlobalLoadingOverlay - Global loading indicator
 * @requires ./UserInfoModal - User information collection modal
 */

import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { BreadcrumbProvider } from './components/Admin/AdminBreadcrumbContext.jsx';
import { ApiProvider } from './components/utils/ApiContext.jsx';
import GlobalLoadingOverlay from './components/utils/GlobalLoadingOverlay.jsx';
import UserInfoModal from './components/MenuDesignOne/UserInfoModal.jsx';

// Bootstrap and icon imports for consistent styling
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/GlobalModals.css';

// Page component imports
import LandingPage from './components/MenuDesignOne/LandingPage.jsx';
import MenuView from './components/MenuDesignOne/MenuView.jsx';
import DailyOffersView from './components/MenuDesignOne/DailyOffersView.jsx';
import EventOffersView from './components/MenuDesignOne/EventOffersView.jsx';
import EventDetails from './components/MenuDesignOne/EventDetails.jsx';
import AdminLogin from './components/Admin/AdminLogin.jsx';
import AdminDashboard from './components/Admin/AdminDashboard.jsx';
import ProtectedRoute from './components/utils/ProtectedRoute.jsx';
import EditEventPage from './components/Admin/AdminEditEventPage.jsx';
import './styles/App.css';

/**
 * Main Application Component
 * @description Root component that manages routing, global state, and layout structure
 * @returns {JSX.Element} The complete application structure
 */
function App() {
  // ========================================================================================
  // STATE MANAGEMENT
  // ========================================================================================
  
  /**
   * Selected category state for menu navigation
   * @type {Object|null} selectedCategory - Currently selected menu category
   */
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ========================================================================================
  // EVENT HANDLERS
  // ========================================================================================

  /**
   * Handle category selection from navigation
   * @description Updates the selected category state for menu filtering
   * @param {string} id - Category ID
   * @param {string} name - Category name
   */
  const handleCategorySelect = (id, name) => {
    setSelectedCategory({ id, name });
  };

  // ========================================================================================
  // LAYOUT COMPONENTS
  // ========================================================================================

  /**
   * Customer Layout Wrapper
   * @description Provides consistent layout structure for customer-facing pages
   * @param {Object} props - Component props
   * @param {ReactNode} props.children - Child components to render
   * @returns {JSX.Element} Customer layout structure
   */
  const CustomerLayout = ({ children }) => (
    <div className="App">
      <UserInfoModal />
      <div className="MenuBody">
        {children}
      </div>
    </div>
  );

  // ========================================================================================
  // APPLICATION RENDER
  // ========================================================================================
  
  return (
    <ApiProvider>
      <BreadcrumbProvider>
        <Router>
          <GlobalLoadingOverlay />
          <Routes>
            {/* ================================================================== */}
            {/* CUSTOMER ROUTES - Public access, no authentication required */}
            {/* ================================================================== */}
            
            {/* Landing page with category selection */}
            <Route
              path="/"
              element={
                <CustomerLayout>
                  <LandingPage 
                    onCategorySelect={handleCategorySelect} 
                    customMessages={{ loadingText: "Loading cafe menu..." }} 
                  />
                </CustomerLayout>
              }
            />
            
            {/* Event details page */}
            <Route
              path="/events/:eventId"
              element={
                <CustomerLayout>
                  <EventDetails />
                </CustomerLayout>
              }
            />
            
            {/* Menu browsing page */}
            <Route
              path="/menupage"
              element={
                <CustomerLayout>
                  <MenuView selectedCategory={selectedCategory} />
                </CustomerLayout>
              }
            />
            
            {/* Daily offers showcase */}
            <Route
              path="/daily-offers"
              element={
                <CustomerLayout>
                  <DailyOffersView />
                </CustomerLayout>
              }
            />
            
            {/* Event-specific offers */}
            <Route
              path="/event-offers"
              element={
                <CustomerLayout>
                  <EventOffersView />
                </CustomerLayout>
              }
            />

            {/* ================================================================== */}
            {/* ADMIN ROUTES - Require authentication and admin privileges */}
            {/* ================================================================== */}
            
            {/* Admin login page */}
            <Route
              path="/admin/login"
              element={<AdminLogin onCategorySelect={handleCategorySelect} />}
            />
            
            {/* Admin dashboard - Protected route */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard onCategorySelect={handleCategorySelect} />
                </ProtectedRoute>
              }
            />
            
            {/* Event editing page - Protected route */}
            <Route
              path="/admin/edit-event/:eventId"
              element={
                <ProtectedRoute>
                  <EditEventPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </BreadcrumbProvider>
    </ApiProvider>
  );
}

export default App;