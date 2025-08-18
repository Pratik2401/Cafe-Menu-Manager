import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { fetchFoodCategories } from '../../api/customer';

const ItemCategory = ({ value, onChange, name = "itemCategory", required = false }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetchFoodCategories();
      const categoryOptions = response.map(cat => ({
        value: cat._id,
        label: cat.name
      }));
      setCategories(categoryOptions);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <Form.Select
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      disabled={loading}
    >
      <option value="">Select Category</option>
      {categories.map(category => (
        <option key={category.value} value={category.value}>
          {category.label}
        </option>
      ))}
    </Form.Select>
  );
};

export default ItemCategory;