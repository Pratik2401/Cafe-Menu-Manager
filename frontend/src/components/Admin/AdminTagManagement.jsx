import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaToggleOn } from 'react-icons/fa';
import { fetchTags, createTag, updateTag, deleteTag, toggleTagStatus } from '../../api/admin';
import { useBreadcrumb } from './AdminBreadcrumbContext';
import ImageCropModal from '../utils/ImageCropModal';
import '../../styles/TagManagement.css';
import { FaPencil,FaRegTrashCan } from "react-icons/fa6";
import Switch from "react-switch";
import Swal from 'sweetalert2';

const TagManagement = ({ isStandalone = true }) => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [tags, setTags] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#E3F2FD',
    image: '',
    useImage: false
  });
  const [hasProcessedImage, setHasProcessedImage] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImageForCrop, setOriginalImageForCrop] = useState(null);

  // Available colors
  const availableColors = [
    '#E3F2FD', '#1565C0',
    '#FFF3E0', '#EF6C00',
    '#FFEBEE', '#C62828',
    '#E8F5E9', '#2E7D32',
    '#F3E5F5', '#6A1B9A',
    '#F9FBE7', '#9E9D24'
  ];

  // Load tags on component mount
  useEffect(() => {
    // Set breadcrumb only if standalone
    if (isStandalone) {
      updateBreadcrumb([
        { label: 'Admin Controls' },
        { label: 'Tag Management' }
      ]);
    }
    loadTags();
  }, [updateBreadcrumb, isStandalone]);

  const loadTags = async () => {
    setLoading(true);
    try {
      const response = await fetchTags();
      // Extract tags from the data property and ensure it's an array
      const tagsData = response?.data || [];
      setTags(Array.isArray(tagsData) ? tagsData : []);
    } catch (err) {
      setError('Failed to load tags');
      setTags([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleColorSelect = (color) => {
    setFormData({ ...formData, color, useImage: false, image: '' });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setOriginalImageForCrop(imageUrl);
      setShowCropModal(true);
    }
    e.target.value = '';
  };

  const handleCroppedImageSave = (croppedBlob) => {
    // console.log('TagManagement: Received blob:', croppedBlob);
    if (!croppedBlob) {
      console.error('TagManagement: No blob received');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData({ ...formData, image: event.target.result, useImage: true, color: '' });
      setHasProcessedImage(true);
    };
    reader.readAsDataURL(croppedBlob);
    setShowCropModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = {
        name: formData.name,
        ...(formData.useImage ? { image: formData.image } : { color: formData.color })
      };

      if (editingTag) {
        await updateTag(editingTag._id, submitData);
        setSuccess('Tag updated successfully');
      } else {
        await createTag(submitData);
        setSuccess('Tag created successfully');
      }
      
      resetForm();
      loadTags();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save tag');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color || '#E3F2FD',
      image: tag.image || '',
      useImage: !!tag.image
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this tag?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
      setLoading(true);
      try {
        await deleteTag(id);
        Swal.fire('Deleted!', 'Tag deleted successfully', 'success');
        loadTags();
      } catch (err) {
        Swal.fire('Error!', 'Failed to delete tag', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    // Optimistically update UI first
    setTags(prev => 
      prev.map(tag => 
        tag._id === id ? {...tag, isActive: !currentStatus} : tag
      )
    );
    
    try {
      await toggleTagStatus(id);
      // No need to reload or show success message for toggle operations
    } catch (err) {
      // Revert on error
      setError('Failed to update tag status');
      setTags(prev => 
        prev.map(tag => 
          tag._id === id ? {...tag, isActive: currentStatus} : tag
        )
      );
      // Reload to ensure data consistency
      loadTags();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#E3F2FD',
      image: '',
      useImage: false
    });
    setHasProcessedImage(false);
    setEditingTag(null);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="tag-management d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" size="lg" />
      </div>
    );
  }

  return (
    <div className="tag-management">
      
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

      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h3>Tags</h3>
            <Button 
              className='CreateTag'
              size="sm" 
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <FaPlus className="me-1" /> Add Tag
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {tags.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No tags found. Add a tag to get started.</p>
            </div>
          ) : (
            <Table responsive bordered hover className='TagTable' style={{minWidth: '600px'}}>
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag) => (
                  <tr key={tag._id}>
                    <td>
                      {tag.image ? (
                        <img 
                          src={tag.image} 
                          alt={tag.name}
                          style={{ 
                            width: '30px', 
                            height: '30px', 
                            objectFit: 'cover',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                          }} 
                        />
                      ) : (
                        <div 
                          style={{ 
                            width: '30px', 
                            height: '30px', 
                            backgroundColor: tag.color,
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                          }} 
                        />
                      )}
                    </td>
                    <td>{tag.name}</td>
                   <td>
  <Switch
    onChange={() => handleToggleStatus(tag._id, tag.isActive)}
    checked={tag.isActive === true}
    checkedIcon={
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        fontSize: 10,
        color: "#fff",
        paddingLeft: 2
      }}>Active</div>
    }
    uncheckedIcon={
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        fontSize: 10,
        color: "#fff",
        paddingRight: 2
      }}>Inactive</div>
    }
    onColor="#64E239"
    offColor="#545454"
    height={28}
    width={80}
    handleDiameter={24}
  />
</td>
                    <td>
                      <div className="d-flex flex-nowrap gap-1">
                        <Button 
                          variant="outline-secondary EditTagBtn" 
                          size="sm" 
                          onClick={() => handleEdit(tag)}
                        >
                          <FaPencil />
                        </Button>
                        <Button 
                          variant="outline-danger DelTagBtn" 
                          size="sm"
                          onClick={() => handleDelete(tag._id)}
                        >
                          <FaRegTrashCan />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>{editingTag ? 'Edit Tag' : 'Add New Tag'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tag Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Tag Type</Form.Label>
              <div className="mb-2">
                <Form.Check
                  type="radio"
                  id="use-color"
                  name="tagType"
                  label="Use Color"
                  checked={!formData.useImage}
                  onChange={() => setFormData({ ...formData, useImage: false, image: '' })}
                />
                <Form.Check
                  type="radio"
                  id="use-image"
                  name="tagType"
                  label="Use Image"
                  checked={formData.useImage}
                  onChange={() => setFormData({ ...formData, useImage: true, color: '' })}
                />
              </div>
            </Form.Group>

            {!formData.useImage && (
              <Form.Group className="mb-3">
                <Form.Label>Tag Color</Form.Label>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  {availableColors.map((color) => (
                    <div
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: color,
                        border: formData.color === color ? '2px solid black' : '1px solid #ddd',
                        borderRadius: '50%',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </Form.Group>
            )}

            {formData.useImage && (
              <Form.Group className="mb-3">
                <Form.Label>Tag Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {formData.image && (
                  <div className="mt-2">
                    <div className="text-success small mb-2">
                      ✓ Image processed and ready to upload
                    </div>
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </Form.Group>
            )}
            
            <div className="d-flex justify-content-end">
              <Button  className="me-2 CancelBtn" onClick={resetForm}>
                Cancel
              </Button>
              <Button className='SubmitBtn' type="submit" disabled={loading}>
                {editingTag ? 'Save' : 'Add'} 
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
        aspectRatio={1} // Square 1:1 for tag icons
      />
    </div>
  );
};

export default TagManagement;