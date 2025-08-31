import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { FaPencil, FaRegTrashCan } from 'react-icons/fa6';
import Switch from 'react-switch';
import { 
  fetchDailyOffers, 
  deleteDailyOffer, 
  toggleDailyOfferStatus 
} from '../../api/admin';
import { getImageUrl } from '../../utils/imageUrl';
import AdminDailyOfferForm from './AdminDailyOfferForm';
import { useBreadcrumb } from './AdminBreadcrumbContext';
import '../../styles/AdminCommon.css';

const AdminDailyOffersPage = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [dailyOffers, setDailyOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      setError('');
    } catch (error) {
      setError('Failed to load daily offers. Please try again.');
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
    if (window.confirm('Are you sure you want to delete this daily offer? This action cannot be undone.')) {
      try {
        await deleteDailyOffer(id);
        setDailyOffers(dailyOffers.filter(offer => offer._id !== id));
        setError('');
      } catch (error) {
        setError('Failed to delete daily offer. Please try again.');
        console.error('Error deleting daily offer:', error);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      
      setDailyOffers(dailyOffers.map(offer => 
        offer._id === id ? { ...offer, isActive: newStatus } : offer
      ));
      
      await toggleDailyOfferStatus(id, newStatus);
      setError('');
    } catch (error) {
      setDailyOffers(dailyOffers.map(offer => 
        offer._id === id ? { ...offer, isActive: currentStatus } : offer
      ));
      setError('Failed to update daily offer status. Please try again.');
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
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Daily Offers Management</h2>
        <Button 
          style={{ backgroundColor: '#3F61D8', borderColor: '#3F61D8', borderRadius: '30px' }}
          onClick={() => setCurrentView('form')}
        >
          <FaPlus className="me-2" />Create New Offer
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          {dailyOffers.length === 0 ? (
            <Alert variant="info">No daily offers found. Create your first offer!</Alert>
          ) : (
            <Table responsive striped hover className="shadow-sm">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Duration</th>
                  <th>Time</th>
                  <th>Offers</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dailyOffers.map((offer) => (
                  <tr key={offer._id}>
                    <td>
                      {offer.backgroundImage ? (
                        <img 
                          src={getImageUrl(offer.backgroundImage)} 
                          alt={offer.name}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ) : (
                        <div style={{ width: '60px', height: '60px', backgroundColor: '#f5f5f5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#999' }}>
                          No Image
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="fw-bold">{offer.name}</div>
                      {offer.description && (
                        <small className="text-muted">{offer.description}</small>
                      )}
                    </td>
                    <td>
                      <div>{formatDate(offer.startDate)}</div>
                      <small className="text-muted">to {formatDate(offer.endDate)}</small>
                    </td>
                    <td>
                      <div>{formatTime(offer.startTime)}</div>
                      <small className="text-muted">to {formatTime(offer.endTime)}</small>
                    </td>
                    <td>{offer.offers?.length || 0} deal{offer.offers?.length !== 1 ? 's' : ''}</td>
                    <td>
                      <Switch
                        checked={offer.isActive}
                        onChange={() => handleToggleStatus(offer._id, offer.isActive)}
                        onColor="#64E239"
                        offColor="#545454"
                        checkedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 16, color: 'white'}}>Show</span>}
                        uncheckedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 16, color: 'white'}}>Hide</span>}
                        width={70}
                        height={30}
                        handleDiameter={22}
                      />
                    </td>
                    <td>
                      <button
                        className="btn editIconBtn"
                        onClick={() => handleEdit(offer)}
                        title="Edit"
                        type="button"
                      >
                        <FaPencil />
                      </button>
                      <button
                        className="btn deleteIconBtn"
                        onClick={() => handleDelete(offer._id)}
                        title="Delete"
                        type="button"
                      >
                        <FaRegTrashCan />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </Container>
  );
};

export default AdminDailyOffersPage;