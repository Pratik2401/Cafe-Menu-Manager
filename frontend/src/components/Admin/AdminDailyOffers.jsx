import React, { useState, useEffect } from 'react';
import Switch from 'react-switch';
import { 
  fetchDailyOffers, 
  deleteDailyOffer, 
  toggleDailyOfferStatus 
} from '../../api/admin';
import AdminDailyOfferForm from './AdminDailyOfferForm';
import '../../styles/AdminDailyOffers.css';

const AdminDailyOffers = () => {
  const [dailyOffers, setDailyOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  useEffect(() => {
    loadDailyOffers();
  }, []);

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
    setShowForm(true);
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
    // Optimistically update UI first
    setDailyOffers(prev => prev.map(offer => 
      offer._id === id ? { ...offer, isActive: !currentStatus } : offer
    ));
    
    try {
      await toggleDailyOfferStatus(id, !currentStatus);
    } catch (error) {
      // Revert on error
      setDailyOffers(prev => prev.map(offer => 
        offer._id === id ? { ...offer, isActive: currentStatus } : offer
      ));
      console.error('Error toggling status:', error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingOffer(null);
    loadDailyOffers();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingOffer(null);
  };

  return (
    <div className="admin-daily-offers">
      {!showForm && (
        <>
          <div className="admin-daily-offers__header">
            <h2 className="admin-daily-offers__title">Daily Offers Management</h2>
            <button 
              className="admin-daily-offers__add-btn" 
              onClick={() => { setShowForm(true); setEditingOffer(null); }}
              disabled={loading}
            >
              Add New Daily Offer
            </button>
          </div>

          <div className="admin-daily-offers__list" key={dailyOffers.length}>
        {loading ? (
          <div className="admin-daily-offers__loading">Loading daily offers...</div>
        ) : dailyOffers.length === 0 ? (
          <div className="admin-daily-offers__no-data">No daily offers found</div>
        ) : (
          dailyOffers.map(offer => (
            <div key={offer._id} className="admin-daily-offers__card">
              <div className="admin-daily-offers__card-header">
                <h3 className="admin-daily-offers__card-title">{offer.name}</h3>
                <div className="admin-daily-offers__card-actions">
                  <Switch
                    checked={!!offer.isActive}
                    onChange={() => handleToggleStatus(offer._id, !!offer.isActive)}
                    onColor="#64E239"
                    offColor="#545454"
                    checkedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 16, color: 'white'}}>Show</span>}
                    uncheckedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 16, color: 'white'}}>Hide</span>}
                    width={70}
                    height={30}
                    handleDiameter={22}
                  />
                  <button 
                    className="admin-daily-offers__btn admin-daily-offers__btn--primary" 
                    onClick={() => handleEdit(offer)}
                  >
                    Edit
                  </button>
                  <button 
                    className="admin-daily-offers__btn admin-daily-offers__btn--danger" 
                    onClick={() => handleDelete(offer._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="admin-daily-offers__card-details">
                <p className="admin-daily-offers__detail"><strong>Description:</strong> {offer.description}</p>
                <p className="admin-daily-offers__detail"><strong>Duration:</strong> {new Date(offer.startDate).toLocaleDateString()} to {new Date(offer.endDate).toLocaleDateString()}</p>
                <p className="admin-daily-offers__detail"><strong>Time:</strong> {offer.startTime} - {offer.endTime}</p>
                {offer.isRecurring && (
                  <p className="admin-daily-offers__detail"><strong>Recurring:</strong> 
                    {offer.recurringPattern?.frequency === 'weekly' ? 
                      `Weekly on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][offer.recurringPattern.dayOfWeek]}` :
                      `Monthly on day ${offer.recurringPattern?.dayOfMonth}`
                    }
                    {offer.recurringPattern?.endRecurrence && ` until ${new Date(offer.recurringPattern.endRecurrence).toLocaleDateString()}`}
                  </p>
                )}
                <p className="admin-daily-offers__detail"><strong>Status:</strong> 
                  <span className={`admin-daily-offers__status admin-daily-offers__status--${offer.isActive ? 'active' : 'inactive'}`}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
                
                {offer.backgroundImage && (
                  <div className="admin-daily-offers__bg-image">
                    <img src={getImageUrl(offer.backgroundImage)} alt="Background" className="admin-daily-offers__image" />
                  </div>
                )}
                
                {offer.promotionalImage && (
                  <div className="admin-daily-offers__bg-image">
                    <img src={getImageUrl(offer.promotionalImage)} alt="Promotional" className="admin-daily-offers__image" />
                  </div>
                )}
                
                {offer.offers && offer.offers.length > 0 && (
                  <div className="admin-daily-offers__nested">
                    <h4 className="admin-daily-offers__nested-title">Offers ({offer.offers.length})</h4>
                    {offer.offers.map((nestedOffer, index) => (
                      <div key={index} className="admin-daily-offers__nested-item">
                        <h5 className="admin-daily-offers__nested-name">{nestedOffer.name}</h5>
                        <p className="admin-daily-offers__nested-desc">{nestedOffer.description}</p>
                        <p className="admin-daily-offers__nested-price"><strong>Price:</strong> ₹{nestedOffer.offerPrice} <span className="admin-daily-offers__original-price">₹{nestedOffer.actualPrice}</span></p>
                        {nestedOffer.imageUrl && (
                          <img src={getImageUrl(nestedOffer.imageUrl)} alt={nestedOffer.name} className="admin-daily-offers__nested-image" />
                        )}
                        <div className="admin-daily-offers__items">
                          <strong>Items:</strong>
                          <ul className="admin-daily-offers__items-list">
                            {nestedOffer.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="admin-daily-offers__item">
                                {item.name} x {item.quantity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
          </div>
        </>
      )}

      {showForm && (
        <AdminDailyOfferForm
          editingOffer={editingOffer}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default AdminDailyOffers;