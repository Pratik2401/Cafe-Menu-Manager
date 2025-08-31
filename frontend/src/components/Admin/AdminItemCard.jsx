import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Badge, Form } from 'react-bootstrap';
import { updateItemAvailability, updateItem } from '../../api/admin';
import '../../styles/AdminItemCard.css';
import ItemForm from './AdminItemForm';
import Switch from "react-switch";
import { getImageUrl } from '../../utils/imageUrl';

import { FiX, FiCheck, FiMove } from "react-icons/fi";
const AdminItemCard = ({ 
  item, 
  onDelete, 
  onSave, 
  editingItemId, 
  setEditingItemId, 
  foodCategories, 
  tags = [], 
  sizes = [],
  subCategories = [],
  categories = [],
  variations = [],
  dragHandleProps = {},
  onFoodCategoryCreated,
  onSizeCreated,
  onVariationCreated
}) => {
  const [localShow, setLocalShow] = useState(item.show);
  
  useEffect(() => {
    setLocalShow(item.show);
  }, [item.show]);
  
  const {
    _id, name, price, description, image,
    addOns = [], foodCategory, sizePrices = []
  } = item;

  const isEditing = editingItemId === _id;

  const handleAvailabilityToggle = async (checked) => {
    try {
      await updateItemAvailability(_id, checked);
      setLocalShow(checked);
    } catch (err) {
      console.error("Failed to update availability", err);
    }
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingItemId(_id);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(_id);
  };

  const handleCategoryChange = async (categoryId) => {
    try {
      const updatedItem = { ...item, foodCategory: categoryId };
      await updateItem(_id, { foodCategoryId: categoryId });
      onSave(updatedItem);
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleSubcategoryChange = async (subcategoryId) => {
    try {
      const updatedItem = { ...item, subCategory: subcategoryId };
      await updateItem(_id, { subCategory: subcategoryId });
      onSave(updatedItem);
    } catch (error) {
      console.error('Failed to update subcategory:', error);
    }
  };

  return (
    <Card className="item-card">
      <Row className="align-items-start">
        {isEditing ? (
          <Col xs={12}>
            <ItemForm 
              item={item}
              onSave={onSave}
              onCancel={() => setEditingItemId(null)}
              foodCategories={foodCategories}
              tags={tags}
              sizes={sizes}
              subCategories={subCategories}
              categories={categories}
              variations={variations}
              onFoodCategoryCreated={onFoodCategoryCreated}
              onSizeCreated={onSizeCreated}
              onVariationCreated={onVariationCreated}
            />
          </Col>
        ) : (
          <>
            <Row className="g-0 ItemCardDirection">
              {/* Desktop Side-by-Side Layout */}
              <Col xs={12} className="p-3">

                
                {/* Controls - Top Right */}
                <div className="d-flex justify-content-end align-items-center mb-3 gap-3">
                  <Switch
                    checked={localShow}
                    onChange={handleAvailabilityToggle}
                    onColor="#64E239"
                    offColor="#545454"
                    checkedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 16, color: 'white'}}>Show</span>}
                    uncheckedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 16, color: 'white'}}>Hide</span>}
                    width={70}
                    height={30}
                    handleDiameter={22}
                    onClick={e => e.stopPropagation()}
                    onMouseDown={e => e.stopPropagation()}
                    onTouchStart={e => e.stopPropagation()}
                  />
                  
                  <div 
                    className="drag-handle" 
                    style={{ 
                      cursor: 'grab', 
                      padding: '8px',
                      color: '#666',
                      fontSize: '18px',
                      touchAction: 'none',
                      userSelect: 'none',
                      minWidth: '32px',
                      minHeight: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Drag to reorder"
                    {...dragHandleProps}
                  >
                    <FiMove/>
                  </div>
                </div>
                {/* Image and Basic Info Side by Side */}
                <Row className="mb-3 ImageBasicInfoContainer">
                  
                  <Col xs={12} md={8}>
                    <div className="mb-2">
                      <span className="fw-bold InfoTitle">Name :</span>
                      <span className="ms-2 InfoDetails">{name}</span>
                    </div>
                    
                    <div className="mb-2">
                      <span className="fw-bold InfoTitle">Price :</span>
                      <span className="ms-2 InfoDetails">Rs. {price}</span>
                    </div>
                    
                    {description && (
                      <div className="mb-2">
                        <span className="fw-bold InfoTitle">Description :</span>
                        <span className="ms-2 InfoDetails">{description}</span>
                      </div>
                    )}
                    
                    <div className="mb-2">
                      <span className="fw-bold InfoTitle">Type :</span>
                      <span className="ms-2 InfoDetails">
                        {foodCategories.find(cat => cat._id.toString() === (foodCategory?._id || foodCategory)?.toString())?.name || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <span className="fw-bold InfoTitle">Subcategory :</span>
                      <span className="ms-2 InfoDetails">
                        {subCategories.find(subCat => subCat._id.toString() === (item.subCategory?._id || item.subCategory)?.toString())?.name || 'N/A'}
                      </span>
                    </div>
                    

                  </Col>
                   <Col xs={12} md={4} className="d-flex justify-content-center mb-3 mb-md-0">
                    <div 
                      className="item-image-container" 
                      style={{ 
                        width: 250, 
                        height: 250, 
                        borderRadius: 16, 
                        overflow: 'hidden', 
                        background: '#f5f5f5', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}
                    >
                      {image ? (
                        <img 
                          src={getImageUrl(image)} 
                          alt={name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div className="no-image-placeholder">No Image</div>
                      )}
                    </div>
                  </Col>
                 
                </Row>
                
                {/* Tags */}
                <Row className="mb-3">
                  <Col xs={12}>
                    <div>
                      <span className="fw-bold InfoTitle">Tags :</span>
                      {item.tags?.length > 0 ? (
                        item.tags.map(tag => {
                          let tagObj = typeof tag === 'object' ? tag : tags.find(t => t._id === tag);
                          return tagObj ? (
                            <Badge
                              key={tagObj._id}
                              pill
                              style={{ 
                                backgroundColor: tagObj.image ? 'transparent' : (tagObj.color || '#28a745'), 
                                marginLeft: 8,
                                border: tagObj.image ? '1px solid #ddd' : 'none',
                                padding: tagObj.image ? '4px 8px' : '6px 12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              className='InfoDetailsBadge'
                            >
                              {tagObj.image && (
                                <img 
                                  src={getImageUrl(tagObj.image)} 
                                  alt={tagObj.name}
                                  style={{ 
                                    width: '16px', 
                                    height: '16px', 
                                    objectFit: 'cover',
                                    borderRadius: '2px'
                                  }} 
                                />
                              )}
                              {tagObj.name}
                            </Badge>
                          ) : null;
                        })
                      ) : (
                        <span className="text-muted ms-2">None</span>
                      )}
                    </div>
                  </Col>
                </Row>

                {/* Variations and Sizes */}
                {item.hasVariations && item.variations?.length > 0 ? (
                  <Row className="mb-3">
                    <Col xs={12}>
                      <div>
                        <span className="fw-bold InfoTitle">Variations :</span>
                        <div className="ms-2 mt-2">
                          {item.variations.map((variation, idx) => {
                            const variationObj = variations.find(v => v._id === variation.variationId);
                            const hasDirectPrice = variation.price !== undefined && (!variation.sizePrices || variation.sizePrices.length === 0);
                            const hasSizePrices = variation.sizePrices && variation.sizePrices.length > 0;
                            
                            return (
                              <div key={variation.variationId || idx} className="mb-2 p-2 border rounded">
                                <div className="fw-bold text-primary">{variationObj?.name || 'Variation'}</div>
                                <div className="d-flex flex-wrap gap-1 mt-1">
                                  {hasDirectPrice ? (
                                    <span className="badge bg-success">Rs.{variation.price}</span>
                                  ) : hasSizePrices ? (
                                    variation.sizePrices.filter(sp => sp.price > 0).map((sp, spIdx) => {
                                      const size = sizes.find(s => s._id === sp.sizeId);
                                      return (
                                        <span key={sp.sizeId || spIdx} className="badge bg-light text-dark border">
                                          {size?.name || 'Size'}: Rs.{sp.price}
                                        </span>
                                      );
                                    })
                                  ) : (
                                    <span className="badge bg-secondary">No price set</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Col>
                  </Row>
                ) : sizePrices && sizePrices.length > 0 ? (
                  <Row className="mb-3">
                    <Col xs={12}>
                      <div>
                        <span className="fw-bold InfoTitle">Sizes :</span>
                        <div className="ms-2 mt-1 d-flex flex-wrap gap-1">
                          {sizePrices.filter(sp => sp.price > 0).map((sp, idx) => {
                            const size = sizes.find(s => s._id === sp.sizeId);
                            return (
                              <span key={sp.sizeId || idx} className="badge bg-primary">
                                {size?.name || 'Size'}: Rs.{sp.price}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </Col>
                  </Row>
                ) : null}
                
                {/* Add-ons */}
                {addOns && addOns.length > 0 && (
                  <Row className="mb-3">
                    <Col xs={12}>
                      <div>
                        <span className="fw-bold InfoTitle">Add-ons :</span>
                        <div className="ms-2 mt-2">
                          {addOns.map((addon, i) => (
                            <div key={i} className="mb-2 p-2 border rounded">
                              <div className="fw-bold text-success">{addon.addOnItem}</div>
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                {addon.prices && addon.prices.length > 0
                                  ? addon.prices.filter(price => price.price > 0).map((price, j) => {
                                      const size = sizes.find(s => s._id === price.sizeId);
                                      const variation = variations.find(v => v._id === price.variationId);
                                      let label = '';
                                      
                                      if (variation && size) {
                                        label = `${variation.name} - ${size.name}`;
                                      } else if (variation) {
                                        label = variation.name;
                                      } else if (size) {
                                        label = size.name;
                                      } else {
                                        label = 'Price';
                                      }
                                      
                                      return (
                                        <span key={j} className="badge bg-light text-dark border">
                                          {label}: Rs.{price.price}
                                        </span>
                                      );
                                    })
                                  : addon.price > 0 ? <span className="badge bg-success">Rs.{addon.price}</span> : null
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Col>
                  </Row>
                )}
                {/* Edit/Delete Buttons - All Views */}
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button
                    variant="outline-dark"
                    className="rounded-circle p-2"
                    style={{ 
                      width: 40, 
                      height: 40, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                    onClick={handleEditClick}
                    title="Edit"
                  >
                    <i className="bi bi-pencil" />
                  </Button>
                  
                  <Button
                    variant="outline-danger"
                    className="rounded-circle p-2"
                    style={{ 
                      width: 40, 
                      height: 40, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                    onClick={handleDeleteClick}
                    title="Delete"
                  >
                    <i className="bi bi-trash" />
                  </Button>
                </div>

              </Col>
            </Row>
          </>
        )}
      </Row>
    </Card>
  );
};

export default AdminItemCard;