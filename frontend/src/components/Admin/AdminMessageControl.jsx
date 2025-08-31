import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { FaPencil } from 'react-icons/fa6';
import { getMessages, updateMessages } from '../../api/admin.js';
import '../../styles/AdminMessageControl.css';
import '../../styles/AdminCommon.css';

const AdminMessageControl = ({ isStandalone = true }) => {
  const [messages, setMessages] = useState({
    noItemsText: '',
    noCategoryText: '',
    loadingText: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempValues, setTempValues] = useState({});

  // Load messages on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages();
      
      if (data.success) {
        setMessages(data.data);
      } else {
        setError('Failed to load messages');
      }
    } catch (err) {
      setError('Error loading messages: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setTempValues({ ...tempValues, [field]: messages[field] });
  };

  const handleCancel = (field) => {
    setEditingField(null);
    setTempValues({ ...tempValues, [field]: messages[field] });
  };

  const handleSave = async (field) => {
    try {
      setSaving(true);
      setError(null);
      
      const updateData = {
        [field]: tempValues[field]
      };
      
      const data = await updateMessages(updateData);
      
      if (data.success) {
        setMessages(prev => ({ ...prev, [field]: tempValues[field] }));
        setEditingField(null);
        setSuccess(`${getFieldLabel(field)} updated successfully!`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to update message');
      }
    } catch (err) {
      setError('Error updating message: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setTempValues({ ...tempValues, [field]: value });
  };

  const getFieldLabel = (field) => {
    const labels = {
      noItemsText: 'No Items Message',
      noCategoryText: 'No Categories Message',
      loadingText: 'Loading Message'
    };
    return labels[field] || field;
  };

  const getFieldDescription = (field) => {
    const descriptions = {
      noItemsText: 'Message shown when no menu items are available in a category',
      noCategoryText: 'Message shown when no categories are available',
      loadingText: 'Message shown while content is loading'
    };
    return descriptions[field] || '';
  };

  if (loading) {
    return (
      <div className={isStandalone ? 'admin-common-container' : ''}>
        <div className="admin-common-loading">
          <Spinner animation="border" variant="primary" size="lg" />
        </div>
      </div>
    );
  }

  const messageFields = [
    { key: 'noItemsText', label: 'No Items Message', description: 'Message shown when no menu items are available in a category' },
    { key: 'noCategoryText', label: 'No Categories Message', description: 'Message shown when no categories are available' },
    { key: 'loadingText', label: 'Loading Message', description: 'Message shown while content is loading' }
  ];

  return (
    <div className={isStandalone ? 'admin-common-container' : ''}>
      <div className="alert-container">
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
            {success}
          </Alert>
        )}
      </div>

      <Card className="admin-common-card">
        <Card.Header className="admin-common-card-header">
          <h3 className="admin-common-section-title">Custom Messages</h3>
        </Card.Header>
        <Card.Body className="admin-common-card-body">
          <div className="message-table-container">
            <Table className="message-table">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Message Type</th>
                  <th style={{ minWidth: '40%' }}>Current Value</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messageFields.map((field) => (
                  <tr key={field.key}>
                    <td className="message-type-cell">
                      <div className="py-2">
                        <div className="message-label">{field.label}</div>
                        <div className="message-description">{field.description}</div>
                      </div>
                    </td>
                    <td className="message-value-cell">
                      <div className="py-2">
                        <div className="message-display">
                          "{messages[field.key] || 'Not set'}"
                        </div>
                      </div>
                    </td>
                    <td className="action-cell">
                      {editingField !== field.key && (
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(field.key)}
                          title="Edit"
                          type="button"
                        >
                          <FaPencil />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      {editingField && (
        <div className="modal-overlay" onClick={() => setEditingField(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Edit {getFieldLabel(editingField)}</h4>
              <button className="close-btn" onClick={() => setEditingField(null)}>×</button>
            </div>
            <div className="modal-body">
              <p className="field-description">{getFieldDescription(editingField)}</p>
              <textarea
                value={tempValues[editingField] || ''}
                onChange={(e) => handleInputChange(editingField, e.target.value)}
                placeholder={`Enter ${getFieldLabel(editingField).toLowerCase()}`}
                className="modal-textarea"
                rows="3"
              />
            </div>
            <div className="modal-footer">
              <button
                className="save-btn"
                onClick={() => handleSave(editingField)}
                disabled={saving}
              >
                ✓ {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditingField(null)}
                disabled={saving}
              >
                ✗ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessageControl;