import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { fetchFoodCategories } from '../../api/customer';
import Swal from 'sweetalert2';

const OfferItemForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    category: initialData?.category || ''
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
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please provide item name and price',
        confirmButtonColor: '#c7281c'
      });
      return;
    }
    
    setLoading(true);

    try {
      const newItem = {
        _id: `temp_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category
      };
      
      if (onSubmit) {
        await onSubmit(newItem);
      }
      
      setFormData({ name: '', description: '', price: '', category: '' });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.message || 'Failed to create item',
        confirmButtonColor: '#c7281c'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded p-2 p-md-3 bg-light mb-3">
      <h6 className="mb-2 mb-md-3">Create New Item</h6>
      <Row className="g-2">
        <Col sm={6}>
          <Form.Control
            type="text"
            placeholder="Item name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mb-2"
          />
        </Col>
        <Col sm={6}>
          <Form.Control
            type="number"
            placeholder="Price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="mb-2"
          />
        </Col>
      </Row>
      <Form.Control
        as="textarea"
        rows={2}
        placeholder="Description (optional)"
        name="description"
        value={formData.description}
        onChange={handleChange}
        className="mb-2"
      />
      <Form.Select
        name="category"
        value={formData.category}
        onChange={handleChange}
        className="mb-2"
      >
        <option value="">Select category</option>
        {foodCategories.map(category => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </Form.Select>
      <div className="d-flex flex-column flex-sm-row gap-2">
        <Button 
          variant="success" 
          size="sm"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-fill flex-sm-grow-0"
        >
          {loading ? 'Adding...' : 'Add Item'}
        </Button>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={onCancel}
          className="flex-fill flex-sm-grow-0"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default OfferItemForm;