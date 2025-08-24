import React, { useState, useEffect, Fragment } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { ArrowLeft, Upload } from 'react-bootstrap-icons';
import { createSocial, updateSocial } from '../../api/admin';
import { getImageUrl } from '../../utils/imageUrl';
import ImageCropModal from '../utils/ImageCropModal';

const AdminSocialForm = ({ social, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    isVisible: true
  });
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (social) {
      setFormData({
        name: social.name || '',
        url: social.url || '',
        isVisible: social.isVisible !== undefined ? social.isVisible : true
      });
      if (social.icon) {
        setIconPreview(getImageUrl(social.icon));
      }
    }
  }, [social]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Icon size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = (croppedBlob) => {
    setIconFile(croppedBlob);
    const reader = new FileReader();
    reader.onload = (e) => setIconPreview(e.target.result);
    reader.readAsDataURL(croppedBlob);
    setShowCropModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!formData.url.trim()) {
      setError('URL is required');
      return;
    }
    
    if (!social && !iconFile) {
      setError('Icon is required for new social media');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('url', formData.url.trim());
      submitData.append('isVisible', formData.isVisible);
      
      if (iconFile) {
        submitData.append('icon', iconFile);
      }

      if (social) {
        await updateSocial(social._id, submitData);
      } else {
        await createSocial(submitData);
      }
      
      onSuccess();
    } catch (err) {
      console.error('Error saving social media:', err);
      setError(err.response?.data?.message || 'Failed to save social media. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <Card className="border-0">
      <Card.Header className="d-flex align-items-center bg-primary text-white">
        <h5 className="mb-0">
          {social ? 'Edit Social Media' : 'Add New Social Media'}
        </h5>
        <Button 
          variant="outline-light" 
          size="sm" 
          onClick={onCancel}
          className="ms-auto"
        >
          ×
        </Button>
      </Card.Header>
        
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Instagram, Facebook, Twitter"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>URL *</Form.Label>
                  <Form.Control
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="isVisible"
                    checked={formData.isVisible}
                    onChange={handleInputChange}
                    label="Visible to customers"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Icon {!social && '*'}</Form.Label>
                  <div className="d-flex flex-column align-items-center">
                    {iconPreview && (
                      <div className="mb-3">
                        <img 
                          src={iconPreview.startsWith('data:') ? iconPreview : getImageUrl(iconPreview)} 
                          alt="Icon preview"
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            objectFit: 'cover', 
                            borderRadius: '12px',
                            border: '2px solid #dee2e6'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleIconChange}
                      className="mb-2"
                    />
                    
                    <small className="text-muted text-center">
                      Upload a square icon (recommended: 100x100px)<br/>
                      Max size: 5MB
                    </small>
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Saving...' : (social ? 'Update' : 'Create')}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      
      <ImageCropModal
        show={showCropModal}
        onHide={() => setShowCropModal(false)}
        originalImage={originalImage}
        onSave={handleCropSave}
        aspectRatio={1}
      />
    </Fragment>
  );
};

export default AdminSocialForm;