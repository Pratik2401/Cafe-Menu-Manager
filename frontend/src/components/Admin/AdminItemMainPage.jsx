import React, { useRef, useEffect, useState } from 'react';
import {
  Card, Button, Row, Col, Form, Spinner, Badge, ListGroup, InputGroup
} from 'react-bootstrap';
import { FaSearch, FaPlus, FaTrash } from 'react-icons/fa';
import ItemForm from './AdminItemForm';
import { fetchItemsBySubCategoryId, updateItemSerials, createItem, deleteItem, updateItem, fetchAllCategories } from '../../api/admin';
import { fetchFoodCategories } from '../../api/admin';
import { fetchTags } from '../../api/admin';
import { fetchAllSizes } from '../../api/admin';
import { fetchAllVariations } from '../../api/admin';
// import { fetchAllSubCategories } from '../api/admin';
import { fetchAllSubCategories } from '../../api/admin';
import '../../styles/AdminItemMainPage.css'
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AdminItemCard from './AdminItemCard';
import CSVImportButton from './AdminCSVImportButton';


const SortableItem = ({ item, onDelete, onSave, editingItemId, setEditingItemId, foodCategories, tags = [], sizes = [], subCategories = [], categories = [], variations = [] }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item._id,
    disabled: editingItemId === item._id, // Disable sorting when editing
  });

  const itemRef = useRef(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'pan-y', // Allow vertical scrolling but maintain horizontal drag
    cursor: editingItemId === item._id ? 'default' : 'grab',
  };

  // Function to handle clicks on form elements to prevent drag activation
  const handleFormElementClick = (e) => {
    // Stop propagation for form elements to prevent drag activation
    if (e.target.closest('.form-check') || 
        e.target.closest('input[type="checkbox"]') || 
        e.target.closest('.AdminItemSwitchField')) {
      e.stopPropagation();
    }
  };
  
  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        itemRef.current = node;
      }}
      style={style}
      className="AdminItemList"
    >
      <AdminItemCard
        item={item}
        onDelete={onDelete}
        onSave={onSave}
        editingItemId={editingItemId}
        setEditingItemId={setEditingItemId}
        foodCategories={foodCategories}
        tags={tags}
        sizes={sizes}
        subCategories={subCategories}
        categories={categories}
        variations={variations}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};












const AdminItemsPage = ({ subCategory }) => {
  const [activeItem, setActiveItem] = useState(null);

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [foodCategories, setFoodCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [variations, setVariations] = useState([]);
  const [selectedFoodCategory, setSelectedFoodCategory] = useState('');
const [newItem, setNewItem] = useState({
  name: '',
  price: '',
  description: '',
  rating: 0,
  category: 'veg',
  foodCategoryId: '',
  tagIds: [],
  addOns: [],
  allergens: [],
  image: '',
  gstRate: null,
  show: false,
  addOnName: '',
  addOnPrice: '',
  allergyName: '',
  sizePrices: [],
});
  const fetchItems = async () => {
  try {
    const data = await fetchItemsBySubCategoryId(subCategory._id);
    setItems(data);
    setFilteredItems(data);
  } catch (err) {
    console.error('Error fetching items:', err);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    if (subCategory?._id) {
      fetchItems();
      loadFoodCategories();
      loadTags();
      loadSizes();
      loadAllSubCategories();
      loadCategories();
      loadVariations();
    }
  }, [subCategory]);
  
  const loadFoodCategories = async () => {
    try {
      const data = await fetchFoodCategories();
      setFoodCategories(data);
    } catch (err) {
      console.error('Error loading food categories:', err);
    }
  };
  
const loadTags = async () => {
  try {
    const response = await fetchTags();
    // Handle the new response format where tags are in a data property
    if (response && response.data && Array.isArray(response.data)) {
      setTags(response.data);
    } else {
      // If response is already an array, use it directly
      setTags(Array.isArray(response) ? response : []);
    }
  } catch (err) {
    console.error('Error loading tags:', err);
    setTags([]);
  }
};

const loadSizes = async () => {
  try {
    const response = await fetchAllSizes();
    // Handle the response format where sizes might be in a data property
    if (response && response.data && Array.isArray(response.data)) {
      setSizes(response.data);
    } else {
      // If response is already an array, use it directly
      setSizes(Array.isArray(response) ? response : []);
    }
  } catch (err) {
    console.error('Error loading sizes:', err);
    setSizes([]);
  }
};

const loadAllSubCategories = async () => {
  try {
    const response = await fetchAllSubCategories();
    setSubCategories(Array.isArray(response) ? response : []);
  } catch (err) {
    console.error('Error loading subcategories:', err);
    setSubCategories([]);
  }
};

const loadCategories = async () => {
  try {
    const response = await fetchAllCategories();
    setCategories(Array.isArray(response) ? response : []);
  } catch (err) {
    console.error('Error loading categories:', err);
    setCategories([]);
  }
};

const loadVariations = async () => {
  try {
    const response = await fetchAllVariations();
    if (response && response.data && Array.isArray(response.data)) {
      setVariations(response.data);
    } else {
      setVariations(Array.isArray(response) ? response : []);
    }
  } catch (err) {
    console.error('Error loading variations:', err);
    setVariations([]);
  }
};

  
  // Filter items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = items.filter(item => 
        item.name.toLowerCase().includes(query) || 
        (item.description && item.description.toLowerCase().includes(query))
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  // Custom activation filter to prevent drag on form elements
  const shouldHandleEvent = (event) => {
    const target = event.target;
    
    // Don't handle events on these elements
    const ignoreElements = [
      'input',
      'button',
      'textarea',
      'select',
      'option',
      'label',
      '.form-check',
      '.AdminItemSwitchField'
    ];
    
    // Check if the event target or its parents match any of the ignore elements
    return !ignoreElements.some(selector => 
      target.matches?.(selector) || 
      target.closest?.(selector)
    );
  };

  // Drag-and-drop sensors with improved constraints
  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { 
        distance: 5,
        delay: 100
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5
      }
    })
  );

const handleCreateItem = async (formData) => {
  setCreating(true);
  try {
    // Add the subcategory id if not already present
    if (formData instanceof FormData) {
      if (!formData.has('subcategoryId')) {
        formData.append('subcategoryId', subCategory._id);
      }
    } else {
      formData.subcategoryId = subCategory._id;
    }

    const createdItem = await createItem(formData);
    setItems(prevItems => [createdItem, ...prevItems]); // Add new item to list
    setIsCreating(false);
    setNewItem({
      name: '',
      price: '',
      description: '',
      rating: 0,
      category: 'veg',
      foodCategoryId: '',
      tagIds: [],
      addOns: [],
      allergens: [],
      image: '',
      gstRate: null,
      show: false,
      sizePrices: [],
    });
  } catch (error) {
    console.error('Error creating item:', error);
    alert('Failed to create item. Please try again.');
  } finally {
    setCreating(false);
  }
};
const handleSaveItem = async (updatedItem) => {
  try {
    // Get the item ID - check if it's a FormData object or a regular object
    let itemId;
    if (updatedItem instanceof FormData) {
      // For FormData objects, try to get the ID from the FormData
      itemId = updatedItem.get('_id');
      
      // If not found in FormData, use the editingItemId
      if (!itemId) {
        itemId = editingItemId;
      }
    } else {
      // For regular objects, get the ID directly
      itemId = updatedItem._id;
    }
    
    if (!itemId) {
      throw new Error('Item ID is missing');
    }
    
    // Call the API to update the item
    const savedItem = await updateItem(itemId, updatedItem);

    // Update the items list with the saved item
    setItems(prevItems =>
      prevItems.map(item => (item._id === savedItem._id ? savedItem : item))
    );
    setEditingItemId(null);
  } catch (error) {
    console.error('Error saving item:', error);
    alert('Failed to save item. Please try again.');
  }
};

 const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    try {
      await deleteItem(id);
      // Remove item from UI list after successful delete
      setItems(prevItems => prevItems.filter(item => item._id !== id));
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  
  const handleDragStart = (event) => {
    const { active } = event;
    
    const draggedItem = filteredItems.find((item) => item._id === active.id);
    setActiveItem(draggedItem);
  };

 const handleDragEnd = async (event) => {
  const { active, over } = event;
  
  setActiveItem(null); // Reset the active item

  if (active.id !== over?.id) {
    
    const oldIndex = filteredItems.findIndex((i) => i._id === active.id);
    const newIndex = filteredItems.findIndex((i) => i._id === over.id);
    const newFilteredItems = arrayMove(filteredItems, oldIndex, newIndex);
    
    // Update filteredItems immediately for UI
    setFilteredItems(newFilteredItems);
    
    // If no search is active, also update the main items array
    if (!searchQuery.trim()) {
      setItems(newFilteredItems);
      
      const payload = newFilteredItems.map((item, idx) => ({
        _id: item._id,
        serialId: idx + 1,
      }));
      
      

      try {
        const result = await updateItemSerials(payload);
        
      } catch (error) {
        console.error('Failed to update item serials:', error);
      }
    } else {
      
    }
  }
};
  
  if (loading) {
    return (
      <div className="container mt-4 WholeItemContainer d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" size="lg" />
      </div>
    );
  }

return (
  <div className="container mt-4 WholeItemContainer">
    {/* Search and Action Bar */}
    <Row className="mb-3 align-items-center w-100">
      <Col md={6}>
        <InputGroup>
          <Form.Control
            placeholder="Search Here"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroup.Text>
            <i className="bi bi-search" />
          </InputGroup.Text>
        </InputGroup>
      </Col>

      <Col md={6} className="text-end d-flex gap-2 justify-content-end">
       
        <Button
          className="SubCategoryPage-CreateButton"
          variant="primary"
          onClick={() => setIsCreating(true)}
        >
          Create +
        </Button>
      </Col>
    </Row>

    

    {/* Create New Item Card */}
    {isCreating && (
      <Card className="createitem-card shadow-sm p-3 rounded-4 mb-4">
        <ItemForm
          item={{
            ...newItem,
            subCategory: subCategory // Pass the subCategory to the form
          }}
          onSave={handleCreateItem}
          onCancel={() => setIsCreating(false)}
          foodCategories={foodCategories}
          tags={tags}
          sizes={sizes}
          subCategories={subCategories}
          categories={categories}
          variations={variations}
          isCreating={true}
        />
      </Card>
    )}

    {/* Item List or Spinner */}
    {loading ? (
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
      </div>
    ) : items.length === 0 ? (
      <div className="text-center p-5 mt-4">
        <h5>No items available</h5>
        <p className="text-muted">Create a new item to get started</p>
      </div>
    ) : filteredItems.length === 0 ? (
      <p className="text-center">No items match your search.</p>
    ) : (
     <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
        <SortableContext
          items={filteredItems.map(item => item._id)}
          strategy={verticalListSortingStrategy}
        >
          {filteredItems.map(item => (
 <SortableItem
  key={item._id}
  item={item}
  onDelete={handleDeleteItem}
  onSave={handleSaveItem}
  editingItemId={editingItemId}
  setEditingItemId={setEditingItemId}
  foodCategories={foodCategories}
  tags={tags}
  sizes={sizes}
  subCategories={subCategories}
  categories={categories}
  variations={variations}
/>
          ))}
        </SortableContext>
      </DndContext>
    )}
  </div>
);

};

export default AdminItemsPage;                    