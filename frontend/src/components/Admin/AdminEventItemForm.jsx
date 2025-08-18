import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { fetchFoodCategories } from '../../api/admin';
import Swal from 'sweetalert2';

const EventItemForm = ({ onSubmit, eventId, initialData = null }) => {
  const [formData, setFormData] = useState({
    itemName: initialData?.itemName || '',
    itemDescription: initialData?.itemDescription || '',
    itemPrice: initialData?.itemPrice || '',
    itemCategory: initialData?.itemCategory || '',
    eventId: eventId || initialData?.eventId || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [foodCategories, setFoodCategories] = useState([]);

  useEffect(() => {
    const loadFoodCategories = async () => {
      try {
        const categories = await fetchFoodCategories();
        setFoodCategories(categories);
      } catch (err) {
        console.error('Error loading food categories:', err);
      }
    };
    loadFoodCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateItem = async () => {
    // Only validate item name and price as minimum requirements
    if (!formData.itemName || !formData.itemPrice) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please provide at least item name and price',
        confirmButtonColor: '#c7281c'
      });
      return;
    }
    
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        itemPrice: parseFloat(formData.itemPrice)
      };
      
      if (onSubmit) {
        await onSubmit(submitData);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'System Error',
          text: 'Form submission handler is missing',
          confirmButtonColor: '#c7281c'
        });
        return;
      }
      
      // Reset form after successful submission
      if (!initialData) {
        setFormData({
          itemName: '',
          itemDescription: '',
          itemPrice: '',
          itemCategory: '',
          eventId: eventId || ''
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.message || 'Failed to save event item',
        confirmButtonColor: '#c7281c'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      
      <Row className="g-3">
        <Col xs={12} md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Item Name</Form.Label>
            <Form.Control
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              placeholder="Enter item name"
            />
          </Form.Group>
        </Col>
        <Col xs={12} md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              name="itemPrice"
              value={formData.itemPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Enter price"
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="itemDescription"
          value={formData.itemDescription}
          onChange={handleChange}
          placeholder="Enter item description (optional)"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Category</Form.Label>
        <Form.Select
          name="itemCategory"
          value={formData.itemCategory}
          onChange={handleChange}
        >
          <option value="">Select category</option>
          {foodCategories.map(category => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button 
          onClick={handleCreateItem}
          variant="primary" 
          disabled={loading}
        >
          {loading ? 'Saving...' : (initialData ? 'Update Item' : 'Create Item')}
        </Button>
      </div>
    </div>
  );
};

export default EventItemForm;