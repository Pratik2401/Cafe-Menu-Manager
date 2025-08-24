import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Modal } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import { useBreadcrumb } from './AdminBreadcrumbContext';
import { getAllSocials, deleteSocial, toggleSocialVisibility, updateSocialSerials } from '../../api/admin';
import { clearCache } from '../../hooks/useApiCache';
import AdminSocialCard from './AdminSocialCard';
import AdminSocialForm from './AdminSocialForm';
import AdminSocialDragDrop from './AdminSocialDragDrop';
import '../../styles/AdminSocialControl.css';

const AdminSocialManagement = ({ isStandalone = true }) => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [socials, setSocials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSocial, setEditingSocial] = useState(null);

  useEffect(() => {
    if (isStandalone) {
      updateBreadcrumb([{ label: "Social Media Management" }]);
    }
    fetchSocials();
  }, [updateBreadcrumb, isStandalone]);

  const fetchSocials = async () => {
    try {
      setLoading(true);
      // Clear cache to ensure fresh data
      clearCache('socials');
      const response = await getAllSocials();
      setSocials(response.data || response || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch socials:', err);
      setError('Failed to load social media. Please try again.');
      setSocials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (socials.length >= 6) {
      setError('Maximum 6 social media entries allowed');
      return;
    }
    setEditingSocial(null);
    setShowForm(true);
  };

  const handleEdit = (social) => {
    setEditingSocial(social);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this social media?')) {
      return;
    }

    try {
      await deleteSocial(id);
      setSocials(prev => prev.filter(s => s._id !== id));
      // Clear cache to ensure consistency
      clearCache('socials');
    } catch (err) {
      console.error('Failed to delete social media:', err);
      setError('Failed to delete social media. Please try again.');
    }
  };

  const handleToggleVisibility = async (id, isVisible) => {
    try {
      await toggleSocialVisibility(id, isVisible);
      setSocials(prev => prev.map(s => 
        s._id === id ? { ...s, isVisible } : s
      ));
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
      setError('Failed to update visibility. Please try again.');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSocial(null);
    // Clear cache before fetching to ensure fresh data
    clearCache('socials');
    fetchSocials();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSocial(null);
  };

  const handleReorder = async (reorderedSocials) => {
    try {
      const socialsWithSerials = reorderedSocials.map((social, index) => ({
        _id: social._id,
        serialId: index + 1
      }));
      
      await updateSocialSerials(socialsWithSerials);
      setSocials(reorderedSocials);
      // Clear cache to ensure consistency
      clearCache('socials');
    } catch (err) {
      console.error('Failed to update order:', err);
      setError('Failed to update order. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container className="SocialMediaContainer mt-4 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }



  return (
    <Container className="SocialMediaContainer mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Social Media Management</h2>
          <p className="text-muted">
            Manage your social media links and icons ({socials.length}/6 used)
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleCreate}
          disabled={socials.length >= 6}
        >
          <Plus className="me-2" />
          Add Social Media
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {socials.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No social media added yet.</p>
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="me-2" />
            Add Your First Social Media
          </Button>
        </div>
      ) : (
        <AdminSocialDragDrop
          socials={socials}
          onReorder={handleReorder}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
        />
      )}
      
      <Modal show={showForm} onHide={handleFormCancel} size="lg" centered>
        <Modal.Body className="p-0">
          <AdminSocialForm
            social={editingSocial}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminSocialManagement;