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
    <div className=" food-category-management">
      <Card>
        <Card.Header>
            <h3 className="section-title">Allergy Management</h3>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setShowModal(true)}
            >
              <FaPlus className="me-1" /> Add Allergy
            </Button>
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

          {allergies.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No allergies found. Add an allergy to get started.</p>
            </div>
          ) : (
            <Table responsive>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allergies.map((allergy) => (
                  <tr key={allergy._id}>
                    <td>
                      <img
                        src={getImageUrl(allergy.image)}
                        alt={allergy.name}
                        style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4, margin: 0   }}
                      />
                    </td>
                    <td>{allergy.name}</td>
                    <td>
                      <Switch
                        checked={allergy.isActive}
                        onChange={() => handleToggleStatus(allergy._id)}
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
                        className="btn btn-outline-secondary editAllergyBtn"
                        onClick={() => handleEdit(allergy)}
                        title="Edit"
                        type="button"
                      >
                        <FaPencil />
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(allergy._id)}
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
            <Form.Group className="mb-3">
              <Form.Label>Allergy Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Allergy Image (Keep Ratio 1:1)</Form.Label>
              <Form.Control
                type="file"
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
                <div className="mt-2">
                  <img
                    src={formData.image ? URL.createObjectURL(formData.image) : getImageUrl(editingAllergy?.image)}
                    alt="Preview"
                    style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }}
                  />
                </div>
              )}
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2 CancelFoodCategoryBtn" onClick={handleCloseModal} type="button">
                <span style={{ fontSize: 18, verticalAlign: 'middle' }}>✗</span> Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading} className='SaveFoodCategoryBtn'>
                <span style={{ fontSize: 18, verticalAlign: 'middle' }}>✓</span> {loading ? 'Saving...' : 'Save'}
              </Button>
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
        aspectRatio={1}
      />
    </div>
  );
};

export default AllergyManagement;