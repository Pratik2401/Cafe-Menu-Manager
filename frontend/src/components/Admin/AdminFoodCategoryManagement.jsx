import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaToggleOn } from 'react-icons/fa';
import { fetchFoodCategories, createFoodCategory, updateFoodCategory, deleteFoodCategory, toggleFoodCategoryStatus } from '../../api/admin';
import { useBreadcrumb } from './AdminBreadcrumbContext';
import ImageCropModal from '../utils/ImageCropModal';
import { getImageUrl } from '../../utils/imageUrl';
import Switch from "react-switch";
import { FaPencil,FaRegTrashCan } from "react-icons/fa6";
import Swal from 'sweetalert2';
import '../../styles/FoodCategoryManagement.css';
import '../../styles/AdminCommon.css';
const FoodCategoryManagement = ({ isStandalone = true }) => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [foodCategories, setFoodCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: null
  });
  const [hasProcessedImage, setHasProcessedImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImageForCrop, setOriginalImageForCrop] = useState(null);

  // Load food categories on component mount
  useEffect(() => {
    // Set breadcrumb only if standalone
    if (isStandalone) {
      updateBreadcrumb([
        { label: 'Admin Controls' },
        { label: 'Food Categories' }
      ]);
    }
    loadFoodCategories();
  }, [updateBreadcrumb, isStandalone]);

  const loadFoodCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchFoodCategories();
      setFoodCategories(data);
    } catch (err) {
      setError('Failed to load food categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setOriginalImageForCrop(imageUrl);
      setShowCropModal(true);
    }
    e.target.value = '';
  };

  const handleCroppedImageSave = (croppedBlob) => {
    // console.log('FoodCategoryManagement: Received blob:', croppedBlob);
    if (!croppedBlob) {
      console.error('FoodCategoryManagement: No blob received');
      return;
    }
    const croppedFile = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
    setFormData({ ...formData, icon: croppedFile });
    setPreviewUrl(URL.createObjectURL(croppedBlob));
    setHasProcessedImage(true);
    setShowCropModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      
      if (formData.icon) {
        submitFormData.append('icon', formData.icon);
      }
      
      if (editingCategory) {
        await updateFoodCategory(editingCategory._id, submitFormData);
        setSuccess('Food category updated successfully');
      } else {
        await createFoodCategory(submitFormData);
        setSuccess('Food category created successfully');
      }
      
      resetForm();
      loadFoodCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save food category');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: null
    });
    setPreviewUrl(category.icon);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this food category?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
      setLoading(true);
      try {
        await deleteFoodCategory(id);
        Swal.fire('Deleted!', 'Food category deleted successfully', 'success');
        loadFoodCategories();
      } catch (err) {
        Swal.fire('Error!', 'Failed to delete food category', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    // Optimistically update UI first
    setFoodCategories(prev => 
      prev.map(cat => 
        cat._id === id ? {...cat, isActive: !currentStatus} : cat
      )
    );
    
    try {
      await toggleFoodCategoryStatus(id);
      // No need to show success message for toggle operations
    } catch (err) {
      // Revert on error
      setError('Failed to update food category status');
      setFoodCategories(prev => 
        prev.map(cat => 
          cat._id === id ? {...cat, isActive: currentStatus} : cat
        )
      );
      // Reload to ensure data consistency
      loadFoodCategories();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: null
    });
    setPreviewUrl('');
    setHasProcessedImage(false);
    setEditingCategory(null);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="admin-common-container">
        <div className="admin-common-loading">
          <Spinner animation="border" variant="primary" size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-common-container">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      <Card className="admin-common-card">
        <Card.Header className="admin-common-card-header">
          <h3 className="admin-common-section-title">Food Categories</h3>
          <Button 
          
            size="sm" 
            className='createbtn'
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <FaPlus className="me-1" /> Add Food Category
          </Button>
        </Card.Header>
        <Card.Body className="admin-common-card-body">
          {foodCategories.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No food categories found. Add a category to get started.</p>
            </div>
          ) : (
          <Table responsive>
  <thead>
    <tr>
      <th>Icon</th>
      <th>Name</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {foodCategories.map((category) => (
      <tr key={category._id}>
        <td>
        
            <img
              src={category.icon && category.icon.startsWith('blob:') ? category.icon : getImageUrl(category.icon)}
              alt={category.name}
              style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }}
              className='categoryName'
            />
        </td>
        <td>{category.name}</td>
        <td>
          <Switch
            checked={category.isActive}
            onChange={() => handleToggleStatus(category._id, category.isActive)}
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
            className="btn btn-outline-secondary editFoodCategoryBtn"
            onClick={() => handleEdit(category)}
            title="Edit"
            type="button"
          >
            <FaPencil />
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={() => handleDelete(category._id)}
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

      {/* Add/Edit Modal */}
     <Modal show={showModal} onHide={resetForm} centered>
  <Modal.Header closeButton>
    <Modal.Title>
      {editingCategory ? 'Edit Food Category' : 'Add New Food Category'}
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Category Name</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Category Icon (Keep Ratio 1:1)</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required={!editingCategory && !hasProcessedImage}
        />
        {formData.icon && (
          <div className="mt-2 text-success small">
            ✓ Image processed and ready to upload
          </div>
        )}
        {previewUrl && (
          <div className="mt-2">
            <img
              src={previewUrl && previewUrl.startsWith('blob:') ? previewUrl : getImageUrl(previewUrl)}
              alt="Preview"
              style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }}
            />
          </div>
        )}
      </Form.Group>
      <div className="d-flex justify-content-end">
        <Button variant="secondary" className="me-2 CancelFoodCategoryBtn" onClick={resetForm} type="button">
          <span style={{ fontSize: 18, verticalAlign: 'middle' }}>✗</span> Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={loading} className='SaveFoodCategoryBtn'>
          <span style={{ fontSize: 18, verticalAlign: 'middle' }}>✓</span> Save
        </Button>
      </div>
    </Form>
  </Modal.Body>
</Modal>

      {/* Image Crop Modal */}
      <ImageCropModal
        show={showCropModal}
        onHide={() => setShowCropModal(false)}
        onSave={handleCroppedImageSave}
        originalImage={originalImageForCrop}
        aspectRatio={1}
      />
    </div>
  );
};

export default FoodCategoryManagement;