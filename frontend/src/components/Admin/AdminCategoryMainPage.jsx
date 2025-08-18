import { useState, useRef, useEffect } from "react";
import { useBreadcrumb } from "./AdminBreadcrumbContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { updateCategorySerialId, toggleCategoryVisibility } from '../../api/admin';
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { FiCheck, FiTrash2 } from "react-icons/fi";
import { fetchAllCategories, updateCategory, createCategory, deleteCategory } from '../../api/admin';
import AdminSubCategoryMainPage from "./AdminSubCategoryMainPage";
import ImageCropModal from '../utils/ImageCropModal';
import { getImageUrl } from '../../utils/imageUrl';

import DefaultImage from "../../assets/images/default.png";
import "../../styles/AdminCategoryMainPage.css";
import SortableCategoryCard from "./AdminSortableCategoryCards";


function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editedCategory, setEditedCategory] = useState({ name: '', image: '' });
  const fileInputRefs = useRef({});
  const [viewSubCategory, setViewSubCategory] = useState(null); // { id, name }
  const [ItemName, setItemName] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImageForCrop, setOriginalImageForCrop] = useState(null);
  const [cropTargetType, setCropTargetType] = useState(null); // 'new' or 'edit'
  const [cropTargetId, setCropTargetId] = useState(null);
  const { updateBreadcrumb } = useBreadcrumb();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );
  const subCategoryRef = useRef();
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await fetchAllCategories();
        
        setCategories(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Update breadcrumb only once when component mounts or when navigation changes
  useEffect(() => {
    if (viewSubCategory) {
      const breadcrumbPath = [
        { 
          label: "Category Management",
          onClick: () => {
            setViewSubCategory(null);
            setItemName(null);
          }
        }
      ];
      
      // Add category name
      breadcrumbPath.push({
        label: viewSubCategory.name,
        onClick: () => {
          setItemName(null);
          callItemRest();
        }
      });
      
      // Add item name if present
      if (ItemName) {
        breadcrumbPath.push({ label: ItemName });
      }
      
      updateBreadcrumb(breadcrumbPath);
    } else {
      // Just show Category Management when on main categories page
      updateBreadcrumb([
        { label: "Category Management" }
      ]);
    }
  }, [viewSubCategory?.id, ItemName]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = categories.findIndex((cat) => cat._id === active.id);
      const newIndex = categories.findIndex((cat) => cat._id === over.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCategories);

      try {
        await Promise.all(
          newCategories.map((cat, index) =>
            updateCategorySerialId(cat._id, index + 1)
          )
        );
        
      } catch (error) {
        console.error("Failed to update serial IDs:", error);
      }
    }
  };

  const callItemRest = () => {
    if (subCategoryRef.current) {
      subCategoryRef.current.triggerReset(); 
    }
  };
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    image: '',
    show: true,
    isAgeRestricted: false,
  });
  const [hasProcessedNewImage, setHasProcessedNewImage] = useState(false);
  const [hasProcessedEditImage, setHasProcessedEditImage] = useState(false);

  const toggleShow = async (id, currentVisibility) => {
    try {
      const updated = await toggleCategoryVisibility(id, !currentVisibility);
      setCategories(prev => {
        const newCategories = prev.map(cat =>
          cat._id === id
            ? { ...cat, isVisible: updated.isVisible ?? !currentVisibility }
            : cat
        );
        return newCategories;
      });
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
      alert("Something went wrong while toggling visibility.");
    }
  };

  const changeImage = (id) => {
    if (fileInputRefs.current[id]) {
      fileInputRefs.current[id].click();
    }
  };

  const handleImageChangeUpload = (e, id) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setOriginalImageForCrop(imageUrl);
      setCropTargetType('existing');
      setCropTargetId(id);
      setShowCropModal(true);
    }
    e.target.value = '';
  };

  const editCategory = (id) => {
    const category = categories.find(cat => cat._id === id);
    if (category) {
      setEditingCategoryId(id);
      setEditedCategory({ 
        name: category.name, 
        image: category.image,
        isAgeRestricted: category.isAgeRestricted || false
      });
    }
  };

  const saveEditedCategory = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('name', editedCategory.name);

      if (editedCategory.image instanceof File) {
        formData.append('image', editedCategory.image);
      }

      if (editedCategory.serialId !== undefined) {
        formData.append('serialId', editedCategory.serialId);
      }
      
      if (editedCategory.isAgeRestricted !== undefined) {
        formData.append('isAgeRestricted', editedCategory.isAgeRestricted);
      }

      const updatedCategory = await updateCategory(editingCategoryId, formData);

      setCategories(categories =>
        categories.map(cat =>
          cat._id === editingCategoryId ? updatedCategory : cat
        )
      );

      setEditedCategory(null);
      setEditingCategoryId(null);
    } catch (error) {
      console.error("Error updating category:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setOriginalImageForCrop(imageUrl);
      setCropTargetType('edit');
      setShowCropModal(true);
    }
    e.target.value = '';
  };

  const deleteCategoryFunction = async (id) => {
    if (isDeleting) return;
    if (window.confirm("Are you sure you want to delete this category?")) {
      setIsDeleting(true);
      try {
        await deleteCategory(id);
        setCategories(prev => prev.filter(cat => cat._id !== id));
      } catch (error) {
        console.error("Failed to delete category:", error);
        alert("Something went wrong while deleting the category.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const createCategoryField = () => {
    setCreating(true);
    setNewCategory({
      name: '',
      image: '',
      show: true,
      isAgeRestricted: false,
    });
    setHasProcessedNewImage(false);
  };

  const saveNewCategory = async () => {
    if (isCreating) return;
    if (!newCategory.name || (!newCategory.image && !hasProcessedNewImage)) {
      alert("Please provide both a title and image.");
      return;
    }

    setIsCreating(true);
    try {
      const serialId = categories.length;
      const formData = new FormData();
      formData.append("name", newCategory.name);
      formData.append("serialId", serialId.toString());
      formData.append("image", newCategory.image);
      formData.append("isVisible", "true");
      formData.append("isAgeRestricted", newCategory.isAgeRestricted.toString());

      const created = await createCategory(formData);
      setCategories(prev => [...prev, created]);
      setCreating(false);
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setOriginalImageForCrop(imageUrl);
      setCropTargetType('new');
      setShowCropModal(true);
    }
    e.target.value = '';
  };

  const handleCroppedImageSave = (croppedBlob) => {
    const croppedFile = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
    
    if (cropTargetType === 'new') {
      const previewUrl = URL.createObjectURL(croppedBlob);
      setNewCategory({
        ...newCategory,
        image: croppedFile,
        preview: previewUrl,
      });
      setHasProcessedNewImage(true);
    } else if (cropTargetType === 'edit') {
      const previewUrl = URL.createObjectURL(croppedBlob);
      setEditedCategory({
        ...editedCategory,
        image: croppedFile,
        preview: previewUrl
      });
      setHasProcessedEditImage(true);
    } else if (cropTargetType === 'existing' && cropTargetId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCategories(prev =>
          prev.map(cat =>
            cat._id === cropTargetId ? { ...cat, image: reader.result } : cat
          )
        );
      };
      reader.readAsDataURL(croppedBlob);
    }
  };

  const sendItemtoCategeoryPage = (data) => {
    setItemName(data);
  };

  if (viewSubCategory) {
    return (
      <AdminSubCategoryMainPage
        ref={subCategoryRef}
        categoryId={viewSubCategory.id}
        categoryName={viewSubCategory.name}
        onBack={() => setViewSubCategory(null)}
        sendItemtoCategeoryPage={sendItemtoCategeoryPage}
        resetSubCategoryView={() => setItemName(null)}
      />
    );
  }

  if (loading) {
    return (
      <Container fluid className="CategoryPage-Container d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="CategoryPage-Container">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
        <SortableContext items={categories.map((cat) => cat._id)} strategy={verticalListSortingStrategy}>
          <Container fluid className="CategoryPage-Container">
            <Row className="CategoryPage-HeaderRow">
          
              <Col className="CategoryPage-CreateButtonContainer text-end">
                <Button variant="info" onClick={createCategoryField} className="CategoryPage-CreateButton">
                  Create +
                </Button>
              </Col>
            </Row>

            <Row className="CategoryPage-CardGrid">
              {categories.length === 0 ? (
                <Col xs={12}>
                  <div className="text-center p-5 mt-4">
                    <h5>No categories available</h5>
                    <p className="text-muted">Create a new category to get started</p>
                  </div>
                </Col>
              ) : (
                categories.map((category) => (
                <SortableCategoryCard
                  key={category._id}
                  category={category}
                  editingCategoryId={editingCategoryId}
                  editedCategory={editedCategory}
                  fileInputRef={fileInputRefs.current[category._id]}
                  onEditTitleChange={(updatedCategory) =>
                    setEditedCategory(updatedCategory)
                  }
                  onImageUpload={handleEditImageUpload}
                  onChangeImageClick={() => changeImage(category._id)}
                  onFileInputChange={(e) => handleImageChangeUpload(e, category._id)}
                  onCancelEdit={() => setEditingCategoryId(null)}
                  onSaveEdit={saveEditedCategory}
                  onEditClick={() => editCategory(category._id)}
                  onDeleteClick={() => deleteCategoryFunction(category._id)}
                  onToggleShow={() => toggleShow(category._id, category.isVisible)}
                  onView={() => setViewSubCategory({ id: category._id, name: category.name })} 
                />
              ))
              )}

              {creating && (
                <Col className="CategoryItem-Col">
                  <Card className="CategoryCard">
                    <Card.Body>
                      <Form.Group controlId="formCategoryTitle" className="TitleFormGroup">
                        <Form.Label className="TitleFormLabel">Title:</Form.Label>
                        <Form.Control
                          type="text"
                          value={newCategory.name}
                          placeholder="Enter category title"
                          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                          className="TitleFormField"
                        />
                      </Form.Group>

                      <div className="CategoryCard-ImageContainer mt-3 mb-2">
                        <Card.Img
                          variant="top"
                          src={newCategory.preview ? getImageUrl(newCategory.preview) : DefaultImage}
                          className="CategoryCard-Image"
                        />
                      </div>

                      <Form.Group className="mt-3">
                        <Form.Check
                          type="switch"
                          id="age-restriction-switch"
                          label="Age Restricted (21+)"
                          checked={newCategory.isAgeRestricted}
                          onChange={(e) => setNewCategory({ ...newCategory, isAgeRestricted: e.target.checked })}
                        />
                      </Form.Group>

                      <div className="mt-2 d-flex justify-content-between align-items-center gap-2">
                        <Form.Group controlId="formFileUpload" className="mb-0">
                          <Form.Label
                            className="UploadImageBtn"
                            style={{ cursor: "pointer" }}
                          >
                            Upload Image(Ratio 3:1)
                          </Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: "none" }}
                          />
                        </Form.Group>

                        <div className="d-flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={saveNewCategory}
                            className="CategoryCreateBtn d-flex align-items-center"
                          >
                            <FiCheck className="me-1" />
                            Create
                          </Button>
                        </div>
                      </div>
                    </Card.Body>

                    <div className="DeleteBtnContainer text-center pb-3">
                      <Button
                      
                        size="sm"
                        onClick={() => setCreating(false)}
                        className="CategoryCard-IconButton"
                      >
                        <FiTrash2/>
                      </Button>
                    </div>
                  </Card>
                </Col>
              )}
            </Row>
          </Container>
        </SortableContext>
      </DndContext>
      
      {/* Image Crop Modal */}
      <ImageCropModal
        show={showCropModal}
        onHide={() => setShowCropModal(false)}
        onSave={handleCroppedImageSave}
        originalImage={originalImageForCrop}
      />
    </Container>
  );
}

export default CategoryPage;