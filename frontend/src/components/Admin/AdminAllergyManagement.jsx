import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { FaPencil, FaRegTrashCan } from 'react-icons/fa6';
import Switch from 'react-switch';
import { getAllAllergies, createAllergy, updateAllergy, deleteAllergy, toggleAllergyStatus } from '../../api/admin';
import ImageCropModal from '../utils/ImageCropModal';
import { getImageUrl } from '../../utils/imageUrl';
import Swal from 'sweetalert2';
import '../../styles/AllergyManagement.css';

const AllergyManagement = ({ isStandalone = true }) => {
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState(null);
  const [formData, setFormData] = useState({ name: '', image: null });
  const [hasProcessedImage, setHasProcessedImage] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImageForCrop, setOriginalImageForCrop] = useState(null);

  useEffect(() => {
    fetchAllergies();
  }, []);

  const fetchAllergies = async () => {
    try {
      setLoading(true);
      const response = await getAllAllergies();
      setAllergies(response.data || []);
    } catch (err) {
      setError('Failed to fetch allergies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || (!formData.image && !editingAllergy)) {
      setError('Name and image are required');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('name', formData.name);
      if (formData.image) {
        data.append('image', formData.image);
      }

      if (editingAllergy) {
        await updateAllergy(editingAllergy._id, data);
        setSuccess('Allergy updated successfully');
      } else {
        await createAllergy(data);
        setSuccess('Allergy created successfully');
      }

      await fetchAllergies();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save allergy');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this allergy?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (!result.isConfirmed) return;

    try {
      await deleteAllergy(id);
      Swal.fire('Deleted!', 'Allergy deleted successfully', 'success');
      await fetchAllergies();
    } catch (err) {
      Swal.fire('Error!', 'Failed to delete allergy', 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleAllergyStatus(id);
      await fetchAllergies();
    } catch (err) {
      setError('Failed to toggle allergy status');
    }
  };

  const handleEdit = (allergy) => {
    setEditingAllergy(allergy);
    setFormData({ name: allergy.name, image: null });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAllergy(null);
    setFormData({ name: '', image: null });
    setHasProcessedImage(false);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  if (loading && allergies.length === 0) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" size="lg" />
      </div>
    );
  }

  return (
    <div className="allergy-management">
      <Card className='allergy-card'>
        <Card.Header className="allergy-card-header">
          <h3 className="section-title">Allergy Management</h3>
          <button 
            className="add-btn"
            onClick={() => setShowModal(true)}
          >
            <FaPlus /> Add Allergy
          </button>
        </Card.Header>
        <Card.Body>
          <div className="alert-container">
            {error && (
              <Alert variant="danger" onClose={clearMessages} dismissible>
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success" onClose={clearMessages} dismissible>
                {success}
              </Alert>
            )}
          </div>

          <div className="allergy-table-container">
            <Table className="allergy-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Image</th>
                  <th style={{ minWidth: '70px' }}>Name</th>
                  <th style={{ width: '120px' }}>Status</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allergies.map((allergy) => (
                  <tr key={allergy._id}>
                    <td>
                      <img
                        src={getImageUrl(allergy.image)}
                        alt={allergy.name}
                        className="allergy-image"
                      />
                    </td>
                    <td>
                      <span className="allergy-name">{allergy.name}</span>
                    </td>
                    <td>
                      <Switch
                        checked={allergy.isActive}
                        onChange={() => handleToggleStatus(allergy._id)}
                        onColor="#64E239"
                        offColor="#545454"
                        checkedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 14, color: 'white'}}>Show</span>}
                        uncheckedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 14, color: 'white'}}>Hide</span>}
                        width={70}
                        height={30}
                        handleDiameter={22}
                      />
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(allergy)}
                          title="Edit"
                          type="button"
                        >
                          <FaPencil />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(allergy._id)}
                          title="Delete"
                          type="button"
                        >
                          <FaRegTrashCan />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {allergies.length === 0 && (
            <div className="empty-state">
              <p>No allergies found. Create your first allergy!</p>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAllergy ? 'Edit Allergy' : 'Add New Allergy'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="modal-form-group">
              <label className="modal-form-label">Allergy Name</label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="modal-form-group">
              <label className="modal-form-label">Allergy Image (Keep Ratio 1:1)</label>
              <input
                type="file"
                className="modal-form-input"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const imageUrl = URL.createObjectURL(file);
                    setOriginalImageForCrop(imageUrl);
                    setShowCropModal(true);
                  }
                  e.target.value = '';
                }}
                required={!editingAllergy && !hasProcessedImage}
              />
              {formData.image && (
                <div className="mt-2 text-success small">
                  ✓ Image processed and ready to upload
                </div>
              )}
              {(formData.image || editingAllergy?.image) && (
                <div className="image-preview">
                  <img
                    src={formData.image ? URL.createObjectURL(formData.image) : getImageUrl(editingAllergy?.image)}
                    alt="Preview"
                    className="preview-image"
                  />
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleCloseModal} type="button">
                ✗ Cancel
              </button>
              <button className="save-btn" type="submit" disabled={loading}>
                ✓ {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Image Crop Modal */}
      <ImageCropModal
        show={showCropModal}
        onHide={() => setShowCropModal(false)}
        onSave={(croppedBlob) => {
          
          if (!croppedBlob) {
            console.error('AllergyManagement: No blob received');
            return;
          }
          const croppedFile = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
          setFormData({ ...formData, image: croppedFile });
          setHasProcessedImage(true);
          setShowCropModal(false);
        }}
        originalImage={originalImageForCrop}
      />
    </div>
  );
};

export default AllergyManagement;