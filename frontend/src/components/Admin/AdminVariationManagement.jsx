import React, { useState, useEffect } from 'react';
import { 
  fetchAllVariations, 
  createVariation, 
  updateVariation, 
  deleteVariation 
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
import { FaPlus, FaEdit, FaUtensils, FaRuler, FaAllergies, FaCogs } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useBreadcrumb } from './AdminBreadcrumbContext';
import '../../styles/AdminVariationManagement.css';
import '../../styles/AdminCommon.css';
import { FaPencil, FaRegTrashCan } from "react-icons/fa6";
import Swal from 'sweetalert2';
import { Row, Col } from 'react-bootstrap';

const AdminVariationManagement = ({ isStandalone = true }) => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentVariation, setCurrentVariation] = useState({ name: '', group: 'Default' });
  const [isEditing, setIsEditing] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [bulkVariations, setBulkVariations] = useState([{ name: '', group: 'Default' }]);
  const [bulkGroup, setBulkGroup] = useState('Default');
  const [groupedVariations, setGroupedVariations] = useState({});

  useEffect(() => {
    if (isStandalone) {
      updateBreadcrumb([
        { label: 'Admin Controls' },
        { label: 'Variation Management' }
      ]);
    }
    loadVariations();
  }, [updateBreadcrumb, isStandalone]);

  const loadVariations = async () => {
    setLoading(true);
    try {
      const response = await fetchAllVariations();
      if (response.success) {
        setVariations(response.data);
        groupVariationsByGroup(response.data);
      } else {
        setError(response.message || 'Failed to fetch variations');
      }
    } catch (err) {
      setError('Error loading variations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupVariationsByGroup = (variationsData) => {
    const grouped = variationsData.reduce((acc, variation) => {
      const group = variation.group || 'Default';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(variation);
      return acc;
    }, {});
    setGroupedVariations(grouped);
  };

  const handleOpenCreateDialog = () => {
    setCurrentVariation({ name: '', group: 'Default' });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleOpenBulkDialog = () => {
    setBulkVariations([{ name: '', group: 'Default' }]);
    setBulkGroup('Default');
    setOpenBulkDialog(true);
  };

  const handleCloseBulkDialog = () => {
    setOpenBulkDialog(false);
    setBulkVariations([{ name: '', group: 'Default' }]);
    setBulkGroup('Default');
  };

  const handleOpenEditDialog = (variation) => {
    setCurrentVariation({ ...variation });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentVariation({
      ...currentVariation,
      [name]: value
    });
  };

  const handleBulkInputChange = (index, field, value) => {
    const updatedVariations = [...bulkVariations];
    updatedVariations[index][field] = value;
    setBulkVariations(updatedVariations);
  };

  const handleBulkGroupChange = (newGroup) => {
    setBulkGroup(newGroup);
    const updatedVariations = bulkVariations.map(variation => ({ ...variation, group: newGroup }));
    setBulkVariations(updatedVariations);
  };

  const addBulkVariation = () => {
    setBulkVariations([...bulkVariations, { name: '', group: bulkGroup }]);
  };

  const removeBulkVariation = (index) => {
    if (bulkVariations.length > 1) {
      setBulkVariations(bulkVariations.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isEditing) {
        const response = await updateVariation(currentVariation._id, currentVariation);
        if (response.success) {
          const updatedVariations = variations.map(variation => 
            variation._id === currentVariation._id ? response.data : variation
          );
          setVariations(updatedVariations);
          groupVariationsByGroup(updatedVariations);
        } else {
          setError(response.message || 'Failed to update variation');
        }
      } else {
        const response = await createVariation(currentVariation);
        if (response.success) {
          const updatedVariations = [...variations, response.data];
          setVariations(updatedVariations);
          groupVariationsByGroup(updatedVariations);
        } else {
          setError(response.message || 'Failed to create variation');
        }
      }
      handleCloseDialog();
    } catch (err) {
      setError('Error saving variation. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async () => {
    const validVariations = bulkVariations.filter(variation => variation.name.trim());
    if (validVariations.length === 0) {
      setError('Please enter at least one variation name');
      return;
    }

    setLoading(true);
    try {
      const createdVariations = [];
      for (const variation of validVariations) {
        const response = await createVariation(variation);
        if (response.success) {
          createdVariations.push(response.data);
        } else {
          setError(`Failed to create variation: ${variation.name}`);
          return;
        }
      }
      const updatedVariations = [...variations, ...createdVariations];
      setVariations(updatedVariations);
      groupVariationsByGroup(updatedVariations);
      handleCloseBulkDialog();
    } catch (err) {
      setError('Error creating variations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (variationId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this variation?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await deleteVariation(variationId);
        if (response.success) {
          const updatedVariations = variations.filter(variation => variation._id !== variationId);
          setVariations(updatedVariations);
          groupVariationsByGroup(updatedVariations);
          Swal.fire('Deleted!', 'Variation deleted successfully', 'success');
        } else {
          Swal.fire('Error!', response.message || 'Failed to delete variation', 'error');
        }
      } catch (err) {
        Swal.fire('Error!', 'Error deleting variation. Please try again.', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteGroup = async (groupName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete all variations in the "${groupName}" group?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete all!'
    });
    
    if (result.isConfirmed) {
      setLoading(true);
      try {
        const variationsToDelete = groupedVariations[groupName] || [];
        for (const variation of variationsToDelete) {
          await deleteVariation(variation._id);
        }
        const updatedVariations = variations.filter(variation => (variation.group || 'Default') !== groupName);
        setVariations(updatedVariations);
        groupVariationsByGroup(updatedVariations);
        Swal.fire('Deleted!', `All variations in "${groupName}" group deleted successfully`, 'success');
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
      <div className="admin-common-container">
        <div className="admin-common-loading">
          <Spinner animation="border" variant="primary" size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-common-container">
      {/* Navigation Tabs - Only show when standalone */}
      {isStandalone && (
        <div className="management-navigation mb-4">
          <Row>
            <Col>
              <Link to="/admin/food-categories" className="btn btn-outline-primary me-2 mb-2" style={{ textDecoration: 'none' }}>
                <FaUtensils className="me-2" /> Food Categories
              </Link>
              <Link to="/admin/tags" className="btn btn-outline-primary me-2 mb-2" style={{ textDecoration: 'none' }}>
                <FaEdit className="me-2" /> Tags
              </Link>
              <Link to="/admin/sizes" className="btn btn-outline-primary me-2 mb-2" style={{ textDecoration: 'none' }}>
                <FaRuler className="me-2" /> Sizes
              </Link>
              <Link to="/admin/allergies" className="btn btn-outline-primary me-2 mb-2" style={{ textDecoration: 'none' }}>
                <FaAllergies className="me-2" /> Allergies
              </Link>
              <Link to="/admin/variations" className="btn btn-primary me-2 mb-2" style={{ textDecoration: 'none' }}>
                <FaCogs className="me-2" /> Variations
              </Link>
            </Col>
          </Row>
        </div>
      )}
      <Card className="admin-common-card">
        <Card.Header className="admin-common-card-header">
          <h3 className="admin-common-section-title">Variation Management</h3>
          <Button 
            className='createbtn' 
            size="sm" 
            onClick={handleOpenBulkDialog}
          >
            <FaPlus className="me-1" /> Add Variation
          </Button>
        </Card.Header>
        <Card.Body className="admin-common-card-body">
          {error && (
            <Alert variant="danger" className="mb-3" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" /> Loading...
            </div>
          ) : Object.keys(groupedVariations).length === 0 ? (
            <div className="text-center py-4">No variations found</div>
          ) : (
            Object.entries(groupedVariations).map(([groupName, groupVariations]) => (
              <div key={groupName} className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2 p-3 bg-light rounded">
                  <h5 className="mb-0 fw-bold">{groupName} ({groupVariations.length} variations)</h5>
                  <Button
                  
                    onClick={() => handleDeleteGroup(groupName)}
                 
                    className="btn deleteIconBtn"
                    title="Delete"
                    type="button"
                  >
                    <FaRegTrashCan />
                  </Button>
                </div>
                <Table responsive bordered hover className="variation-table mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupVariations.map((variation) => (
                      <tr key={variation._id}>
                        <td>{variation.name}</td>
                        <td>
                          <button
                            className="btn editIconBtn"
                            onClick={() => handleOpenEditDialog(variation)}
                            title="Edit"
                            type="button"
                          >
                            <FaPencil />
                          </button>
                          <button
                            className="btn deleteIconBtn"
                            onClick={() => handleDelete(variation._id)}
                            title="Delete"
                            type="button"
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

      {/* Create/Edit Variation Modal */}
      <Modal show={openDialog} onHide={handleCloseDialog}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Variation' : 'Create New Variation'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Variation Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={currentVariation.name}
                onChange={handleInputChange}
                autoFocus
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Group</Form.Label>
              <Form.Control
                type="text"
                name="group"
                value={currentVariation.group}
                onChange={handleInputChange}
                placeholder="Enter group name (e.g., Pizza Variations, Drink Variations)"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="me-2 CancelFoodCategoryBtn" onClick={handleCloseDialog} type="button">
            <span style={{ fontSize: 18, verticalAlign: 'middle' }}>✗</span> Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!currentVariation.name} className='SaveFoodCategoryBtn'>
            <span style={{ fontSize: 18, verticalAlign: 'middle' }}>✓</span> {isEditing ? 'Save' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Create Variations Modal */}
      <Modal show={openBulkDialog} onHide={handleCloseBulkDialog} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Multiple Variations in Same Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="bulk-variations-container">
            {/* Group Selection */}
            <div className="mb-4 p-3 bg-light rounded group-selection">
              <Form.Group>
                <Form.Label className="fw-bold">Group Name (All variations will be added to this group)</Form.Label>
                <Form.Control
                  type="text"
                  value={bulkGroup}
                  onChange={(e) => handleBulkGroupChange(e.target.value)}
                  placeholder="Enter group name (e.g., Pizza Variations, Drink Variations)"
                  className="mb-2"
                />
                <Form.Text className="text-muted">
                  All variations below will be grouped under: <strong>{bulkGroup}</strong>
                </Form.Text>
              </Form.Group>
            </div>

            {/* Variation Names */}
            <div className="mb-3">
              <h6 className="mb-3">Variation Details:</h6>
              {bulkVariations.map((variation, index) => (
                <div key={index} className="bulk-variation-row mb-3 p-3 border rounded">
                  <Row className="align-items-center">
                    <Col md={10}>
                      <Form.Group className="mb-3">
                        <Form.Label>Variation Name {index + 1}</Form.Label>
                        <Form.Control
                          type="text"
                          value={variation.name}
                          onChange={(e) => handleBulkInputChange(index, 'name', e.target.value)}
                          placeholder={`Enter variation name ${index + 1}`}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2} className="d-flex align-items-end">
                      {bulkVariations.length > 1 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeBulkVariation(index)}
                          className="mb-3 remove-variation-btn"
                          title="Remove this variation"
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
                onClick={addBulkVariation}
                className="w-100 add-another-btn"
              >
                <FaPlus className="me-2" /> Add Another Variation
              </Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="me-2 CancelFoodCategoryBtn" onClick={handleCloseBulkDialog} type="button">
            <span style={{ fontSize: 18, verticalAlign: 'middle' }}>✗</span> Cancel
          </Button>
          <Button variant="primary" onClick={handleBulkSubmit} disabled={loading || bulkVariations.every(variation => !variation.name.trim())} className='SaveFoodCategoryBtn'>
            <span style={{ fontSize: 18, verticalAlign: 'middle' }}>✓</span> {loading ? 'Creating...' : `Create ${bulkVariations.filter(variation => variation.name.trim()).length} Variations`}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminVariationManagement;