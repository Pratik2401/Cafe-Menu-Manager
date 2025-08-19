import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Table } from 'react-bootstrap';
import { FaPlus, FaTrash, FaImage } from 'react-icons/fa';
import Switch from 'react-switch';
import { getImageUploads, createImageUpload, deleteImageUpload, toggleImageUploadVisibility } from '../../api/admin';
import { getImageUrl } from '../../utils/imageUrl';

const AdminImageUploadPage = () => {
  const [imageUploads, setImageUploads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    message: '',
    image: null
  });

  useEffect(() => {
    fetchImageUploads();
  }, []);

  const fetchImageUploads = async () => {
    try {
      const response = await getImageUploads();
      setImageUploads(response);
    } catch (error) {
      showAlert('Failed to fetch image uploads', 'danger');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message || !formData.image) {
      showAlert('Please provide both message and image', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('message', formData.message);
      data.append('image', formData.image);

      await createImageUpload(data);

      showAlert('Image upload created successfully', 'success');
      setShowModal(false);
      setFormData({ message: '', image: null });
      fetchImageUploads();
    } catch (error) {
      showAlert('Failed to create image upload', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image upload?')) return;

    try {
      await deleteImageUpload(id);
      showAlert('Image upload deleted successfully', 'success');
      fetchImageUploads();
    } catch (error) {
      showAlert('Failed to delete image upload', 'danger');
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      await toggleImageUploadVisibility(id);
      showAlert('Visibility toggled successfully', 'success');
      fetchImageUploads();
    } catch (error) {
      showAlert('Failed to toggle visibility', 'danger');
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2><FaImage className="me-2" />Image Uploads</h2>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaPlus className="me-2" />Add Image Upload
            </Button>
          </div>
        </Col>
      </Row>

      {alert.show && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: '' })}>
          {alert.message}
        </Alert>
      )}

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Message</th>
                    <th>Created</th>
                    <th>Visible</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {imageUploads.map((upload) => (
                    <tr key={upload._id}>
                      <td>
                        <img 
                          src={getImageUrl(upload.imageUrl)} 
                          alt="Upload" 
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </td>
                      <td>{upload.message}</td>
                      <td>{new Date(upload.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Switch
                          checked={upload.isVisible}
                          onChange={() => handleToggleVisibility(upload._id)}
                          onColor="#28a745"
                          offColor="#dc3545"
                          height={20}
                          width={40}
                        />
                      </td>
                      <td>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(upload._id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {imageUploads.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">No image uploads found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Image Upload</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                type="text"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminImageUploadPage;