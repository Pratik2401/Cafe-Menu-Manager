import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Pencil, Trash, Eye, EyeSlash, GripVertical } from 'react-bootstrap-icons';
import { getImageUrl } from '../../utils/imageUrl';

const AdminSocialCard = ({ 
  social, 
  onEdit, 
  onDelete, 
  onToggleVisibility,
  isDragging = false,
  dragHandleProps = {}
}) => {
  return (
    <Card className={`social-card ${isDragging ? 'dragging' : ''}`}>
      <Card.Body className="d-flex align-items-center">
        <div 
          {...dragHandleProps}
          className="drag-handle me-3"
          style={{ cursor: 'grab' }}
        >
          <GripVertical size={20} className="text-muted" />
        </div>
        
        <div className="social-icon me-3">
          <img 
            src={getImageUrl(social.icon)} 
            alt={social.name}
            style={{ 
              width: '40px', 
              height: '40px', 
              objectFit: 'cover', 
              borderRadius: '8px' 
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        
        <div className="flex-grow-1">
          <div className="d-flex align-items-center mb-1">
            <h6 className="mb-0 me-2">{social.name}</h6>
            <Badge bg={social.isVisible ? 'success' : 'secondary'}>
              {social.isVisible ? 'Visible' : 'Hidden'}
            </Badge>
          </div>
          <p className="text-muted mb-0 small" style={{ 
            wordBreak: 'break-all',
            maxWidth: '300px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {social.url}
          </p>
        </div>
        
        <div className="social-actions">
          <Button
            variant="outline-primary"
            size="sm"
            className="me-2"
            onClick={() => onToggleVisibility(social._id, !social.isVisible)}
            title={social.isVisible ? 'Hide' : 'Show'}
          >
            {social.isVisible ? <EyeSlash size={16} /> : <Eye size={16} />}
          </Button>
          
          <Button
            variant="outline-secondary"
            size="sm"
            className="me-2"
            onClick={() => onEdit(social)}
            title="Edit"
          >
            <Pencil size={16} />
          </Button>
          
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onDelete(social._id)}
            title="Delete"
          >
            <Trash size={16} />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AdminSocialCard;