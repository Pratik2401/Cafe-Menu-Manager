/**
 * @fileoverview Lazy loaded route components for code splitting
 * Reduces initial bundle size by loading components on demand
 */

import { lazy } from 'react';

// Customer-facing components
export const LandingPage = lazy(() => import('../components/MenuDesignOne/LandingPage.jsx'));
export const MenuView = lazy(() => import('../components/MenuDesignOne/MenuView.jsx'));
export const DailyOffersView = lazy(() => import('../components/MenuDesignOne/DailyOffersView.jsx'));
export const EventOffersView = lazy(() => import('../components/MenuDesignOne/EventOffersView.jsx'));
export const EventDetails = lazy(() => import('../components/MenuDesignOne/EventDetails.jsx'));

// Admin components - loaded only when needed
export const AdminLogin = lazy(() => import('../components/Admin/AdminLogin.jsx'));
export const AdminDashboard = lazy(() => import('../components/Admin/AdminDashboard.jsx'));
export const EditEventPage = lazy(() => import('../components/Admin/AdminEditEventPage.jsx'));

// Admin management pages
export const AdminCategoryMainPage = lazy(() => import('../components/Admin/AdminCategoryMainPage.jsx'));
export const AdminFoodCategoryManagement = lazy(() => import('../components/Admin/AdminFoodCategoryManagement.jsx'));
export const AdminSubCategoryMainPage = lazy(() => import('../components/Admin/AdminSubCategoryMainPage.jsx'));
export const AdminItemMainPage = lazy(() => import('../components/Admin/AdminItemMainPage.jsx'));
export const AdminDailyOffersPage = lazy(() => import('../components/Admin/AdminDailyOffersPage.jsx'));
export const AdminDailyOfferForm = lazy(() => import('../components/Admin/AdminDailyOfferForm.jsx'));
export const AdminSocialControl = lazy(() => import('../components/Admin/AdminSocialControl.jsx'));
export const AdminControls = lazy(() => import('../components/Admin/AdminControls.jsx'));
export const AdminManagementControls = lazy(() => import('../components/Admin/AdminManagementControls.jsx'));
export const AdminVariationManagement = lazy(() => import('../components/Admin/AdminVariationManagement.jsx'));
export const AdminSizeManagement = lazy(() => import('../components/Admin/AdminSizeManagement.jsx'));
export const AdminTagManagement = lazy(() => import('../components/Admin/AdminTagManagement.jsx'));
export const AdminAllergyManagement = lazy(() => import('../components/Admin/AdminAllergyManagement.jsx'));
export const AdminMenuCustomization = lazy(() => import('../components/Admin/AdminMenuCustomization.jsx'));
export const AdminMessageControl = lazy(() => import('../components/Admin/AdminMessageControl.jsx'));
export const AdminEventForm = lazy(() => import('../components/Admin/AdminEventForm.jsx'));
export const AdminManageEventsPage = lazy(() => import('../components/Admin/AdminManageEventsPage.jsx'));
export const AdminReviewAnalytics = lazy(() => import('../components/Admin/AdminReviewAnalytics.jsx'));
export const AdminUserInfoList = lazy(() => import('../components/Admin/AdminUserInfoList.jsx'));
export const AdminImageUploadPage = lazy(() => import('../components/Admin/AdminImageUploadPage.jsx'));
