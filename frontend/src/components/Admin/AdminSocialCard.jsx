import React, { useState } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { Pencil, GripVertical } from 'react-bootstrap-icons';
import { getImageUrl } from '../../utils/imageUrl';

const AdminSocialCard = ({ 
  social, 
  onEdit, 
  onDelete, 
  onToggleVisibility,
  isDragging = false,
  dragHandleProps = {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(social.url);

  const handleSave = () => {
    onEdit({ ...social, url: editValue });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(social.url);
    setIsEditing(false);
  };

  return (
    <Card className={`social-grid-card ${isDragging ? 'dragging' : ''}`}>
      <Card.Body className="text-center p-3">
        <div 
          {...dragHandleProps}
          className="drag-handle-grid"
          style={{ cursor: 'grab' }}
        >
          <GripVertical size={16} className="text-muted" />
        </div>
        
        <div className="social-icon-grid mb-3">
          <img 
            src={getImageUrl(social.icon)} 
            alt={social.name}
            className="social-icon-img"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        
        <h6 className="social-title mb-3">{social.name}</h6>
        
        {isEditing ? (
          <div className="mb-3">
            <Form.Control
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="mb-2"
              size="sm"
            />
            <div className="d-flex gap-2 justify-content-center">
              <Button 
                variant="danger" 
                size="sm" 
                onClick={handleCancel}
                className="social-btn-cancel"
              >
                Cancel
              </Button>
              <Button 
                variant="success" 
                size="sm" 
                onClick={handleSave}
                className="social-btn-save"
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <div className="social-url-display">
              <span className="social-url-text">{social.url}</span>
              <Button
                variant="link"
                size="sm"
                className="p-0 ms-2"
                onClick={() => setIsEditing(true)}
                title="Edit URL"
              >
                <Pencil size={14} />
              </Button>
            </div>
          </div>
        )}
        
        <div className="social-toggle">
          <Form.Check
            type="switch"
            id={`social-switch-${social._id}`}
            label="Show"
            checked={social.isVisible}
            onChange={(e) => onToggleVisibility(social._id, e.target.checked)}
            className="social-switch"
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default AdminSocialCard;