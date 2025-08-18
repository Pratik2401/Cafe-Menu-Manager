import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Form, 
  Card, 
  Table, 
  Badge, 
  Spinner, 
  Alert,
  Row,
  Col
} from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { fetchAllSizes, addSizeToItem, removeSizeFromItem } from '../../api/customer';

const ItemSizeSelector = ({ itemId, initialSizes = [] }) => {
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState(initialSizes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sizePrice, setSizePrice] = useState('');
  const [selectedSizeId, setSelectedSizeId] = useState('');

  // Load all available sizes on component mount
  useEffect(() => {
    loadSizes();
  }, []);

  const loadSizes = async () => {
    setLoading(true);
    try {
      const response = await fetchAllSizes();
      if (response.success) {
        setAvailableSizes(response.data);
      } else {
        setError(response.message || 'Failed to fetch sizes');
      }
    } catch (err) {
      setError('Error loading sizes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a size to the item
  const handleAddSize = async () => {
    if (!selectedSizeId || !sizePrice || isNaN(parseFloat(sizePrice))) {
      setError('Please select a size and enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const response = await addSizeToItem(itemId, selectedSizeId, { price: parseFloat(sizePrice) });
      if (response.success) {
        // Find the size details from available sizes
        const addedSize = availableSizes.find(size => size._id === selectedSizeId);
        if (addedSize) {
          setSelectedSizes([...selectedSizes, {
            ...addedSize,
            price: parseFloat(sizePrice)
          }]);
        }
        // Reset form
        setSelectedSizeId('');
        setSizePrice('');
      } else {
        setError(response.message || 'Failed to add size');
      }
    } catch (err) {
      setError('Error adding size to item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle removing a size from the item
  const handleRemoveSize = async (sizeId) => {
    setLoading(true);
    try {
      const response = await removeSizeFromItem(itemId, sizeId);
      if (response.success) {
        setSelectedSizes(selectedSizes.filter(size => size._id !== sizeId));
      } else {
        setError(response.message || 'Failed to remove size');
      }
    } catch (err) {
      setError('Error removing size from item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter out already selected sizes from available sizes
  const unselectedSizes = availableSizes.filter(
    size => !selectedSizes.some(selected => selected._id === size._id)
  );

  return (
    <Card className="mt-3">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Item Sizes and Prices 
            <Badge 
              bg={selectedSizes.length >= 4 ? "danger" : "primary"} 
              className="ms-2"
            >
              {selectedSizes.length}/4
            </Badge>
          </h5>
        </div>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" className="mb-3" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        {/* Selected Sizes Table */}
        <Table responsive bordered hover className="mb-3">
          <thead>
            <tr>
              <th>Size</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedSizes.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center">No sizes selected</td>
              </tr>
            ) : (
              selectedSizes.map((size) => (
                <tr key={size._id}>
                  <td>{size.name}</td>
                  <td>${parseFloat(size.price).toFixed(2)}</td>
                  <td>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleRemoveSize(size._id)}
                      disabled={loading}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* Add Size Form */}
        {selectedSizes.length < 4 && (
          <Row className="align-items-end">
            <Col md={5}>
              <Form.Group>
                <Form.Label>Select Size</Form.Label>
                <Form.Select
                  value={selectedSizeId}
                  onChange={(e) => setSelectedSizeId(e.target.value)}
                  disabled={loading || unselectedSizes.length === 0}
                >
                  <option value="">Select a size</option>
                  {unselectedSizes.map((size) => (
                    <option key={size._id} value={size._id}>
                      {size.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  value={sizePrice}
                  onChange={(e) => setSizePrice(e.target.value)}
                  disabled={loading || !selectedSizeId}
                  min="0"
                  step="0.01"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Button
                variant="primary"
                className="w-100"
                onClick={handleAddSize}
                disabled={loading || !selectedSizeId || !sizePrice}
              >
                <FaPlus className="me-2" /> Add Size
              </Button>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};

export default ItemSizeSelector;