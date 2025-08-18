import React from 'react';
import { ListGroup, Badge, Button } from 'react-bootstrap';

const OfferItem = ({ offer, index, onEdit, onRemove, eventId }) => (
  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center border-start-0 border-end-0 py-3">
    <div>
      <strong className="fs-5">{offer.name}</strong>
      <p className="mb-1 text-muted small">{offer.description}</p>
      <div className="mt-2">
        <Badge bg="secondary" className="me-2 px-3 py-2">Regular: ₹{(Number(offer.regularPrice) || 0).toFixed(2)}</Badge>
        <Badge bg="success" className="px-3 py-2">Offer: ₹{(Number(offer.offerPrice) || 0).toFixed(2)}</Badge>
      </div>
      <div className="mt-2">
        <small className="text-primary">
          Items: {offer.itemDetails && offer.itemDetails.length > 0 ? offer.itemDetails.map((item, index) => (
            <span key={item._id || item.id || index}>
              {item.name}
              {item.quantity > 1 && <span className="fw-bold"> x{item.quantity}</span>}
              {item.eventSpecific && <Badge bg="info" className="ms-1 me-1" size="sm">Event</Badge>}
              {index < offer.itemDetails.length - 1 ? ', ' : ''}
            </span>
          )) : offer.items && offer.items.length > 0 ? offer.items.map((item, index) => {
            const itemObj = typeof item === 'object' ? item : { itemId: item };
            return (
              <span key={index}>
                {itemObj.name || `Item ${index+1}`}
                {itemObj.quantity > 1 && <span className="fw-bold"> x{itemObj.quantity}</span>}
                {index < offer.items.length - 1 ? ', ' : ''}
              </span>
            );
          }) : 'No items'}
        </small>
      </div>
    </div>
    <div>
      <Button 
        variant="outline-primary" 
        size="sm" 
        className="me-2"
        onClick={() => onEdit(index, eventId)}
      >
        Edit
      </Button>
      <Button 
        variant="outline-danger" 
        size="sm"
        onClick={() => onRemove(index, eventId)}
      >
        Remove
      </Button>
    </div>
  </ListGroup.Item>
);

OfferItem.defaultProps = {
  eventId: null
};

export default React.memo(OfferItem);