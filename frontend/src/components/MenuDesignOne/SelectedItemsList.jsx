import React from 'react';
import { Form, ListGroup, Button, Badge } from 'react-bootstrap';
import { XCircleFill } from 'react-bootstrap-icons';

const SelectedItemsList = ({ items, onRemoveItem }) => {
  if (!items || items.length === 0) return null;
  
  return (
    <div className="mb-4">
      <Form.Label>Selected Items <Badge bg="primary">{items.length}</Badge></Form.Label>
      <ListGroup variant="flush" className="border rounded" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
        {items.map((item, index) => (
          <ListGroup.Item key={item._id || `item-${index}`} className="py-2">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
              <div className="mb-2 mb-sm-0 flex-grow-1 pe-sm-2">
                <div className="fw-medium text-truncate">{item.name || `Item ${index + 1}`}</div>
                {item.eventSpecific && <Badge bg="info" className="mt-1" size="sm">Event</Badge>}
              </div>
              <div className="d-flex align-items-center flex-shrink-0">
                <Form.Control
                  type="number"
                  min="1"
                  className="me-2"
                  style={{ width: '50px', minWidth: '50px', fontSize: '0.875rem' }}
                  value={item.quantity || 1}
                  onChange={(e) => {
                    item.quantity = parseInt(e.target.value);
                    // Force re-render
                    onRemoveItem(null, true);
                  }}
                />
                <span className="me-2 text-success text-nowrap">₹{(typeof item.price === 'number' ? item.price : parseFloat(item.price || item.itemPrice || 0)).toFixed(2)}</span>
                <Button 
                  variant="link" 
                  className="text-danger p-0 flex-shrink-0"
                  onClick={() => onRemoveItem(item._id)}
                >
                  <XCircleFill size={16} />
                </Button>
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default React.memo(SelectedItemsList);