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

import { useState, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { BreadcrumbProvider } from './components/Admin/AdminBreadcrumbContext.jsx';
import { ApiProvider } from './components/utils/ApiContext.jsx';
import { Container, Row } from 'react-bootstrap';
import { ErrorBoundary } from 'react-error-boundary';
import GlobalLoadingOverlay from './components/utils/GlobalLoadingOverlay.jsx';
import UserInfoModal from './components/MenuDesignOne/UserInfoModal.jsx';

// Admin Layout Components
import AdminSideBar from './components/Admin/AdminSideBar.jsx';
import AdminBreadcrumb from './components/Admin/AdminBreadcrumb.jsx';
import AdminMobileHeader from './components/Admin/AdminMobileHeader.jsx';
import ProtectedRoute from './components/utils/ProtectedRoute.jsx';
import FeatureRoute from './components/utils/FeatureRoute.jsx';

// Bootstrap and icon imports for consistent styling
import 'bootstrap/dist/css/bootstrap.min.css';

import './styles/GlobalModals.css';
import './styles/AdminLayout.css';

// Customer Page component imports
import LandingPage from './components/MenuDesignOne/LandingPage.jsx';
import { useLocation } from 'react-router-dom';
import React from 'react';

// Wrapper component to access location state
const LandingPageWrapper = (props) => {
  const location = useLocation();
  const defaultTab = location.state?.defaultTab || 'dine-in';
  
  // Clear navigation state after reading it
  React.useEffect(() => {
    if (location.state?.defaultTab) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [location.state]);
  
  return <LandingPage {...props} defaultTab={defaultTab} />;
};
import MenuView from './components/MenuDesignOne/MenuView.jsx';
import DailyOffersView from './components/MenuDesignOne/DailyOffersView.jsx';
import EventOffersView from './components/MenuDesignOne/EventOffersView.jsx';
import EventDetails from './components/MenuDesignOne/EventDetails.jsx';

// Admin component imports
import AdminLogin from './components/Admin/AdminLogin.jsx';
import AdminDashboard from './components/Admin/AdminDashboard.jsx';
import EditEventPage from './components/Admin/AdminEditEventPage.jsx';

// Lazy loaded admin components
import * as LazyComponents from './components/LazyComponents.js';

import './styles/App.css';

// Loading fallback component
const LoadingFallback = ({ error }) => {
  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <h4>Something went wrong</h4>
          <p>{error.message}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

// Error boundary fallback
const ErrorFallback = ({ error }) => (
  <div className="text-center p-4">
    <h2>Something went wrong:</h2>
    <details style={{ whiteSpace: 'pre-wrap' }}>
      {error && error.toString()}
    </details>
  </div>
);

// Admin Layout component for wrapping admin pages
const AdminLayout = ({ children }) => (
  <Container fluid className="admin-dashboard">
    <AdminMobileHeader />
    <Row className="flex-nowrap">
      <div className="sidebar-col p-0 d-none d-lg-block">
        <AdminSideBar />
      </div>
      <div className="content-col">
        <AdminBreadcrumb />
        <div className="admin-content">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
          </ErrorBoundary>
        </div>
      </div>
    </Row>
  </Container>
);

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
                  <LandingPageWrapper 
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
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminLogin onCategorySelect={handleCategorySelect} />
                </Suspense>
              }
            />
            
            {/* Admin dashboard - Protected route */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminDashboard onCategorySelect={handleCategorySelect} />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Category management */}
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminCategoryMainPage />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Food category management */}
            <Route
              path="/admin/food-categories"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminFoodCategoryManagement />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Subcategory management */}
            <Route
              path="/admin/subcategories"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminSubCategoryMainPage />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Item management */}
            <Route
              path="/admin/items"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminItemMainPage />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Daily offers - view all */}
            <Route
              path="/admin/daily-offers"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminDailyOffersPage />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Daily offer create/edit */}
            <Route
              path="/admin/daily-offers/new"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminDailyOfferForm />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/daily-offers/edit/:offerId"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminDailyOfferForm />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Social media control */}
            <Route
              path="/admin/social"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminSocialControl />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin controls */}
            <Route
              path="/admin/controls"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminControls />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Management controls */}
            <Route
              path="/admin/management"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminManagementControls />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Variation management */}
            <Route
              path="/admin/variations"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminVariationManagement />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Size management */}
            <Route
              path="/admin/sizes"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminSizeManagement />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Tag management */}
            <Route
              path="/admin/tags"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminTagManagement />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Allergy management */}
            <Route
              path="/admin/allergies"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminAllergyManagement />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Menu customization */}
            <Route
              path="/admin/menu-customization"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminMenuCustomization />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Message control */}
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminMessageControl />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Event creation */}
            <Route
              path="/admin/events/new"
              element={
                <ProtectedRoute>
                  <FeatureRoute feature="eventsToggle">
                    <AdminLayout>
                      <Suspense fallback={<LoadingFallback />}>
                        <LazyComponents.AdminEventForm />
                      </Suspense>
                    </AdminLayout>
                  </FeatureRoute>
                </ProtectedRoute>
              }
            />

            {/* Event management */}
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute>
                  <FeatureRoute feature="eventsToggle">
                    <AdminLayout>
                      <Suspense fallback={<LoadingFallback />}>
                        <LazyComponents.AdminManageEventsPage />
                      </Suspense>
                    </AdminLayout>
                  </FeatureRoute>
                </ProtectedRoute>
              }
            />

            {/* Review analytics */}
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminReviewAnalytics />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* User info management */}
            <Route
              path="/admin/user-info"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminUserInfoList />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Image uploads */}
            <Route
              path="/admin/image-uploads"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyComponents.AdminImageUploadPage />
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Event editing page - Protected route */}
            <Route
              path="/admin/edit-event/:eventId"
              element={
                <ProtectedRoute>
                  <FeatureRoute feature="eventsToggle">
                    <AdminLayout>
                      <Suspense fallback={<LoadingFallback />}>
                        <EditEventPage />
                      </Suspense>
                    </AdminLayout>
                  </FeatureRoute>
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
