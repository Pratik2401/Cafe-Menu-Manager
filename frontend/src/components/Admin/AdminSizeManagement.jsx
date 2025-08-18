import React, { useState, useEffect } from 'react';
import { 
  fetchAllSizes, 
  createSize, 
  updateSize, 
  deleteSize 
} from '../../api/admin';
import { 
  Button, 
  Form, 
  Card, 
  Table, 
  Modal, 
  Spinner, 
  Alert 
} from 'react-bootstrap';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { useBreadcrumb } from './AdminBreadcrumbContext';
import '../../styles/AdminSizeManagement.css'
import { FaPencil,FaRegTrashCan } from "react-icons/fa6";
import Swal from 'sweetalert2';
import { Row, Col } from 'react-bootstrap';
const AdminSizeManagement = ({ isStandalone = true }) => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSize, setCurrentSize] = useState({ name: '', group: 'Default' });
  const [isEditing, setIsEditing] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [bulkSizes, setBulkSizes] = useState([{ name: '', group: 'Default' }]);
  const [bulkGroup, setBulkGroup] = useState('Default');
  const [groupedSizes, setGroupedSizes] = useState({});

  useEffect(() => {
    if (isStandalone) {
      updateBreadcrumb([
        { label: 'Admin Controls' },
        { label: 'Size Management' }
      ]);
    }
    loadSizes();
  }, [updateBreadcrumb, isStandalone]);

  const loadSizes = async () => {
    setLoading(true);
    try {
      const response = await fetchAllSizes();
      if (response.success) {
        setSizes(response.data);
        groupSizesByGroup(response.data);
      } else {
        setError(response.message || 'Failed to fetch sizes');
      }
    } catch (err) {
      setError('Error loading sizes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupSizesByGroup = (sizesData) => {
    const grouped = sizesData.reduce((acc, size) => {
      const group = size.group || 'Default';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(size);
      return acc;
    }, {});
    setGroupedSizes(grouped);
  };

  const handleOpenCreateDialog = () => {
    setCurrentSize({ name: '', group: 'Default' });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleOpenBulkDialog = () => {
    setBulkSizes([{ name: '', group: 'Default' }]);
    setBulkGroup('Default');
    setOpenBulkDialog(true);
  };

  const handleCloseBulkDialog = () => {
    setOpenBulkDialog(false);
    setBulkSizes([{ name: '', group: 'Default' }]);
    setBulkGroup('Default');
  };

  const handleOpenEditDialog = (size) => {
    setCurrentSize({ ...size });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSize({
      ...currentSize,
      [name]: value
    });
  };

  const handleBulkInputChange = (index, field, value) => {
    const updatedSizes = [...bulkSizes];
    updatedSizes[index][field] = value;
    setBulkSizes(updatedSizes);
  };

  const handleBulkGroupChange = (newGroup) => {
    setBulkGroup(newGroup);
    const updatedSizes = bulkSizes.map(size => ({ ...size, group: newGroup }));
    setBulkSizes(updatedSizes);
  };

  const addBulkSize = () => {
    setBulkSizes([...bulkSizes, { name: '', group: bulkGroup }]);
  };

  const removeBulkSize = (index) => {
    if (bulkSizes.length > 1) {
      setBulkSizes(bulkSizes.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isEditing) {
        const response = await updateSize(currentSize._id, currentSize);
        if (response.success) {
          const updatedSizes = sizes.map(size => 
            size._id === currentSize._id ? response.data : size
          );
          setSizes(updatedSizes);
          groupSizesByGroup(updatedSizes);
        } else {
          setError(response.message || 'Failed to update size');
        }
      } else {
        const response = await createSize(currentSize);
        if (response.success) {
          const updatedSizes = [...sizes, response.data];
          setSizes(updatedSizes);
          groupSizesByGroup(updatedSizes);
        } else {
          setError(response.message || 'Failed to create size');
        }
      }
      handleCloseDialog();
    } catch (err) {
      setError('Error saving size. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async () => {
    const validSizes = bulkSizes.filter(size => size.name.trim());
    if (validSizes.length === 0) {
      setError('Please enter at least one size name');
      return;
    }

    setLoading(true);
    try {
      const createdSizes = [];
      for (const size of validSizes) {
        const response = await createSize(size);
        if (response.success) {
          createdSizes.push(response.data);
        } else {
          setError(`Failed to create size: ${size.name}`);
          return;
        }
      }
      const updatedSizes = [...sizes, ...createdSizes];
      setSizes(updatedSizes);
      groupSizesByGroup(updatedSizes);
      handleCloseBulkDialog();
    } catch (err) {
      setError('Error creating sizes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sizeId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this size?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await deleteSize(sizeId);
        if (response.success) {
          const updatedSizes = sizes.filter(size => size._id !== sizeId);
          setSizes(updatedSizes);
          groupSizesByGroup(updatedSizes);
          Swal.fire('Deleted!', 'Size deleted successfully', 'success');
        } else {
          Swal.fire('Error!', response.message || 'Failed to delete size', 'error');
        }
      } catch (err) {
        Swal.fire('Error!', 'Error deleting size. Please try again.', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteGroup = async (groupName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete all sizes in the "${groupName}" group?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete all!'
    });
    
    if (result.isConfirmed) {
      setLoading(true);
      try {
        const sizesToDelete = groupedSizes[groupName] || [];
        for (const size of sizesToDelete) {
          await deleteSize(size._id);
        }
        const updatedSizes = sizes.filter(size => (size.group || 'Default') !== groupName);
        setSizes(updatedSizes);
        groupSizesByGroup(updatedSizes);
        Swal.fire('Deleted!', `All sizes in "${groupName}" group deleted successfully`, 'success');
      } catch (err) {
        Swal.fire('Error!', 'Error deleting group. Please try again.', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-section d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" size="lg" />
      </div>
    );
  }

  return (
    <div className="admin-section">
      <Card className="size-card">
        <Card.Header className="size-card-header">
          <div className="size-header">
            <h3 className="size-title mb-0">Size Management</h3>
       
              <Button 
                variant="outline-primary" 
                className="add-size-btn"
                onClick={handleOpenBulkDialog}
              >
                <FaPlus className="me-2" /> Add Multiple
              </Button>
        
          </div>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-3" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" /> Loading...
            </div>
          ) : Object.keys(groupedSizes).length === 0 ? (
            <div className="text-center py-4">No sizes found</div>
          ) : (
            Object.entries(groupedSizes).map(([groupName, groupSizes]) => (
              <div key={groupName} className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2 p-3 bg-light rounded">
                  <h5 className="mb-0 fw-bold">{groupName} ({groupSizes.length} sizes)</h5>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteGroup(groupName)}
                    className="d-flex align-items-center gap-2"
                  >
                    <FaRegTrashCan /> Delete Group
                  </Button>
                </div>
                <Table responsive bordered hover className="size-table mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupSizes.map((size) => (
                      <tr key={size._id}>
                        <td>{size.name}</td>
                        <td className='size-actions'>
                          <button 
                            className="icon-btn EditSizeBtn"
                            onClick={() => handleOpenEditDialog(size)}
                            aria-label="Edit"
                          >
                            <FaPencil />
                          </button>
                          <button 
                            className="icon-btn DeleteSizeBtn"
                            onClick={() => handleDelete(size._id)}
                            aria-label="Delete"
                          >
                            <FaRegTrashCan />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ))
          )}
        </Card.Body>
      </Card>

      {/* Create/Edit Size Modal */}
      <Modal show={openDialog} onHide={handleCloseDialog}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Size' : 'Create New Size'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Size Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={currentSize.name}
                onChange={handleInputChange}
                autoFocus
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Group</Form.Label>
              <Form.Control
                type="text"
                name="group"
                value={currentSize.group}
                onChange={handleInputChange}
                placeholder="Enter group name (e.g., Pizza Sizes, Drink Sizes)"
              />
            </Form.Group>

          </Form>
        </Modal.Body>
<Modal.Footer>
  <Button 
    className="modal-cancel-btn"
    onClick={handleCloseDialog}
  >
    Cancel
  </Button>
  <Button 
    className="modal-save-btn"
    onClick={handleSubmit}
    disabled={!currentSize.name}
  >
    {isEditing ? 'Save' : 'Create'}
  </Button>
</Modal.Footer>
      </Modal>

      {/* Bulk Create Sizes Modal */}
      <Modal show={openBulkDialog} onHide={handleCloseBulkDialog} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Multiple Sizes in Same Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="bulk-sizes-container">
            {/* Group Selection */}
            <div className="mb-4 p-3 bg-light rounded">
              <Form.Group>
                <Form.Label className="fw-bold">Group Name (All sizes will be added to this group)</Form.Label>
                <Form.Control
                  type="text"
                  value={bulkGroup}
                  onChange={(e) => handleBulkGroupChange(e.target.value)}
                  placeholder="Enter group name (e.g., Pizza Sizes, Drink Sizes)"
                  className="mb-2"
                />
                <Form.Text className="text-muted">
                  All sizes below will be grouped under: <strong>{bulkGroup}</strong>
                </Form.Text>
              </Form.Group>
            </div>

            {/* Size Names */}
            <div className="mb-3">
              <h6 className="mb-3">Size Names:</h6>
              {bulkSizes.map((size, index) => (
                <div key={index} className="bulk-size-row mb-3 p-3 border rounded">
                  <Row className="align-items-center">
                    <Col md={10}>
                      <Form.Group>
                        <Form.Label>Size Name {index + 1}</Form.Label>
                        <Form.Control
                          type="text"
                          value={size.name}
                          onChange={(e) => handleBulkInputChange(index, 'name', e.target.value)}
                          placeholder={`Enter size name ${index + 1}`}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2} className="d-flex align-items-end">
                      {bulkSizes.length > 1 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeBulkSize(index)}
                          className="mb-3"
                          title="Remove this size"
                        >
                          <FaRegTrashCan />
                        </Button>
                      )}
                    </Col>
                  </Row>
                </div>
              ))}
              <Button
                variant="outline-primary"
                onClick={addBulkSize}
                className="w-100"
              >
                <FaPlus className="me-2" /> Add Another Size
              </Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            className="modal-cancel-btn"
            onClick={handleCloseBulkDialog}
          >
            Cancel
          </Button>
          <Button 
            className="modal-save-btn"
            onClick={handleBulkSubmit}
            disabled={loading || bulkSizes.every(size => !size.name.trim())}
          >
            {loading ? 'Creating...' : `Create ${bulkSizes.filter(size => size.name.trim()).length} Sizes`}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminSizeManagement;