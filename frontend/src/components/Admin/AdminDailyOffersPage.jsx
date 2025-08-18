import React, { useState, useEffect } from 'react';
import { 
  fetchDailyOffers, 
  deleteDailyOffer, 
  toggleDailyOfferStatus 
} from '../../api/admin';
import AdminDailyOfferForm from './AdminDailyOfferForm';
import { useBreadcrumb } from './AdminBreadcrumbContext';
import '../../styles/AdminDailyOffers.css';

const AdminDailyOffersPage = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [dailyOffers, setDailyOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'form'
  const [editingOffer, setEditingOffer] = useState(null);

  useEffect(() => {
    updateBreadcrumb([
      { label: 'Daily Offers Management' }
    ]);
    loadDailyOffers();
  }, [updateBreadcrumb]);

  const loadDailyOffers = async () => {
    try {
      setLoading(true);
      const response = await fetchDailyOffers();
      setDailyOffers(response.data || []);
    } catch (error) {
      console.error('Error loading daily offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setCurrentView('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this daily offer?')) {
      try {
        await deleteDailyOffer(id);
        loadDailyOffers();
      } catch (error) {
        console.error('Error deleting daily offer:', error);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleDailyOfferStatus(id, !currentStatus);
      loadDailyOffers();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleFormSuccess = () => {
    setCurrentView('list');
    setEditingOffer(null);
    loadDailyOffers();
  };

  const handleFormCancel = () => {
    setCurrentView('list');
    setEditingOffer(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (currentView === 'form') {
    return (
      <AdminDailyOfferForm
        editingOffer={editingOffer}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="daily-offers-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Daily Offers Management</h1>
          <p className="page-subtitle">Create and manage special daily offers for your customers</p>
        </div>
        <button 
          className="btn btn-primary btn-create"
          onClick={() => setCurrentView('form')}
        >
          <i className="icon-plus"></i>
          Create New Offer
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading daily offers...</p>
        </div>
      ) : (
        <div className="offers-grid">
          {dailyOffers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h3>No Daily Offers Yet</h3>
              <p>Create your first daily offer to attract more customers with special deals.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setCurrentView('form')}
              >
                Create First Offer
              </button>
            </div>
          ) : (
            dailyOffers.map((offer) => (
              <div key={offer._id} className="offer-card">
                <div className="offer-image-container">
                  {offer.backgroundImage ? (
                    <img 
                      src={getImageUrl(offer.backgroundImage)} 
                      alt={offer.name}
                      className="offer-image"
                    />
                  ) : (
                    <div className="offer-image-placeholder">
                      <i className="icon-image"></i>
                    </div>
                  )}
                  <div className={`offer-status ${offer.isActive ? 'active' : 'inactive'}`}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="offer-content">
                  <div className="offer-header">
                    <h3 className="offer-title">{offer.name}</h3>
                    <div className="offer-actions">
                      <button
                        className={`btn btn-sm ${offer.isActive ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggleStatus(offer._id, offer.isActive)}
                        title={offer.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {offer.isActive ? '⏸️' : '▶️'}
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(offer)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(offer._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {offer.description && (
                    <p className="offer-description">{offer.description}</p>
                  )}

                  <div className="offer-details">
                    <div className="detail-row">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">
                        {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">
                        {formatTime(offer.startTime)} - {formatTime(offer.endTime)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Offers:</span>
                      <span className="detail-value">
                        {offer.offers?.length || 0} deal{offer.offers?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {offer.offers && offer.offers.length > 0 && (
                    <div className="nested-offers">
                      <h4 className="nested-offers-title">Included Deals:</h4>
                      <div className="nested-offers-list">
                        {offer.offers.map((nestedOffer, index) => (
                          <div key={index} className="nested-offer-item">
                            <div className="nested-offer-info">
                              <span className="nested-offer-name">{nestedOffer.name}</span>
                              <div className="nested-offer-prices">
                                <span className="original-price">₹{nestedOffer.actualPrice}</span>
                                <span className="offer-price">₹{nestedOffer.offerPrice}</span>
                                <span className="discount">
                                  {Math.round(((nestedOffer.actualPrice - nestedOffer.offerPrice) / nestedOffer.actualPrice) * 100)}% OFF
                                </span>
                              </div>
                            </div>
                            {nestedOffer.imageUrl && (
                              <img 
                                src={getImageUrl(nestedOffer.imageUrl)} 
                                alt={nestedOffer.name}
                                className="nested-offer-image"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDailyOffersPage;