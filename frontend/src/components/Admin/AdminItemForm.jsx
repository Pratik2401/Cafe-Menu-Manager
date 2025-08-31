import React, { useState, useEffect } from 'react';
import {
  Form, Row, Col, Button, Badge, InputGroup, Modal
} from 'react-bootstrap';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { fetchSubCategoriesByCategoryId, fetchAllVariations, createFoodCategory, createSize, createVariation } from '../../api/admin';
import ImageCropModal from '../utils/ImageCropModal';
import { getImageUrl } from '../../utils/imageUrl';
import '../../styles/ItemForm.css'
/**
 * Reusable Item Form component that aligns with the backend ItemModel structure
 * Used for both creating and editing items
 */

import {  FiTrash2 } from "react-icons/fi";
const ItemForm = ({ 
  item, 
  onSave, 
  onCancel, 
  foodCategories = [], 
  tags = [], 
  sizes = [],
  subCategories = [],
  categories = [],
  variations = [],
  isCreating = false,
  onFoodCategoryCreated,
  onSizeCreated,
  onVariationCreated
}) => {
  // Initialize form state from item or with defaults
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    foodCategoryId: (typeof item?.foodCategory === 'object' ? item?.foodCategory?._id : item?.foodCategory) || item?.foodCategoryId || '',
    subcategoryId: (typeof item?.subCategory === 'object' ? item?.subCategory?._id : item?.subCategory) || item?.subcategoryId || '',
    categoryId: (typeof item?.subCategory?.category === 'object' ? item?.subCategory?.category?._id : item?.subCategory?.category) || '',
    tagIds: item?.tags?.map(tag => typeof tag === 'object' ? tag._id : tag) || [],
    addOns: item?.addOns || [],
    image: item?.image || '',
    show: item?.show ?? true,
    addOnName: '',
    addOnPrice: '',
    sizePrices: item?.sizePrices || [],
    variations: item?.variations || [],
    hasVariations: item?.hasVariations || false,
    fieldVisibility: {
      ...(item?.fieldVisibility || {}),
      description: item?.fieldVisibility?.description ?? true,
      image: true, // Always set image visibility to true
      addOns: item?.fieldVisibility?.addOns ?? true,
      createdAt: item?.fieldVisibility?.createdAt ?? true
    }
  });

  // State for filtered subcategories based on selected category
  const [filteredSubCategories, setFilteredSubCategories] = useState(subCategories);

  // State for image preview and cropping
  const [imagePreview, setImagePreview] = useState(
    typeof formData.image === 'string' ? formData.image : null
  );
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImageForCrop, setOriginalImageForCrop] = useState(null);

  // State for create new modals
  const [showCreateFoodCategory, setShowCreateFoodCategory] = useState(false);
  const [showCreateSize, setShowCreateSize] = useState(false);
  const [showCreateVariation, setShowCreateVariation] = useState(false);
  const [newFoodCategory, setNewFoodCategory] = useState({ name: '', icon: null });
  const [bulkSizes, setBulkSizes] = useState([{ name: '', group: 'Default' }]);
  const [bulkGroup, setBulkGroup] = useState('Default');
  const [bulkVariations, setBulkVariations] = useState([{ name: '', group: 'Default' }]);
  const [bulkVariationGroup, setBulkVariationGroup] = useState('Default');

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle category change and filter subcategories
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setFormData({
      ...formData,
      categoryId,
      subcategoryId: '' // Reset subcategory when category changes
    });
  };

  // Initialize categoryId from item's subcategory when editing
  useEffect(() => {
    if (item?.subCategory && !formData.categoryId) {
      const subCat = subCategories.find(sc => 
        sc._id === (typeof item.subCategory === 'object' ? item.subCategory._id : item.subCategory)
      );
      if (subCat) {
        const categoryId = typeof subCat.category === 'object' ? subCat.category._id : subCat.category;
        setFormData(prev => ({ ...prev, categoryId }));
      }
    }
  }, [item, subCategories, formData.categoryId]);

  // Filter subcategories based on selected category
  useEffect(() => {
    if (formData.categoryId) {
      const filtered = subCategories.filter(subCat => {
        if (!subCat.category) return false;
        return (typeof subCat.category === 'object' ? subCat.category._id : subCat.category) === formData.categoryId;
      });
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories([]);
    }
  }, [formData.categoryId, subCategories]);

  const loadSubCategoriesByCategory = async (categoryId) => {
    try {
      const response = await fetchSubCategoriesByCategoryId(categoryId);
      setFilteredSubCategories(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error loading subcategories by category:', err);
      setFilteredSubCategories([]);
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setOriginalImageForCrop(imageUrl);
      setShowCropModal(true);
    }
    e.target.value = '';
  };

  // Handle cropped image save
  const handleCroppedImageSave = (croppedBlob) => {
    
    if (!croppedBlob) {
      console.error('ItemForm: No blob received');
      return;
    }
    const croppedFile = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
    
    // Check if this is for food category creation
    if (showCreateFoodCategory) {
      setNewFoodCategory({...newFoodCategory, icon: croppedFile});
    } else {
      setFormData({
        ...formData,
        image: croppedFile
      });
      setImagePreview(URL.createObjectURL(croppedBlob));
    }
    setShowCropModal(false);
  };

  // Handle tag selection (only one at a time)
  const handleTagToggle = (tagId) => {
    const currentTags = formData.tagIds.includes(tagId) ? [] : [tagId];
    setFormData({...formData, tagIds: currentTags});
  };

  // Handle size group selection from dropdown
  const handleSizeGroupSelection = (e) => {
    const selectedGroups = Array.from(e.target.selectedOptions, option => option.value);
    const allSizesInGroups = [];
    
    selectedGroups.forEach(groupName => {
      const sizesInGroup = sizes.filter(size => (size.group || 'Default') === groupName);
      sizesInGroup.forEach(size => {
        const existing = formData.sizePrices.find(sp => sp.sizeId === size._id);
        allSizesInGroups.push(existing || { sizeId: size._id, price: formData.price || 0 });
      });
    });
    
    // Update variations to match new size structure
    const updatedVariations = formData.variations.map(variation => {
      if (allSizesInGroups.length === 0) {
        // No sizes selected - convert to direct pricing
        return {
          ...variation,
          price: variation.price || (variation.sizePrices?.[0]?.price) || formData.price || 0,
          sizePrices: []
        };
      } else {
        // Sizes selected - convert to size-based pricing
        const newSizePrices = allSizesInGroups.map(sp => {
          const existingPrice = variation.sizePrices?.find(vsp => vsp.sizeId === sp.sizeId);
          return {
            sizeId: sp.sizeId,
            price: existingPrice?.price || variation.price || sp.price
          };
        });
        return {
          ...variation,
          sizePrices: newSizePrices
        };
      }
    });
    
    // Update addon prices to match new size structure
    const updatedAddOns = formData.addOns.map(addon => {
      if (allSizesInGroups.length === 0) {
        // No sizes - keep direct price only
        return {
          ...addon,
          prices: []
        };
      } else {
        // Update addon prices for new sizes
        const newPrices = allSizesInGroups.map(sp => {
          const existingPrice = addon.prices?.find(p => p.sizeId === sp.sizeId);
          return {
            sizeId: sp.sizeId,
            price: existingPrice?.price || addon.price || 0
          };
        });
        return {
          ...addon,
          prices: newPrices
        };
      }
    });
    
    setFormData({
      ...formData, 
      sizePrices: allSizesInGroups,
      variations: updatedVariations,
      addOns: updatedAddOns
    });
  };

  // Handle size price change
  const handleSizePriceChange = (sizeId, price) => {
    const updatedSizePrices = formData.sizePrices.map(sp => 
      sp.sizeId === sizeId ? {...sp, price} : sp
    );
    setFormData({...formData, sizePrices: updatedSizePrices});
  };

  // Handle variation group selection
  const handleVariationGroupSelection = (e) => {
    const selectedGroups = Array.from(e.target.selectedOptions, option => option.value);
    const allVariationsInGroups = [];
    
    selectedGroups.forEach(groupName => {
      const variationsInGroup = variations.filter(v => v.isActive && (v.group || 'Default') === groupName);
      variationsInGroup.forEach(variation => {
        const existing = formData.variations.find(v => v.variationId === variation._id);
        
        if (existing) {
          // Keep existing variation as-is
          allVariationsInGroups.push(existing);
        } else {
          // Create new variation based on current size selection
          if (formData.sizePrices.length === 0) {
            // No sizes selected - variation gets direct price
            allVariationsInGroups.push({
              variationId: variation._id,
              price: formData.price || 0,
              isAvailable: true
            });
          } else {
            // Sizes selected - variation gets size-based pricing
            allVariationsInGroups.push({
              variationId: variation._id,
              sizePrices: formData.sizePrices.map(sp => ({ sizeId: sp.sizeId, price: sp.price })),
              isAvailable: true
            });
          }
        }
      });
    });
    
    setFormData({
      ...formData, 
      variations: allVariationsInGroups,
      hasVariations: allVariationsInGroups.length > 0
    });
  };

  // Handle variation price change
  const handleVariationPriceChange = (variationId, sizeId, price) => {
    const updatedVariations = formData.variations.map(variation => {
      if (variation.variationId === variationId) {
        if (sizeId) {
          // Size-based pricing
          const updatedSizePrices = variation.sizePrices.map(sp => 
            sp.sizeId === sizeId ? {...sp, price} : sp
          );
          return {...variation, sizePrices: updatedSizePrices};
        } else {
          // Direct variation pricing (no sizes)
          return {...variation, price: Number(price)};
        }
      }
      return variation;
    });
    setFormData({...formData, variations: updatedVariations});
  };

  // Handle variation availability toggle
  const handleVariationAvailabilityToggle = (variationId) => {
    const updatedVariations = formData.variations.map(variation => 
      variation.variationId === variationId 
        ? {...variation, isAvailable: !variation.isAvailable}
        : variation
    );
    setFormData({...formData, variations: updatedVariations});
  };

  // Add addon to the list
  const handleAddAddon = () => {
    if (formData.addOnName && formData.addOnPrice) {
      const price = Number(formData.addOnPrice);
      
      // Create prices array based on current size/variation structure
      let prices = [];
      
      if (formData.sizePrices.length > 0) {
        // Item has sizes - create price for each size
        prices = formData.sizePrices.map(sp => ({ 
          sizeId: sp.sizeId, 
          price: price 
        }));
      } else if (formData.hasVariations && formData.variations.length > 0) {
        // Item has variations but no sizes - use first available size or create default
        const defaultSizeId = (sizes && sizes.length > 0) ? sizes[0]._id : '';
        prices = [{ sizeId: defaultSizeId, price: price }];
      } else {
        // No sizes or variations - use default size
        const defaultSizeId = (sizes && sizes.length > 0) ? sizes[0]._id : '';
        prices = [{ sizeId: defaultSizeId, price: price }];
      }
      
      setFormData({
        ...formData,
        addOns: [
          ...formData.addOns,
          { 
            addOnItem: formData.addOnName, 
            price: price, // Keep for backward compatibility
            prices: prices, // Add price for each size
            isMultiSelect: false // Default value
          }
        ],
        addOnName: '',
        addOnPrice: ''
      });
    }
  };

  // Remove addon from the list
  const handleRemoveAddon = (index) => {
    setFormData({
      ...formData,
      addOns: formData.addOns.filter((_, idx) => idx !== index)
    });
  };

  // Update addon price
  const handleUpdateAddonPrice = (index, newPrice) => {
    const updatedAddons = [...formData.addOns];
    updatedAddons[index].price = Number(newPrice);
    
    // Also update all size-specific prices if they match the old price
    if (updatedAddons[index].prices && updatedAddons[index].prices.length > 0) {
      updatedAddons[index].prices = updatedAddons[index].prices.map(p => ({
        ...p,
        price: Number(newPrice)
      }));
    }
    
    setFormData({
      ...formData,
      addOns: updatedAddons
    });
  };

  // Toggle field visibility
  const handleVisibilityToggle = (field) => {
    // Don't allow toggling image visibility - always keep it true
    if (field === 'image') return;
    
    setFormData({
      ...formData,
      fieldVisibility: {
        ...formData.fieldVisibility,
        [field]: !formData.fieldVisibility[field]
      }
    });
  };

  // Create new food category
  const handleCreateFoodCategory = async () => {
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', newFoodCategory.name);
      if (newFoodCategory.icon) {
        formDataObj.append('icon', newFoodCategory.icon);
      }
      const response = await createFoodCategory(formDataObj);
      const createdCategory = response.data || response;
      
      // Update local state with new category
      if (onFoodCategoryCreated) {
        onFoodCategoryCreated(createdCategory);
      }
      
      // Auto-select the newly created category
      setFormData(prev => ({ ...prev, foodCategoryId: createdCategory._id }));
      
      setShowCreateFoodCategory(false);
      setNewFoodCategory({ name: '', icon: null });
    } catch (error) {
      console.error('Error creating food category:', error);
    }
  };

  // Bulk size handlers
  const handleBulkSizeInputChange = (index, field, value) => {
    const updatedSizes = [...bulkSizes];
    updatedSizes[index][field] = value;
    setBulkSizes(updatedSizes);
  };

  const handleBulkSizeGroupChange = (newGroup) => {
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

  // Bulk variation handlers
  const handleBulkVariationInputChange = (index, field, value) => {
    const updatedVariations = [...bulkVariations];
    updatedVariations[index][field] = value;
    setBulkVariations(updatedVariations);
  };

  const handleBulkVariationGroupChange = (newGroup) => {
    setBulkVariationGroup(newGroup);
    const updatedVariations = bulkVariations.map(variation => ({ ...variation, group: newGroup }));
    setBulkVariations(updatedVariations);
  };

  const addBulkVariation = () => {
    setBulkVariations([...bulkVariations, { name: '', group: bulkVariationGroup }]);
  };

  const removeBulkVariation = (index) => {
    if (bulkVariations.length > 1) {
      setBulkVariations(bulkVariations.filter((_, i) => i !== index));
    }
  };

  // Create new sizes
  const handleCreateSize = async () => {
    const validSizes = bulkSizes.filter(size => size.name.trim());
    if (validSizes.length === 0) return;

    try {
      const createdSizes = [];
      for (const size of validSizes) {
        const response = await createSize(size);
        const createdSize = response.data || response;
        createdSizes.push(createdSize);
      }
      
      // Update local state with new sizes
      if (onSizeCreated) {
        onSizeCreated(createdSizes);
      }
      
      // Auto-select the newly created sizes
      const newSizePrices = createdSizes.map(size => ({
        sizeId: size._id,
        price: formData.price || 0
      }));
      
      setFormData(prev => ({
        ...prev,
        sizePrices: [...prev.sizePrices, ...newSizePrices]
      }));
      
      setShowCreateSize(false);
      setBulkSizes([{ name: '', group: 'Default' }]);
      setBulkGroup('Default');
    } catch (error) {
      console.error('Error creating sizes:', error);
    }
  };

  // Create new variations
  const handleCreateVariation = async () => {
    const validVariations = bulkVariations.filter(variation => variation.name.trim());
    if (validVariations.length === 0) return;

    try {
      const createdVariations = [];
      for (const variation of validVariations) {
        const response = await createVariation(variation);
        const createdVariation = response.data || response;
        createdVariations.push(createdVariation);
      }
      
      // Update local state with new variations
      if (onVariationCreated) {
        onVariationCreated(createdVariations);
      }
      
      // Auto-select the newly created variations
      const newVariations = createdVariations.map(variation => {
        if (formData.sizePrices.length === 0) {
          return {
            variationId: variation._id,
            price: formData.price || 0,
            isAvailable: true
          };
        } else {
          return {
            variationId: variation._id,
            sizePrices: formData.sizePrices.map(sp => ({ sizeId: sp.sizeId, price: sp.price })),
            isAvailable: true
          };
        }
      });
      
      setFormData(prev => ({
        ...prev,
        variations: [...prev.variations, ...newVariations],
        hasVariations: true
      }));
      
      setShowCreateVariation(false);
      setBulkVariations([{ name: '', group: 'Default' }]);
      setBulkVariationGroup('Default');
    } catch (error) {
      console.error('Error creating variations:', error);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare data for submission
    const submitData = {
      ...formData,
      fieldVisibility: {
        ...formData.fieldVisibility,
        image: true // Ensure image visibility is always true
      }
    };
    
    // Remove temporary fields
    delete submitData.addOnName;
    delete submitData.addOnPrice;
    
    // Preserve the item ID if it exists (for updates)
    if (item && item._id) {
      submitData._id = item._id;
    }
    
    // Check if we're updating an item and if addOns were modified
    const addOnsModified = JSON.stringify(item?.addOns) !== JSON.stringify(formData.addOns);
    
    // Only process addOns if they were modified or if we're creating a new item
    if (addOnsModified || !item || !item._id) {
      // Ensure all addOns have prices for each selected size
      submitData.addOns = submitData.addOns.map(addon => {
        const price = Number(addon.price || 0);
        
        // Make sure we have at least one size
        let defaultSizeId = '';
        
        // First try to get from sizePrices
        if (submitData.sizePrices && submitData.sizePrices.length > 0) {
          defaultSizeId = submitData.sizePrices[0].sizeId;
        } 
        // Then try from sizes array
        else if (sizes && sizes.length > 0) {
          defaultSizeId = sizes[0]._id;
        }
        
        // Ensure defaultSizeId is not undefined or empty
        if (!defaultSizeId) {
          console.error("No valid size ID found for add-on prices");
          // Use a placeholder that will be caught by validation
          defaultSizeId = "000000000000000000000000";
        }
        
        // Create prices array with a price for each selected size
        let addonPrices = [];
        
        if (submitData.sizePrices && submitData.sizePrices.length > 0) {
          // Use selected sizes
          addonPrices = submitData.sizePrices.map(sp => {
            const existingPrice = addon.prices?.find(p => p.sizeId === sp.sizeId);
            return {
              sizeId: sp.sizeId,
              price: existingPrice ? Number(existingPrice.price || price) : price
            };
          });
        } else {
          // Fallback to default size
          addonPrices = [{ sizeId: defaultSizeId, price }];
        }
        
        // Ensure we have at least one price with a valid sizeId
        if (addonPrices.length === 0) {
          addonPrices = [{ sizeId: defaultSizeId, price }];
        }
        
        return {
          addOnItem: addon.addOnItem,
          price: price,
          prices: addonPrices,
          isMultiSelect: addon.isMultiSelect || false
        };
      });
    }
    
    // Convert to FormData if there's a file to upload
    if (submitData.image instanceof File) {
      const formDataObj = new FormData();
      
      // Add item ID for updates
      if (item && item._id) {
        formDataObj.append('_id', item._id);
      }
      
      // Append basic fields
      formDataObj.append('name', submitData.name);
      formDataObj.append('price', submitData.price);
      formDataObj.append('description', submitData.description || '');
      formDataObj.append('show', submitData.show);
      
      // Append arrays as JSON strings
      // Only include addOns if they were modified or if creating a new item
      const addOnsModified = JSON.stringify(item?.addOns) !== JSON.stringify(submitData.addOns);
      if (addOnsModified || !item || !item._id) {
        formDataObj.append('addOns', JSON.stringify(submitData.addOns || []));
      }
      
      // Add sizePrices if selected
      if (submitData.sizePrices && submitData.sizePrices.length > 0) {
        formDataObj.append('sizePrices', JSON.stringify(submitData.sizePrices));
      }
      
      // Add variations if selected
      if (submitData.variations && submitData.variations.length > 0) {
        formDataObj.append('variations', JSON.stringify(submitData.variations));
        formDataObj.append('hasVariations', 'true');
      } else {
        formDataObj.append('hasVariations', 'false');
      }
      
      // Add subcategory ID if creating a new item
      if (isCreating && item?.subCategory?._id) {
        formDataObj.append('subcategoryId', item.subCategory._id);
      }
      
      // Add food category ID if selected
      if (submitData.foodCategoryId) {
        formDataObj.append('foodCategoryId', submitData.foodCategoryId);
      }
      
      // Add subcategory ID if selected
      if (submitData.subcategoryId) {
        formDataObj.append('subcategoryId', submitData.subcategoryId);
      }
      
      // Add tags if selected
      if (submitData.tagIds && submitData.tagIds.length > 0) {
        formDataObj.append('tagIds', JSON.stringify(submitData.tagIds));
        // Also add as tags for backward compatibility
        formDataObj.append('tags', JSON.stringify(submitData.tagIds));
      }
      
      // Append fieldVisibility as JSON string
      formDataObj.append('fieldVisibility', JSON.stringify(submitData.fieldVisibility));
      
      // Append the image file
      formDataObj.append('image', submitData.image);
      
      // Call the save function with FormData
      onSave(formDataObj);
    } else {
      // If no file, just use the JSON data
      // Ensure all fields are properly included
      const finalData = {
        ...submitData,
        foodCategoryId: submitData.foodCategoryId || '',
        subcategoryId: submitData.subcategoryId || '',
        tagIds: submitData.tagIds || [],
        addOns: submitData.addOns || [],
        variations: submitData.variations || [],
        hasVariations: submitData.hasVariations || false
      };
      
      onSave(finalData);
    }
  };

  return (
    <Form className="AdminEditForm" onSubmit={handleSubmit} autoComplete="off">
      <div className="p-3 p-md-4 rounded-4 shadow-sm bg-white">
        {/* Side-by-Side Layout for Image and Basic Info */}
        <Row className="mb-4">
          <Col xs={12} md={4} className="ImageContainerCol">
           
            <div className="AdminEditImageBox">
              {imagePreview ? (
                <img src={imagePreview.startsWith('blob:') ? imagePreview : getImageUrl(imagePreview)} alt="Item" className="w-100 h-auto  shadow-sm" style={{ objectFit: 'cover', minHeight: 180, maxHeight: 220 }} />
              ) : (
                <div style={{ width: '100%', height: 180, background: '#eee', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                  No Image
                </div>
              )}
              <div className="AdminEditImageActions d-flex w-100">
                <Form.Label className="AdminEditImageBtn flex-fill mb-0" style={{ cursor: 'pointer' }}>
                  Change
                  <Form.Control
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handleImageChange}
                  />
                </Form.Label>
                <Button
                  className="AdminEditImageBtn flex-fill"
                  type="button"
                  variant="danger"
                  onClick={() => {
                    setFormData({ ...formData, image: '', });
                    setImagePreview(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          </Col>
          
          <Col xs={12} md={8}>
            {/* Name */}
            <Row className="align-items-center mb-3 g-2">
              <Col xs={12} md="auto">
                <Form.Label className="AdminEditLabel mb-0">Name :</Form.Label>
              </Col>
              <Col xs={12} md>
                <Form.Control
                  className="AdminEditInput"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter item name"
                  autoFocus
                />
              </Col>
            </Row>
            
            {/* Price */}
            <Row className="align-items-center mb-3 g-2">
              <Col xs={12} md="auto">
                <Form.Label className="AdminEditLabel mb-0">Price :</Form.Label>
              </Col>
              <Col xs={12} md>
                <InputGroup>
                  <InputGroup.Text className="AdminEditInputPrefix">Rs.</InputGroup.Text>
                  <Form.Control
                    className="AdminEditInput"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min={0}
                    placeholder="0"
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* Description */}
            <Row className="align-items-center mb-3 g-2">
              <Col xs="auto">
                <Form.Check
                  checked={formData.fieldVisibility?.description}
                  onChange={() => handleVisibilityToggle('description')}
                  className="AdminEditCheckbox"
                  id="desc-check"
                />
              </Col>
              <Col xs="auto">
                <Form.Label className="AdminEditLabel mb-0" htmlFor="desc-check">Description :</Form.Label>
              </Col>
              <Col>
                <Form.Control
                  as="textarea"
                  className="AdminEditTextarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Enter description"
                  maxLength={200}
                />
              </Col>
            </Row>

            {/* Type */}
            <Row className="align-items-center mb-3 g-2">
              <Col xs={12} md="auto">
                <Form.Label className="AdminEditLabel mb-0">Type :</Form.Label>
              </Col>
              <Col xs={12} md>
                <InputGroup>
                  <Form.Select
                    className="AdminEditInput"
                    name="foodCategoryId"
                    value={formData.foodCategoryId}
                    onChange={handleChange}
                  >
                    <option value="">Select Type</option>
                    {foodCategories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </Form.Select>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => setShowCreateFoodCategory(true)}
                    title="Create New Food Category"
                  >
                    <FaPlus />
                  </Button>
                </InputGroup>
              </Col>
            </Row>

            {/* Category */}
            <Row className="align-items-center mb-3 g-2">
              <Col xs={12} md="auto">
                <Form.Label className="AdminEditLabel mb-0">Category :</Form.Label>
              </Col>
              <Col xs={12} md>
                <Form.Select
                  className="AdminEditInput"
                  name="categoryId"
                  value={formData.categoryId || ''}
                  onChange={handleCategoryChange}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            {/* Subcategory */}
            <Row className="align-items-center mb-3 g-2">
              <Col xs={12} md="auto">
                <Form.Label className="AdminEditLabel mb-0">Subcategory :</Form.Label>
              </Col>
              <Col xs={12} md>
                <Form.Select
                  className="AdminEditInput"
                  name="subcategoryId"
                  value={formData.subcategoryId}
                  onChange={handleChange}
                >
                  <option value="">Select Subcategory</option>
                  {filteredSubCategories.map(subCat => (
                    <option key={subCat._id} value={subCat._id}>{subCat.name}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Col>
        </Row>
        
        {/* Full Width Fields */}
        <Row>
          <Col xs={12}>
            {/* Tags */}
            <Row className="align-items-center mb-3 g-2">
              <Col xs={12} md="auto">
                <Form.Label className="AdminEditLabel mb-0">Tags :</Form.Label>
              </Col>
              <Col xs={12} md>
                <div className="d-flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge
                      key={tag._id}
                      className={`AdminEditTag ${formData.tagIds.includes(tag._id) ? 'selected' : ''}`}
                      bg=""
                      style={{
                        '--tag-color': tag.color || '#1976d2',
                        backgroundColor: tag.image ? (formData.tagIds.includes(tag._id) ? 'var(--tag-color)' : 'transparent') : undefined,
                        border: tag.image ? '2px solid var(--tag-color)' : undefined,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onClick={() => handleTagToggle(tag._id)}
                    >
                      {tag.image && (
                        <img 
                          src={getImageUrl(tag.image)} 
                          alt={tag.name}
                          style={{ 
                            width: '16px', 
                            height: '16px', 
                            objectFit: 'cover',
                            borderRadius: '2px'
                          }} 
                        />
                      )}
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </Col>
            </Row>

            {/* Sizes with Price */}
            <Row className="align-items-center mb-2 g-2">
              <Col xs={12} md="auto">
                <div className="d-flex align-items-center">
                  <Form.Check
                    checked={formData.sizePrices.length > 0}
                    readOnly
                    className="AdminEditCheckbox me-2"
                    id="sizes-check"
                    style={{ pointerEvents: 'none' }}
                  />
                  <Form.Label className="AdminEditLabel mb-0" htmlFor="sizes-check">
                    Sizes with Price:
                  </Form.Label>
                </div>
              </Col>
              <Col xs={12} md>
                <InputGroup>
                  <Form.Select
                    className="AdminEditInput"
                    multiple
                    value={[...new Set(formData.sizePrices.map(sp => {
                      const size = sizes.find(s => s._id === sp.sizeId);
                      return size ? (size.group || 'Default') : null;
                    }).filter(Boolean))]}
                    onChange={handleSizeGroupSelection}
                    style={{ minHeight: '80px' }}
                  >
                    {[...new Set(sizes.map(size => size.group || 'Default'))].map(groupName => (
                      <option key={groupName} value={groupName}>
                        {groupName}
                      </option>
                    ))}
                  </Form.Select>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => setShowCreateSize(true)}
                    title="Create New Size"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <FaPlus />
                  </Button>
                </InputGroup>
              </Col>
            </Row>
            {/* Size Prices */}
            {formData.sizePrices.length > 0 && (
              <Row className="align-items-center mb-3 g-2">
                <Col>
                  <div className="d-flex flex-wrap gap-2">
                    {formData.sizePrices.map(sp => {
                      const size = sizes.find(s => s._id === sp.sizeId);
                      return (
                        <span key={sp.sizeId} className="AdminEditSizePriceBox">
                          <Form.Control
                            className="AdminEditPriceInput"
                            type="number"
                            value={sp.price}
                            min={0}
                            onChange={e => handleSizePriceChange(sp.sizeId, e.target.value)}
                          />
                          <span className="ms-2">{size?.name || ''}</span>
                        </span>
                      );
                    })}
                  </div>
                </Col>
              </Row>
            )}

            {/* Variations */}
            <Row className="align-items-center mb-2 g-2">
              <Col xs={12} md="auto">
                <div className="d-flex align-items-center">
                  <Form.Check
                    checked={formData.hasVariations}
                    readOnly
                    className="AdminEditCheckbox me-2"
                    id="variations-check"
                    style={{ pointerEvents: 'none' }}
                  />
                  <Form.Label className="AdminEditLabel mb-0" htmlFor="variations-check">
                    Variations:
                  </Form.Label>
                </div>
              </Col>
              <Col xs={12} md>
                <InputGroup>
                  <Form.Select
                    className="AdminEditInput"
                    multiple
                    value={[...new Set(formData.variations.map(v => {
                      const variation = variations.find(variation => variation._id === v.variationId);
                      return variation ? (variation.group || 'Default') : null;
                    }).filter(Boolean))]}
                    onChange={handleVariationGroupSelection}
                    style={{ minHeight: '80px' }}
                  >
                    {[...new Set(variations.filter(v => v.isActive).map(variation => variation.group || 'Default'))].map(groupName => (
                      <option key={groupName} value={groupName}>
                        {groupName}
                      </option>
                    ))}
                  </Form.Select>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => setShowCreateVariation(true)}
                    title="Create New Variation"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <FaPlus />
                  </Button>
                </InputGroup>
              </Col>
            </Row>

            {/* Variation Prices */}
            {formData.variations.length > 0 && (
              <Row className="mb-3">
                <Col>
                  <div className="AdminEditRow">
                    <h6>Variation Prices:</h6>
                    {formData.variations.map(variation => {
                      const variationObj = variations.find(v => v._id === variation.variationId);
                      const hasDirectPrice = variation.price !== undefined && (!variation.sizePrices || variation.sizePrices.length === 0);
                      const hasSizePrices = variation.sizePrices && variation.sizePrices.length > 0;
                      
                      return (
                        <div key={variation.variationId} className="mb-3 p-3 border rounded">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">{variationObj?.name || 'Variation'}</h6>
                            <Form.Check
                              type="switch"
                              id={`variation-${variation.variationId}-available`}
                              label="Available"
                              checked={variation.isAvailable}
                              onChange={() => handleVariationAvailabilityToggle(variation.variationId)}
                            />
                          </div>
                          <div className="d-flex flex-wrap gap-2">
                            {hasDirectPrice ? (
                              // Direct variation pricing (no sizes)
                              <span className="AdminEditSizePriceBox">
                                <Form.Control
                                  className="AdminEditPriceInput"
                                  type="number"
                                  value={variation.price || 0}
                                  min={0}
                                  onChange={e => handleVariationPriceChange(variation.variationId, null, e.target.value)}
                                />
                                <span className="ms-2">Price</span>
                              </span>
                            ) : hasSizePrices ? (
                              // Size-based pricing
                              variation.sizePrices.map(sp => {
                                const size = sizes.find(s => s._id === sp.sizeId);
                                return (
                                  <span key={sp.sizeId} className="AdminEditSizePriceBox">
                                    <Form.Control
                                      className="AdminEditPriceInput"
                                      type="number"
                                      value={sp.price}
                                      min={0}
                                      onChange={e => handleVariationPriceChange(variation.variationId, sp.sizeId, e.target.value)}
                                    />
                                    <span className="ms-2">{size?.name || ''}</span>
                                  </span>
                                );
                              })
                            ) : (
                              // Fallback - show direct price input
                              <span className="AdminEditSizePriceBox">
                                <Form.Control
                                  className="AdminEditPriceInput"
                                  type="number"
                                  value={variation.price || 0}
                                  min={0}
                                  onChange={e => handleVariationPriceChange(variation.variationId, null, e.target.value)}
                                />
                                <span className="ms-2">Price</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Col>
              </Row>
            )}

            {/* Add Ons */}
            <Row className="mb-3 g-2">
              <Col xs={12}>
                <div className="d-flex align-items-center mb-2">
                  <Form.Check
                    checked={formData.fieldVisibility?.addOns}
                    onChange={() => handleVisibilityToggle('addOns')}
                    className="AdminEditCheckbox me-2"
                    id="addons-check"
                  />
                  <Form.Label className="AdminEditLabel mb-0" htmlFor="addons-check">Add Ons :</Form.Label>
                </div>
                <Row className="g-2">
                  <Col xs={12} sm={6}>
                    <Form.Control
                      className="AdminEditInput"
                      name="addOnName"
                      placeholder="Name"
                      value={formData.addOnName}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col xs={8} sm={4}>
                    <Form.Control
                      className="AdminEditInput"
                      name="addOnPrice"
                      placeholder="Price"
                      type="number"
                      min={0}
                      value={formData.addOnPrice}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col xs={4} sm={2}>
                    <Button
                      className="AdminEditAddBtn w-100"
                      type="button"
                      onClick={handleAddAddon}
                      variant="success"
                    >✓Add</Button>
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* Add Ons Table */}
            <Row>
              <Col>
                <div className="AdminEditRow" style={{ width: '100%' }}>
                  <div className="table-responsive">
                    <table className="AdminItemEditAddonsTable" style={{ 
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      fontSize: '14px'
                    }}>
                      <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                          <th style={{ 
                            padding: '12px 8px',
                            fontWeight: '600',
                            borderBottom: '2px solid #dee2e6',
                            minWidth: '120px',
                            position: 'sticky',
                            left: 0,
                            backgroundColor: '#f8f9fa',
                            zIndex: 10
                          }}>Add-on</th>
                          {formData.hasVariations && formData.variations.length > 0
                            ? formData.variations.flatMap(variation => {
                                const variationObj = variations.find(v => v._id === variation.variationId);
                                const variationName = variationObj?.name || 'Variation';
                                
                                if (variation.sizePrices?.length > 0) {
                                  // Variation with sizes
                                  return variation.sizePrices
                                    .sort((a, b) => {
                                      const sizeA = sizes.find(s => s._id === a.sizeId);
                                      const sizeB = sizes.find(s => s._id === b.sizeId);
                                      return (sizeA?.sortOrder || 0) - (sizeB?.sortOrder || 0);
                                    })
                                    .map(sp => {
                                      const size = sizes.find(s => s._id === sp.sizeId);
                                      return (
                                        <th key={`${variation.variationId}-${sp.sizeId}`} style={{
                                          padding: '8px 6px',
                                          fontWeight: '600',
                                          borderBottom: '2px solid #dee2e6',
                                          minWidth: '90px',
                                          textAlign: 'center',
                                          fontSize: '12px',
                                          lineHeight: '1.2'
                                        }}>
                                          <div style={{ color: '#0066cc', fontWeight: 'bold' }}>
                                            {variationName}
                                          </div>
                                          <div style={{ color: '#666', fontSize: '11px' }}>
                                            {size?.name || 'Size'}
                                          </div>
                                        </th>
                                      );
                                    });
                                } else {
                                  // Variation without sizes
                                  return [<th key={variation.variationId} style={{
                                    padding: '12px 8px',
                                    fontWeight: '600',
                                    borderBottom: '2px solid #dee2e6',
                                    minWidth: '80px',
                                    textAlign: 'center',
                                    color: '#0066cc'
                                  }}>{variationName}</th>];
                                }
                              })
                            : formData.sizePrices.length > 0
                            ? formData.sizePrices
                                .sort((a, b) => {
                                  const sizeA = sizes.find(s => s._id === a.sizeId);
                                  const sizeB = sizes.find(s => s._id === b.sizeId);
                                  return (sizeA?.sortOrder || 0) - (sizeB?.sortOrder || 0);
                                })
                                .map(sp => {
                                  const size = sizes.find(s => s._id === sp.sizeId);
                                  return <th key={sp.sizeId} style={{
                                    padding: '12px 8px',
                                    fontWeight: '600',
                                    borderBottom: '2px solid #dee2e6',
                                    minWidth: '80px',
                                    textAlign: 'center',
                                    color: '#28a745'
                                  }}>{size?.name || 'Size'}</th>;
                                })
                            : <th style={{
                                padding: '12px 8px',
                                fontWeight: '600',
                                borderBottom: '2px solid #dee2e6',
                                minWidth: '80px',
                                textAlign: 'center'
                              }}>Price</th>
                          }
                          <th style={{
                            padding: '12px 8px',
                            fontWeight: '600',
                            borderBottom: '2px solid #dee2e6',
                            width: '60px',
                            textAlign: 'center'
                          }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.addOns.length > 0 ? (
                          formData.addOns.map((addon, i) => (
                            <tr key={i} style={{
                              borderBottom: '1px solid #dee2e6',
                              '&:hover': { backgroundColor: '#f8f9fa' }
                            }}>
                              <td style={{
                                padding: '12px 8px',
                                fontWeight: '500',
                                borderRight: '1px solid #dee2e6',
                                position: 'sticky',
                                left: 0,
                                backgroundColor: 'white',
                                zIndex: 5
                              }}>{addon.addOnItem}</td>
                              {formData.hasVariations && formData.variations.length > 0
                                ? formData.variations.flatMap(variation => {
                                    if (variation.sizePrices?.length > 0) {
                                      // Variation with sizes
                                      return variation.sizePrices
                                        .sort((a, b) => {
                                          const sizeA = sizes.find(s => s._id === a.sizeId);
                                          const sizeB = sizes.find(s => s._id === b.sizeId);
                                          return (sizeA?.sortOrder || 0) - (sizeB?.sortOrder || 0);
                                        })
                                        .map(sp => {
                                          const priceKey = `${variation.variationId}-${sp.sizeId}`;
                                          const priceObj = addon.prices?.find(p => 
                                            p.variationId === variation.variationId && p.sizeId === sp.sizeId
                                          );
                                          return (
                                            <td key={priceKey} style={{
                                              padding: '8px 6px',
                                              textAlign: 'center',
                                              borderRight: '1px solid #dee2e6'
                                            }}>
                                              <Form.Control
                                                className="AdminEditPriceInput"
                                                type="number"
                                                min={0}
                                                value={priceObj?.price || ''}
                                                style={{
                                                  width: '70px',
                                                  fontSize: '13px',
                                                  padding: '6px 8px',
                                                  textAlign: 'center',
                                                  border: '1px solid #ced4da',
                                                  borderRadius: '4px'
                                                }}
                                                onChange={e => {
                                                  const newPrice = e.target.value;
                                                  const updatedAddOns = [...formData.addOns];
                                                  if (!updatedAddOns[i].prices) updatedAddOns[i].prices = [];
                                                  const priceIndex = updatedAddOns[i].prices.findIndex(p => 
                                                    p.variationId === variation.variationId && p.sizeId === sp.sizeId
                                                  );
                                                  if (priceIndex >= 0) {
                                                    updatedAddOns[i].prices[priceIndex].price = newPrice;
                                                  } else {
                                                    updatedAddOns[i].prices.push({ 
                                                      variationId: variation.variationId,
                                                      sizeId: sp.sizeId, 
                                                      price: newPrice 
                                                    });
                                                  }
                                                  setFormData({ ...formData, addOns: updatedAddOns });
                                                }}
                                              />
                                            </td>
                                          );
                                        });
                                    } else {
                                      // Variation without sizes
                                      const priceObj = addon.prices?.find(p => p.variationId === variation.variationId);
                                      return [
                                        <td key={variation.variationId} style={{
                                          padding: '8px',
                                          textAlign: 'center',
                                          borderRight: '1px solid #dee2e6'
                                        }}>
                                          <Form.Control
                                            className="AdminEditPriceInput"
                                            type="number"
                                            min={0}
                                            value={priceObj?.price || ''}
                                            style={{
                                              width: '70px',
                                              fontSize: '13px',
                                              padding: '6px 8px',
                                              textAlign: 'center',
                                              border: '1px solid #ced4da',
                                              borderRadius: '4px'
                                            }}
                                            onChange={e => {
                                              const newPrice = e.target.value;
                                              const updatedAddOns = [...formData.addOns];
                                              if (!updatedAddOns[i].prices) updatedAddOns[i].prices = [];
                                              const priceIndex = updatedAddOns[i].prices.findIndex(p => 
                                                p.variationId === variation.variationId
                                              );
                                              if (priceIndex >= 0) {
                                                updatedAddOns[i].prices[priceIndex].price = newPrice;
                                              } else {
                                                updatedAddOns[i].prices.push({ 
                                                  variationId: variation.variationId,
                                                  price: newPrice 
                                                });
                                              }
                                              setFormData({ ...formData, addOns: updatedAddOns });
                                            }}
                                          />
                                        </td>
                                      ];
                                    }
                                  })
                                : formData.sizePrices.length > 0
                                ? formData.sizePrices
                                    .sort((a, b) => {
                                      const sizeA = sizes.find(s => s._id === a.sizeId);
                                      const sizeB = sizes.find(s => s._id === b.sizeId);
                                      return (sizeA?.sortOrder || 0) - (sizeB?.sortOrder || 0);
                                    })
                                    .map((sp, idx) => {
                                      const priceObj = addon.prices?.find(p => p.sizeId === sp.sizeId);
                                      return (
                                        <td key={idx} style={{
                                          padding: '8px',
                                          textAlign: 'center',
                                          borderRight: '1px solid #dee2e6'
                                        }}>
                                          <Form.Control
                                            className="AdminEditPriceInput"
                                            type="number"
                                            min={0}
                                            value={priceObj?.price || ''}
                                            style={{
                                              width: '70px',
                                              fontSize: '13px',
                                              padding: '6px 8px',
                                              textAlign: 'center',
                                              border: '1px solid #ced4da',
                                              borderRadius: '4px'
                                            }}
                                            onChange={e => {
                                              const newPrice = e.target.value;
                                              const updatedAddOns = [...formData.addOns];
                                              if (!updatedAddOns[i].prices) updatedAddOns[i].prices = [];
                                              const priceIndex = updatedAddOns[i].prices.findIndex(p => p.sizeId === sp.sizeId);
                                              if (priceIndex >= 0) {
                                                updatedAddOns[i].prices[priceIndex].price = newPrice;
                                              } else {
                                                updatedAddOns[i].prices.push({ sizeId: sp.sizeId, price: newPrice });
                                              }
                                              setFormData({ ...formData, addOns: updatedAddOns });
                                            }}
                                          />
                                        </td>
                                      );
                                    })
                                : (
                                  <td style={{
                                    padding: '8px',
                                    textAlign: 'center',
                                    borderRight: '1px solid #dee2e6'
                                  }}>
                                    <Form.Control
                                      className="AdminEditPriceInput"
                                      type="number"
                                      min={0}
                                      value={addon.price || ''}
                                      style={{
                                        width: '70px',
                                        fontSize: '13px',
                                        padding: '6px 8px',
                                        textAlign: 'center',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px'
                                      }}
                                      onChange={e => handleUpdateAddonPrice(i, e.target.value)}
                                    />
                                  </td>
                                )
                              }
                              <td style={{
                                padding: '8px',
                                textAlign: 'center'
                              }}>
                                <Button
                                  className="AdminEditDeleteBtn"
                                  type="button"
                                  variant="outline-danger"
                                  size="sm"
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    padding: '0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '4px'
                                  }}
                                  onClick={() => handleRemoveAddon(i)}
                                  aria-label="Delete Add On"
                                >
                                  <FiTrash2 size={14} />
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={
                              formData.hasVariations && formData.variations.length > 0
                                ? formData.variations.reduce((total, variation) => {
                                    return total + (variation.sizePrices?.length || 1);
                                  }, 0) + 2
                                : formData.sizePrices.length > 0 
                                ? formData.sizePrices.length + 2 
                                : 3
                            } style={{ 
                              textAlign: 'center', 
                              color: '#888',
                              padding: '20px',
                              fontStyle: 'italic',
                              backgroundColor: '#f8f9fa'
                            }}>
                              No Add-ons added yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
        {/* Bottom Buttons */}
        <div className="AdminEditFooter d-flex justify-content-end gap-3 mt-4">
          <Button className="AdminEditCancelBtn px-4 py-2" type="button" variant="danger" onClick={onCancel}>
            <span style={{ fontSize: 22, verticalAlign: 'middle' }}>✗</span> Cancel
          </Button>
          <Button className="AdminEditSaveBtn px-4 py-2" type="submit" variant="success">
            <span style={{ fontSize: 22, verticalAlign: 'middle' }}>✓</span> Save
          </Button>
        </div>
      </div>
      
      {/* Image Crop Modal */}
      <ImageCropModal
        show={showCropModal}
        onHide={() => setShowCropModal(false)}
        onSave={handleCroppedImageSave}
        originalImage={originalImageForCrop}
        aspectRatio={1}
      />

      {/* Create Food Category Modal */}
      <Modal show={showCreateFoodCategory} onHide={() => setShowCreateFoodCategory(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Food Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); handleCreateFoodCategory(); }}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newFoodCategory.name}
                onChange={(e) => setNewFoodCategory({...newFoodCategory, name: e.target.value})}
                required
                placeholder="Enter category name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category Icon</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const imageUrl = URL.createObjectURL(file);
                    setOriginalImageForCrop(imageUrl);
                    setShowCropModal(true);
                  }
                  e.target.value = '';
                }}
                required={!newFoodCategory.icon}
              />
              {newFoodCategory.icon && (
                <div className="mt-2 text-success small">
                  ✓ Image processed and ready to upload
                </div>
              )}
              {newFoodCategory.icon && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(newFoodCategory.icon)}
                    alt="Preview"
                    style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }}
                  />
                </div>
              )}
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2 CancelFoodCategoryBtn" onClick={() => setShowCreateFoodCategory(false)} type="button">
                <span style={{ fontSize: 18, verticalAlign: 'middle' }}>✗</span> Cancel
              </Button>
              <Button variant="primary" type="submit" className='SaveFoodCategoryBtn'>
                <span style={{ fontSize: 18, verticalAlign: 'middle' }}>✓</span> Save
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Create Size Modal */}
      <Modal show={showCreateSize} onHide={() => setShowCreateSize(false)} size="lg">
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
                  onChange={(e) => handleBulkSizeGroupChange(e.target.value)}
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
                          onChange={(e) => handleBulkSizeInputChange(index, 'name', e.target.value)}
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
                          <FaTrash />
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
          <Button variant="secondary" className="me-2 CancelBulkSizeBtn" onClick={() => setShowCreateSize(false)} type="button">
            <span style={{ fontSize: 18, verticalAlign: 'middle' }}>✗</span> Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateSize} disabled={bulkSizes.every(size => !size.name.trim())} className='SaveBulkSizeBtn'>
            <span style={{ fontSize: 18, verticalAlign: 'middle' }}>✓</span> Create {bulkSizes.filter(size => size.name.trim()).length} Sizes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Variation Modal */}
      <Modal show={showCreateVariation} onHide={() => setShowCreateVariation(false)} size="lg">
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
                  value={bulkVariationGroup}
                  onChange={(e) => handleBulkVariationGroupChange(e.target.value)}
                  placeholder="Enter group name (e.g., Pizza Variations, Drink Variations)"
                  className="mb-2"
                />
                <Form.Text className="text-muted">
                  All variations below will be grouped under: <strong>{bulkVariationGroup}</strong>
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
                          onChange={(e) => handleBulkVariationInputChange(index, 'name', e.target.value)}
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
                          <FaTrash />
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
          <Button variant="secondary" className="me-2 CancelFoodCategoryBtn" onClick={() => setShowCreateVariation(false)} type="button">
            <span style={{ fontSize: 18, verticalAlign: 'middle' }}>✗</span> Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateVariation} disabled={bulkVariations.every(variation => !variation.name.trim())} className='SaveFoodCategoryBtn'>
            <span style={{ fontSize: 18, verticalAlign: 'middle' }}>✓</span> Create {bulkVariations.filter(variation => variation.name.trim()).length} Variations
          </Button>
        </Modal.Footer>
      </Modal>
    </Form>
  );
};

export default ItemForm;