import React, { useState, useEffect } from 'react';
import { 
  fetchDailyOffers, 
  deleteDailyOffer, 
  toggleDailyOfferStatus 
} from '../../api/admin';
import { getImageUrl } from '../../utils/imageUrl';
import AdminDailyOfferForm from './AdminDailyOfferForm';
import { useBreadcrumb } from './AdminBreadcrumbContext';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { FiPlus, FiEdit3, FiTrash2, FiPlay, FiPause, FiPercent, FiCalendar, FiClock } from 'react-icons/fi';
import Switch from 'react-switch';
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
      const originalOffers = dailyOffers;
      setDailyOffers(prev => prev.filter(offer => offer._id !== id));
      
      try {
        await deleteDailyOffer(id);
      } catch (error) {
        setDailyOffers(originalOffers);
        console.error('Error deleting daily offer:', error);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setDailyOffers(prev => prev.map(offer => 
      offer._id === id ? { ...offer, isActive: !currentStatus } : offer
    ));
    
    try {
      await toggleDailyOfferStatus(id, !currentStatus);
    } catch (error) {
      setDailyOffers(prev => prev.map(offer => 
        offer._id === id ? { ...offer, isActive: currentStatus } : offer
      ));
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
              <div key={offer._id} style={{background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: '1px solid #ddd'}}>
                <div style={{position: 'relative', height: '200px', overflow: 'hidden', background: '#f5f5f5'}}>
                  {offer.backgroundImage ? (
                    <img 
                      src={getImageUrl(offer.backgroundImage)} 
                      alt={offer.name}
                      style={{width: '100%', height: '100%', objectFit: 'cover'}}
                    />
                  ) : (
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999'}}>
                      📷 No Image
                    </div>
                  )}
                  <div style={{position: 'absolute', top: '12px', right: '12px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: offer.isActive ? '#28a745' : '#6c757d', color: 'white'}}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div style={{background: 'white', color: '#333', padding: '20px'}}>
                  <div className="offer-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                    <h3 style={{color: '#e13740', margin: 0, fontSize: '18px', fontWeight: 'bold'}}>{offer.name}</h3>
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                      <Switch
                        checked={offer.isActive}
                        onChange={() => handleToggleStatus(offer._id, offer.isActive)}
                        onColor="#e13740"
                        offColor="#ccc"
                        width={50}
                        height={24}
                        handleDiameter={20}
                      />
                      <button
                        style={{padding: '6px 12px', borderRadius: '4px', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer', backgroundColor: '#e13740', color: 'white'}}
                        onClick={() => handleEdit(offer)}
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        style={{padding: '6px 12px', borderRadius: '4px', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer', backgroundColor: '#e13740', color: 'white'}}
                        onClick={() => handleDelete(offer._id)}
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {offer.description && (
                    <p style={{color: '#666', fontSize: '14px', marginBottom: '15px'}}>{offer.description}</p>
                  )}

                  <div style={{borderTop: '1px solid #eee', paddingTop: '15px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                      <span style={{color: '#666', fontWeight: '500'}}>Duration:</span>
                      <span style={{color: '#e13740', fontWeight: '600'}}>
                        {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                      </span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                      <span style={{color: '#666', fontWeight: '500'}}>Time:</span>
                      <span style={{color: '#e13740', fontWeight: '600'}}>
                        {formatTime(offer.startTime)} - {formatTime(offer.endTime)}
                      </span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                      <span style={{color: '#666', fontWeight: '500'}}>Offers:</span>
                      <span style={{color: '#e13740', fontWeight: '600'}}>
                        {offer.offers?.length || 0} deal{offer.offers?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {offer.offers && offer.offers.length > 0 && (
                    <div style={{borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '15px'}}>
                      <h4 style={{color: '#e13740', fontSize: '16px', fontWeight: '600', marginBottom: '12px'}}>Included Deals:</h4>
                      <div>
                        {offer.offers.map((nestedOffer, index) => (
                          <div key={index} style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '8px'}}>
                            <div style={{flex: 1}}>
                              <div style={{color: '#e13740', fontWeight: '600', fontSize: '14px', marginBottom: '4px'}}>{nestedOffer.name}</div>
                              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <span style={{color: '#6c757d', textDecoration: 'line-through', fontSize: '12px'}}>₹{nestedOffer.actualPrice}</span>
                                <span style={{color: '#e13740', fontWeight: '700', fontSize: '14px'}}>₹{nestedOffer.offerPrice}</span>
                                <span style={{background: '#e13740', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px'}}>
                                  {Math.round(((nestedOffer.actualPrice - nestedOffer.offerPrice) / nestedOffer.actualPrice) * 100)}% OFF
                                </span>
                              </div>
                            </div>
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