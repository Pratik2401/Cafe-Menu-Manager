import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Card, Row, Col, Table, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaCog, FaPlus, FaTrash, FaEdit, FaSave, FaShareAlt, FaPalette, FaComments } from 'react-icons/fa';
import Swal from 'sweetalert2';

import { FaPencil } from "react-icons/fa6";
import { useBreadcrumb } from './AdminBreadcrumbContext';
import { 
  fetchCafeSettings, 
  updateCafeSettings, 
  fetchTables, 
  createTable, 
  updateTable, 
  deleteTable, 
  toggleTableStatus
} from '../../api/admin';
import AdminSocialControl from './AdminSocialControl';
import MenuCustomization from './AdminMenuCustomization';
import AdminMessageControl from './AdminMessageControl';
import '../../styles/AdminControls.css';

const AdminControls = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  
  // State for cafe settings
  const [cafeDetails, setCafeDetails] = useState({
    name: '',
  });
  const [isEditingCafeName, setIsEditingCafeName] = useState(false);
const [prevCafeName, setPrevCafeName] = useState('');

useEffect(() => {
  if (isEditingCafeName) setPrevCafeName(cafeDetails.name);
}, [isEditingCafeName]);
  // State for tables
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState({ name: '', status: true });
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [activeSection, setActiveSection] = useState('cafe');

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetchCafeSettings();
        setCafeDetails({ name: response.data.name });
      } catch (err) {
        setError('Failed to load cafe settings. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Update breadcrumb based on active section
  useEffect(() => {
    const sectionLabels = {
      'cafe': 'Cafe Details',
      'tables': 'Table Management',
      'social': 'Social Media',
      'menu-customization': 'Menu Customization',
      'messages': 'Messages',
      'tax': 'Tax Settings',
      'ordering': 'Ordering Settings',
      'location': 'Location Settings'
    };
    
    updateBreadcrumb([
      { label: 'Admin Controls' },
      { label: sectionLabels[activeSection] || 'Settings' }
    ]);
  }, [activeSection, updateBreadcrumb]);

  // Handle cafe details change
  const handleCafeDetailsChange = (field, value) => {
    setCafeDetails({ ...cafeDetails, [field]: value });
  };

  // Save cafe settings
const handleSaveCafeSettings = async () => {
  setLoading(true);
  try {
    await updateCafeSettings(cafeDetails);
    setSuccess('Cafe name updated successfully!');
    setIsEditingCafeName(false); // Exit edit mode
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    setError('Failed to update cafe name. Please try again.');
    console.error(err);
  } finally {
    setLoading(false);
  }
};
  // Handle table status toggle
  const handleTableStatusToggle = async (tableId, currentStatus) => {
    try {
      await toggleTableStatus(tableId, !currentStatus);
      setTables(tables.map(table => 
        table.id === tableId ? { ...table, status: !currentStatus } : table
      ));
    } catch (err) {
      setError('Failed to update table status. Please try again.');
      console.error(err);
    }
  };

  // Handle delete table
  const handleDeleteTable = async (tableId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this table?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
      try {
        await deleteTable(tableId);
        setTables(tables.filter(table => table.id !== tableId));
        Swal.fire('Deleted!', 'Table deleted successfully!', 'success');
      } catch (err) {
        Swal.fire('Error!', 'Failed to delete table. Please try again.', 'error');
        console.error(err);
      }
    }
  };

  // Handle add/edit table
  const handleTableSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingTable) {
        // Update existing table
        await updateTable(editingTable.id, newTable);
        setTables(tables.map(table => 
          table.id === editingTable.id ? { ...table, ...newTable } : table
        ));
        setSuccess('Table updated successfully!');
      } else {
        // Create new table
        const createdTable = await createTable(newTable);
        setTables([...tables, createdTable]);
        setSuccess('Table added successfully!');
      }
      
      // Reset form and close modal
      setNewTable({ name: '', status: true });
      setEditingTable(null);
      setShowTableModal(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save table. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Open edit table modal
  const handleEditTable = (table) => {
    setEditingTable(table);
    setNewTable({ name: table.name, status: table.status });
    setShowTableModal(true);
  };



  if (loading) {
    return (
      <div className="admin-controls d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" size="lg" />
      </div>
    );
  }

  return (
    <div className="admin-controls">
      
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

   
      <div className="admin-navigation mb-4">
        <Row>
          <Col>
            <Button 
              variant={activeSection === 'cafe' ? 'primary' : 'outline-primary'} 
              className="me-2 mb-2"
              onClick={() => setActiveSection('cafe')}
            >
              <FaCog className="me-2" /> Cafe Details
            </Button>
            {/* <Button 
              variant={activeSection === 'tables' ? 'primary' : 'outline-primary'} 
              className="me-2 mb-2"
              onClick={() => setActiveSection('tables')}
            >
              <FaTable className="me-2" /> Tables
            </Button> */}

            <Button 
              variant={activeSection === 'social' ? 'primary' : 'outline-primary'} 
              className="me-2 mb-2"
              onClick={() => setActiveSection('social')}
            >
              <FaShareAlt className="me-2" /> Social Media
            </Button>

            <Button 
              variant={activeSection === 'menu-customization' ? 'primary' : 'outline-primary'} 
              className="me-2 mb-2"
              onClick={() => setActiveSection('menu-customization')}
            >
              <FaPalette className="me-2" /> Menu Customize
            </Button>
            <Button 
              variant={activeSection === 'messages' ? 'primary' : 'outline-primary'} 
              className="me-2 mb-2"
              onClick={() => setActiveSection('messages')}
            >
              <FaComments className="me-2" /> Messages
            </Button>

            
          </Col>
        </Row>
      </div>

      {activeSection === 'cafe' && (
        <div className="admin-section">
          <Card>
            <Card.Header>
                <h3 className="section-title">Cafe Details</h3>
              
            </Card.Header>
            <Card.Body>
              <Form>
<Form.Group className="mb-3 position-relative">
  <Form.Label>Cafe Name</Form.Label>
  <div className="edit-input-group">
    <Form.Control
      type="text"
      value={cafeDetails.name}
      onChange={(e) => handleCafeDetailsChange('name', e.target.value)}
      disabled={!isEditingCafeName}
      className={isEditingCafeName ? 'editable' : ''}
    />
    {!isEditingCafeName && (
      <span
        className="edit-icon"
        onClick={() => setIsEditingCafeName(true)}
        tabIndex={0}
        role="button"
        aria-label="Edit Cafe Name"
      >
        <FaPencil size={16} />
      </span>
    )}
  </div>
  {isEditingCafeName && (
    <div className="edit-footer-btns">
      <Button
        variant="danger"
        className="me-2 edit-cancel-btn"
        onClick={() => {
          setCafeDetails({ ...cafeDetails, name: prevCafeName });
          setIsEditingCafeName(false);
        }}
      >
        <span style={{ fontSize: 18, verticalAlign: 'middle' }}>✗</span> Cancel
      </Button>
      <Button
        variant="success"
        className="edit-save-btn"
        onClick={handleSaveCafeSettings}
        disabled={loading}
      >
        <span style={{ fontSize: 18, verticalAlign: 'middle' }}>✓</span> Save
      </Button>
    </div>
  )}
</Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </div>
      )}

   
      {activeSection === 'social' && (
        <div className="admin-section">
          <AdminSocialControl isStandalone={false} />
        </div>
      )}
      
      {activeSection === 'menu-customization' && (
        <div className="admin-section">
          <MenuCustomization isStandalone={false} />
        </div>
      )}
      
      {activeSection === 'messages' && (
        <div className="admin-section">
          <AdminMessageControl isStandalone={false} />
        </div>
      )}

    </div>
  );
};

export default AdminControls;