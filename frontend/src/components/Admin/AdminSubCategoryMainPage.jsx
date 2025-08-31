import { useEffect,useRef,   useState, useImperativeHandle, forwardRef, useMemo } from "react";
import { useBreadcrumb } from "./AdminBreadcrumbContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Table,
  Button,
  Form,
  InputGroup,
  Row,
  Col,
  Modal,
} from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import { FaPencil,FaRegTrashCan } from "react-icons/fa6";
import AdminItemMainPage from "./AdminItemMainPage";
import Switch from "react-switch";
import {
  fetchSubCategoriesByCategoryId,
  toggleSubCategoryVisibility,
  fetchAllCategories,
  updateSubCategory,
  createSubCategories,
  deleteSubCategory,
  updateSubCategorySerialId
} from "../../api/admin";
import "../../styles/AdminSubCategoryMainPage.css";

import { FiX, FiCheck, FiMove } from "react-icons/fi";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Spinner from "react-bootstrap/Spinner";
import { CSS } from "@dnd-kit/utilities";
import { TouchSensor } from "@dnd-kit/core";

// Separate SortableRow component to fix table nesting issues
const SortableRow = ({
  sub,
  handleToggleVisibility,
  handleEditClick,
  handleDelete,
  handleViewClick,
  urlCategoryId,
  categoryId,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sub._id });

  const rowRef = useRef(null);

 const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    touchAction: "manipulation", // Allow touch interactions
    opacity: isDragging ? 0.5 : 1,
  };
 
  

return (
    <tr
      ref={(node) => {
        setNodeRef(node);
        rowRef.current = node;
      }}
      style={style}
      className={`sortable-item ${isDragging ? 'dragging' : ''}`}
    >
      <td className="text-center" style={{width: '40px'}}>
        <div 
          {...attributes}
          {...listeners}
          className="drag-handle"
          title="Drag to reorder"
        >
          <FiMove size={16}/>
        </div>
      </td>
      <td>{sub.name}</td>
      <td>{sub.count}</td>
      <td>{sub.taxRate !== null && sub.taxRate !== undefined ? `${sub.taxType}: ${sub.taxRate}%` : 'Default'}</td>
      <td onClick={(e) => e.stopPropagation()}>
        {/* <Form.Check
          type="switch"
          id={`visibility-switch-${sub._id}`}
          label={sub.isVisible ? "Visible" : "Hidden"}
          checked={sub.isVisible}
          onChange={() => handleToggleVisibility(sub._id, !sub.isVisible)}
          onClick={(e) => e.stopPropagation()}
        /> */}
         <Switch
            checked={sub.isVisible}
            onChange={() => handleToggleVisibility(sub._id, !sub.isVisible)}
            onClick={(e) => e.stopPropagation()}
            onColor="#64E239"
            offColor="#545454"
            checkedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 16, color: 'white'}}>Show</span>}
            uncheckedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 16, color: 'white'}}>Hide</span>}
            width={70}
            height={30}
            handleDiameter={22}
          />
      </td>
      <td className="text-center">
        <div className="action-buttons" onClick={(e) => e.stopPropagation()} style={{ touchAction: "auto", pointerEvents: "auto", display: "flex", flexWrap: "nowrap", justifyContent: "center", gap: "4px" }}>
          {urlCategoryId ? (
            <Link 
              to={`/admin/categories/${categoryId}/${sub._id}`}
              className="btn btn-sm action-btn ViewBtn"
              style={{ textDecoration: 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              <FaEye />
            </Link>
          ) : (
            <Button
              size="sm"
              className="action-btn ViewBtn"
              onClick={(e) => {
                e.stopPropagation();
                handleViewClick(sub);
              }}
            >
              <FaEye />
            </Button>
          )}
          <Button
            size="sm"
            className="action-btn EditBtn"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(sub);
            }}
          >
            <FaPencil />
          </Button>
          <Button
            size="sm"
            className="action-btn DelBtn"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(sub._id);
            }}
          >
            <FaRegTrashCan />
          </Button>
        </div>
      </td>
    </tr>
  );
};




const AdminSubCategoryMainPage = forwardRef(
  ({ categoryId: propCategoryId, categoryName: propCategoryName, onBack: propOnBack, sendItemtoCategeoryPage, resetSubCategoryView }, ref) => {
    const { categoryId: urlCategoryId } = useParams();
    const navigate = useNavigate();
    
    // Use URL params if available, otherwise use props (for backward compatibility)
    const categoryId = urlCategoryId || propCategoryId;
    const [categoryName, setCategoryName] = useState(propCategoryName || '');
    const onBack = propOnBack || (() => navigate('/admin/categories'));
    
  const [subcategories, setSubcategories] = useState({ count: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const { updateBreadcrumb } = useBreadcrumb();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [fieldVisibility, setFieldVisibility] = useState({
    description: true,
    image: true,
    addOns: true,
  });
  const [editTaxType, setEditTaxType] = useState('GST');
  const [editTaxRate, setEditTaxRate] = useState(null);
  const [editNotes, setEditNotes] = useState([]);
  const [selectedSubForItems, setSelectedSubForItems] = useState(null);
  


const pointerSensor = useSensor(PointerSensor, {
  activationConstraint: {
    distance: 8, // Minimum distance to activate drag
  },
});

const touchSensor = useSensor(TouchSensor, {
  activationConstraint: {
    delay: 200, // Delay before drag starts on touch
    tolerance: 8, // Minimum movement to activate drag
  },
});

const keyboardSensor = useSensor(KeyboardSensor);

const sensors = useSensors(pointerSensor, touchSensor, keyboardSensor);
  // Fetch subcategories and category name
  useEffect(() => {
    const getSubCategories = async () => {
      if (!categoryId) return;
      
      setLoading(true);
      try {
        const [data, categories] = await Promise.all([
          fetchSubCategoriesByCategoryId(categoryId),
          fetchAllCategories()
        ]);
        
        setSubcategories(data);
        
        const category = categories.find(cat => cat._id === categoryId);
        if (category) {
          setCategoryName(category.name);
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getSubCategories();
  }, []);

useEffect(() => {
  if (categoryName) {
    if (selectedSubForItems) {
      updateBreadcrumb([
        { label: "Category Management", onClick: () => onBack() },
        { label: categoryName, onClick: () => handleBackToSubCategory() },
        { label: selectedSubForItems.name }
      ]);
    } else if (urlCategoryId) {
      updateBreadcrumb([
        { label: "Category Management", onClick: () => navigate('/admin/categories') },
        { label: categoryName }
      ]);
    } else {
      updateBreadcrumb([
        { label: "Category Management", onClick: () => onBack() },
        { label: categoryName }
      ]);
    }
  }
}, [categoryName, selectedSubForItems]);



  const handleViewClick = (sub) => {
    if (urlCategoryId) {
      // Navigate to items page with URL params
      navigate(`/admin/categories/${categoryId}/${sub._id}`);
    } else {
      // Use old method for backward compatibility
      setSelectedSubForItems(sub);
      if (sendItemtoCategeoryPage) {
        sendItemtoCategeoryPage(sub.name);
      }
    }
  };

  const handleBackToSubCategory = () => {
    setSelectedSubForItems(null);
    if (resetSubCategoryView) {
      resetSubCategoryView();
    }
  };

  useImperativeHandle(ref, () => ({
    triggerReset: handleBackToSubCategory,
  }));

  const handleToggleVisibility = async (subCategoryId, newValue) => {
    try {
      await toggleSubCategoryVisibility(subCategoryId, newValue);
      setSubcategories((prev) => ({
        ...prev,
        items: prev.items.map((sub) =>
          sub._id === subCategoryId ? { ...sub, isVisible: newValue } : sub
        ),
      }));
    } catch (err) {
      console.error("Failed to toggle subcategory visibility:", err);
    }
  };

  const handleEditClick = async (sub) => {
    setSelectedSub(sub);
    setEditName(sub.name);
    setEditCategoryId(sub.category || "");
    setEditTaxType(sub.taxType || 'GST');
    setEditTaxRate(sub.taxRate);
    setEditNotes(sub.notes && sub.notes.length > 0 ? sub.notes : [{ heading: "", content: "" }]);
    setFieldVisibility(
      sub.fieldVisibility ?? {
        description: true,
        image: true,
        addOns: true,
      }
    );

    try {
      const categories = await fetchAllCategories();
      setAllCategories(categories);
    } catch (err) {
      console.error("Failed to load categories", err);
    }

    setShowEditModal(true);
  };

    const handleDragEnd = async (event) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = subcategories.items.findIndex((i) => i._id === active.id);
        const newIndex = subcategories.items.findIndex((i) => i._id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const newItems = arrayMove(subcategories.items, oldIndex, newIndex);

        // Optimistically update UI
        setSubcategories((prev) => ({
          ...prev,
          items: newItems,
        }));

        try {
          // Update the specific item that was moved to its new position
          const movedItem = newItems[newIndex];
          const newSerialId = newIndex + 1;
          
          await updateSubCategorySerialId(movedItem._id, newSerialId);
          
          // Refresh data to ensure consistency
          const refreshedData = await fetchSubCategoriesByCategoryId(categoryId);
          setSubcategories(refreshedData);
        } catch (err) {
          console.error("Failed to update serialId", err);
          alert("Failed to save new order. Please try again.");
          // Revert to original state
          const originalData = await fetchSubCategoriesByCategoryId(categoryId);
          setSubcategories(originalData);
        }
      }
    };


  const toggleFieldVisibility = (field) => {
    setFieldVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleDelete = async (subCategoryId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subcategory?"
    );
    if (!confirmed) return;

    try {
      await deleteSubCategory(subCategoryId);
      setSubcategories((prev) => ({
        ...prev,
        items: prev.items.filter((sub) => sub._id !== subCategoryId),
      }));
    } catch (err) {
      console.error("Failed to delete subcategory:", err);
      alert("Failed to delete subcategory. Please try again.");
    }
  };

  const handleEditSave = async () => {
    if (!selectedSub) return;

    try {
      await updateSubCategory(selectedSub._id, {
        name: editName,
        category: editCategoryId,
        fieldVisibility,
        taxType: editTaxType,
        taxRate: editTaxRate,
        notes: editNotes.filter(note => note.heading.trim() !== ""),
      });

      const updatedData = await fetchSubCategoriesByCategoryId(categoryId);
      setSubcategories(updatedData);
      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to update subcategory", err);
    }
  };

  const [newTaxType, setNewTaxType] = useState('GST');
  const [newTaxRate, setNewTaxRate] = useState(null);
  const [newNotes, setNewNotes] = useState([{ heading: "", content: "" }]);
  
  const handleCreateNewSubcategory = async () => {
    if (!newSubName.trim()) return;

    try {
      await createSubCategories({
        name: newSubName.trim(),
        category: categoryId,
        taxType: newTaxType,
        taxRate: newTaxRate,
        notes: newNotes.filter(note => note.heading.trim() !== "")
      });

      const updated = await fetchSubCategoriesByCategoryId(categoryId);
      setSubcategories(updated);

      setIsCreating(false);
      setNewSubName("");
      setNewTaxType('GST');
      setNewTaxRate(null);
      setNewNotes([{ heading: "", content: "" }]);
    } catch (err) {
      console.error("Failed to create subcategory:", err);
    }
  };

  // Filter subcategories by search term (case-insensitive)
   const filteredSubcategories = subcategories.items.filter((sub) =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    );


  if (selectedSubForItems) {
    return (
      <AdminItemMainPage
        subCategory={selectedSubForItems}
        categoryName={categoryName}
        onBack={handleBackToSubCategory}
      />
    );
  }

  if (loading) {
    return (
      <div className="admin-subcategory container d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" size="lg" />
      </div>
    );
  }

  return (
    <div className="admin-subcategory container">
      {/* Header: Search + Actions */}
      <Row className="mb-3 align-items-center mt-3 ">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              placeholder="Search Here"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <InputGroup.Text>
              <i className="bi bi-search" />
            </InputGroup.Text>
          </InputGroup>
        </Col>

        <Col md={6} className="text-end">
          <Button
            className="SubCategoryPage-CreateButton"
            variant="primary"
            onClick={() => setIsCreating(true)}
          >
            Create +
          </Button>
        </Col>
      </Row>

      {isCreating && (
        <div className="p-3 mb-3 shadow-sm rounded bg-white">
          <Row className="RowOfSubcategory">
            <Col md={6}>
              <Form.Label className="fw-bold">Name :</Form.Label>
              <Form.Control
                placeholder="Subcategory name"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold">Tax Type :</Form.Label>
              <Form.Select
                value={newTaxType}
                onChange={(e) => setNewTaxType(e.target.value)}
              >
                <option value="GST">GST</option>
                <option value="VAT">VAT</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold">Tax Rate (%) :</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="Tax rate"
                value={newTaxRate !== null ? newTaxRate : ''}
                onChange={(e) => setNewTaxRate(e.target.value === '' ? null : parseFloat(e.target.value))}
              />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <Form.Label className="fw-bold">Notes :</Form.Label>
              {newNotes.map((note, index) => (
                <div key={index} className="mb-2 p-2 border rounded">
                  <Form.Control
                    className="mb-2"
                    placeholder="Note Heading"
                    value={note.heading}
                    onChange={(e) => {
                      const updatedNotes = [...newNotes];
                      updatedNotes[index].heading = e.target.value;
                      setNewNotes(updatedNotes);
                    }}
                  />
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Note Content"
                    value={note.content}
                    onChange={(e) => {
                      const updatedNotes = [...newNotes];
                      updatedNotes[index].content = e.target.value;
                      setNewNotes(updatedNotes);
                    }}
                  />
                  <Form.Select
                    className="mt-2"
                    value={note.position || 'footer'}
                    onChange={(e) => {
                      const updatedNotes = [...newNotes];
                      updatedNotes[index].position = e.target.value;
                      setNewNotes(updatedNotes);
                    }}
                  >
                    <option value="header">Header</option>
                    <option value="footer">Footer</option>
                  </Form.Select>
                  <div className="d-flex justify-content-end mt-2">
                     <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={() => setNewNotes([...newNotes, { heading: "", content: "" }])}
                className="AddNoteSubCategoryBtn"
              >
                + Add Note
              </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => {
                        const updatedNotes = newNotes.filter((_, i) => i !== index);
                        setNewNotes(updatedNotes.length ? updatedNotes : [{ heading: "", content: "" }]);
                      }}
                      className="RemoveSubCategoryBtn"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
             
            </Col>
          </Row>
          <Row className="mt-3">
            <Col className="SubCategoryBtnsContainer">
              <Button
                className="CreateSubCategory"
                onClick={handleCreateNewSubcategory}
              >
                ✓ Create
              </Button>
              <Button
              className="DelSubCategory"
                onClick={() => {
                  setIsCreating(false);
                  setNewSubName("");
                  setNewTaxType('GST');
                  setNewTaxRate(null);
                  setNewNotes([{ heading: "", content: "" }]);
                  
                }}
              >
                <FaRegTrashCan/>
              </Button>
            </Col>
          </Row>
        </div>
      )}

      {/* Subcategory Table */}
      {subcategories.items.length === 0 ? (
        <div className="text-center p-5 mt-4">
          <h5>No subcategories available</h5>
          <p className="text-muted">Create a new subcategory to get started</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div style={{ overflowX: 'auto', touchAction: 'pan-x pan-y' }}>
            <Table hover bordered  style={{ minWidth: '600px' }} className="SubCategoryTable">
            <thead className="SubCategoryTableHeader">
              <tr>
                <th style={{width: '40px'}}></th>
                <th>Name</th>
                <th>Items</th>
                <th>Tax</th>
                
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <SortableContext
              items={filteredSubcategories.map((sub) => sub._id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {filteredSubcategories.length > 0 ? (
                  filteredSubcategories.map((sub) => (
                    <SortableRow
                      key={sub._id}
                      sub={sub}
                      handleToggleVisibility={handleToggleVisibility}
                      handleEditClick={handleEditClick}
                      handleDelete={handleDelete}
                      handleViewClick={handleViewClick}
                      urlCategoryId={urlCategoryId}
                      categoryId={categoryId}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-muted">
                      No subcategories match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </SortableContext>
            </Table>
          </div>
        </DndContext>
      )}

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Subcategory</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Subcategory Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={editCategoryId}
              onChange={(e) => setEditCategoryId(e.target.value)}
            >
              <option value="">Select Category</option>
              {allCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Tax Type and Rate Fields */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tax Type</Form.Label>
                <Form.Select
                  value={editTaxType}
                  onChange={(e) => setEditTaxType(e.target.value)}
                >
                  <option value="GST">GST</option>
                  <option value="VAT">VAT</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tax Rate (%)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Tax rate"
                  value={editTaxRate !== null ? editTaxRate : ''}
                  onChange={(e) => setEditTaxRate(e.target.value === '' ? null : parseFloat(e.target.value))}
                />
              </Form.Group>
            </Col>
          </Row>
          
          {/* Notes Fields */}
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            {editNotes.map((note, index) => (
              <div key={index} className="mb-3 p-2 NotesSectionModal">
                <Form.Control
                  className="mb-2"
                  placeholder="Note Heading"
                  value={note.heading}
                  onChange={(e) => {
                    const updatedNotes = [...editNotes];
                    updatedNotes[index].heading = e.target.value;
                    setEditNotes(updatedNotes);
                  }}
                />
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Note Content"
                  value={note.content}
                  onChange={(e) => {
                    const updatedNotes = [...editNotes];
                    updatedNotes[index].content = e.target.value;
                    setEditNotes(updatedNotes);
                  }}
                />
                <Form.Select
                  className="mt-2"
                  value={note.position || 'footer'}
                  onChange={(e) => {
                    const updatedNotes = [...editNotes];
                    updatedNotes[index].position = e.target.value;
                    setEditNotes(updatedNotes);
                  }}
                >
                  <option value="header">Header</option>
                  <option value="footer">Footer</option>
                </Form.Select>
                <div className="d-flex justify-content-end mt-2">
                  <Button 
                    size="sm"
                    onClick={() => {
                      const updatedNotes = editNotes.filter((_, i) => i !== index);
                      setEditNotes(updatedNotes.length ? updatedNotes : [{ heading: "", content: "" }]);
                    }}
                    className="ModalDelBtn"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <div className="AddNoteBtnContainer">
            <Button 
            className="AddNoteBtnModal"
              size="sm" 
              onClick={() => setEditNotes([...editNotes, { heading: "", content: "" }])}
            >
              + Add Note
            </Button>
            </div>
          </Form.Group>

          {/* Field visibility toggles */}
          <div>
            <p className="FieldVisibilityHeading">Field Visibility</p>
            <div className="ToggleContainer">
            {Object.entries(fieldVisibility).map(([field, visible]) => (
              <Form.Check
                key={field}
                type="switch"
                id={`toggle-field-${field}`}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                checked={visible}
                onChange={() => toggleFieldVisibility(field)}
                className="mb-2 ToggleDiv"
              />
            ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="EditCancelBtn" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button
            className="EditSaveBtn"
            onClick={handleEditSave}
            disabled={!editName.trim()}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
});

export default AdminSubCategoryMainPage;