import React, { useState, useRef } from 'react';
import { Row, Col, Form, Button, Card, Image } from 'react-bootstrap';
import SelectedItemsList from '../MenuDesignOne/SelectedItemsList';
import EventItemForm from './AdminEventItemForm';
import { createEventItem, uploadOfferImage } from '../../api/admin';
import ImageCropModal from '../utils/ImageCropModal';
import { getImageUrl } from '../../utils/imageUrl';
import Swal from 'sweetalert2';

const OfferForm = ({ 
  currentOffer, 
  editingOfferIndex, 
  selectedItems,
  allItems,
  onOfferChange,
  onSelectItem,
  onRemoveSelectedItem,
  onAddOffer,
  eventId
}) => {

  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImageForCrop, setOriginalImageForCrop] = useState(null);
  
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Image size should not exceed 5MB',
        confirmButtonColor: '#c7281c'
      });
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please upload a valid image file',
        confirmButtonColor: '#c7281c'
      });
      return;
    }
    
    const imageUrl = URL.createObjectURL(file);
    setOriginalImageForCrop(imageUrl);
    setShowCropModal(true);
    e.target.value = '';
  };

  const handleCroppedImageSave = async (croppedBlob) => {
    const croppedFile = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
    
    setImageLoading(true);
    
    try {
      // If we have an eventId and offerId (editing an existing offer), upload directly
      if (eventId && !eventId.startsWith('temp_') && editingOfferIndex >= 0) {
        const offerId = currentOffer._id;
        if (offerId) {
          const formData = new FormData();
          formData.append('image', croppedFile);
          
          const response = await uploadOfferImage(eventId, offerId, formData);
          
          if (response.success) {
            onOfferChange({
              target: {
                name: 'imageUrl',
                value: response.data.imageUrl
              }
            });
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Image uploaded successfully',
              confirmButtonColor: '#c7281c',
              timer: 2000,
              showConfirmButton: false
            });
          }
        } else {
          // Store file for later upload
          onOfferChange({
            target: {
              name: 'imageFile',
              value: croppedFile
            }
          });
          onOfferChange({
            target: {
              name: 'imageUrl',
              value: URL.createObjectURL(croppedBlob)
            }
          });
        }
      } else {
        // Store file for later upload
        onOfferChange({
          target: {
            name: 'imageFile',
            value: croppedFile
          }
        });
        onOfferChange({
          target: {
            name: 'imageUrl',
            value: URL.createObjectURL(croppedBlob)
          }
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Failed to upload image. Please try again.',
        confirmButtonColor: '#c7281c'
      });
    } finally {
      setImageLoading(false);
    }
  };
  
  const handleAddNewItem = async (itemData) => {
    setIsCreatingItem(true);
    try {
      // If we don't have an eventId yet (creating a new event), create a temporary item
      if (!eventId) {
        const tempItem = {
          _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: itemData.itemName,
          itemName: itemData.itemName,
          price: parseFloat(itemData.itemPrice),
          itemPrice: parseFloat(itemData.itemPrice),
          description: itemData.itemDescription || '',
          itemDescription: itemData.itemDescription || '',
          category: itemData.itemCategory,
          itemCategory: itemData.itemCategory,
          eventSpecific: true,
          quantity: 1
        };
        
        // Add to selected items
        onSelectItem(tempItem);
      } else {
        // If we have an eventId, create the item in the database
        // Check if eventId is valid (not temporary)
        if (eventId && eventId.startsWith('temp_')) {
          // For temporary eventIds, create a temporary item instead of API call
          const tempItem = {
            _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: itemData.itemName,
            itemName: itemData.itemName,
            price: parseFloat(itemData.itemPrice),
            itemPrice: parseFloat(itemData.itemPrice),
            description: itemData.itemDescription || '',
            itemDescription: itemData.itemDescription || '',
            category: itemData.itemCategory,
            itemCategory: itemData.itemCategory,
            eventSpecific: true,
            quantity: 1
          };
          
          // Add to selected items
          onSelectItem(tempItem);
          return;
        }
        
        const response = await createEventItem(itemData);
        const createdItem = response.data || response;
        
        // Add to selected items with quantity and ensure price is set
        const itemToAdd = { 
          ...createdItem, 
          quantity: 1,
          price: parseFloat(itemData.itemPrice),
          name: itemData.itemName
        };
        
        onSelectItem(itemToAdd);
      }
    } catch (error) {
      console.error('Error creating event item:', error);
      Swal.fire({
        icon: 'error',
        title: 'Creation Failed',
        text: 'Failed to create event item. Please try again.',
        confirmButtonColor: '#c7281c'
      });
    } finally {
      setIsCreatingItem(false);
    }
  };
  
  return (
    <Card className="p-3 border-light shadow-sm">
      <h6 className="mb-3">{editingOfferIndex >= 0 ? 'Edit Offer' : 'Add New Offer'}</h6>
      
      <Form.Group className="mb-3">
        <Form.Label>Offer Name</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={currentOffer.name}
          onChange={onOfferChange}
          placeholder="e.g. Lunch Special"
          className="form-control-lg"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Offer Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="description"
          value={currentOffer.description}
          onChange={onOfferChange}
          placeholder="Describe the offer"
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Offer Image (Please keep the ratio 1:1) </Form.Label>
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center mb-3">
          {currentOffer.imageUrl && (
            <div className="mb-3 mb-md-0 me-md-3 align-self-center">
              <Image 
                src={currentOffer.imageUrl?.startsWith('blob:') ? currentOffer.imageUrl : getImageUrl(currentOffer.imageUrl)} 
                alt="Offer preview" 
                style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                thumbnail 
              />
            </div>
          )}
          <div className="flex-grow-1 w-100">
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mb-2"
              ref={fileInputRef}
            />
            <div className="text-muted small">
              Upload an image for your offer (max 5MB)
            </div>
            {imageLoading && <div className="text-primary mt-2">Uploading image...</div>}
          </div>
        </div>
        {/* URL input removed as per requirements */}
      </Form.Group>

      {/* Add new event-specific item */}
      <Card className="mb-4 p-3 border rounded bg-light">
        <h6>Add New Event-Specific Item</h6>
        <p className="text-muted small">These items will only be available for this event</p>
        <EventItemForm
          eventId={eventId}
          onSubmit={handleAddNewItem}
        />
      </Card>

      {/* Simple inline search for items */}
      <Card className="mb-3">
        <Card.Header>Search Items</Card.Header>
        <Card.Body>
          <Form.Control
            type="text"
            placeholder="Search items to add to offer..."
            value={searchTerm || ''}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // Filter and show matching items inline
            }}
          />
          {searchTerm && (
            <div className="mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {(allItems || [])
                .filter(item => 
                  item && item.name && 
                  item.name.toLowerCase().includes((searchTerm || '').toLowerCase())
                )
                .slice(0, 10) // Limit to 10 results
                .map(item => (
                  <div 
                    key={item._id} 
                    className="d-flex align-items-center p-2 border-bottom cursor-pointer hover-bg-light"
                    onClick={() => {
                      onSelectItem(item);
                      setSearchTerm(''); // Clear search after selection
                    }}
                  >
                    <div className="flex-grow-1">
                      <div className="fw-bold">{item.name}</div>
                      {item.description && (
                        <div className="text-muted small">{item.description}</div>
                      )}
                    </div>
                    <Button size="sm" variant="outline-primary">
                      Add
                    </Button>
                  </div>
                ))
              }
            </div>
          )}
        </Card.Body>
      </Card>

      <SelectedItemsList 
        items={selectedItems || []} 
        onRemoveItem={onRemoveSelectedItem} 
      />

      <Row className="mt-4 g-3">
        <Col xs={12} md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Regular Price (₹)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="regularPrice"
              value={currentOffer.regularPrice}
              readOnly
              className="bg-light"
            />
            <Form.Text className="text-muted">
              Auto-calculated from items
            </Form.Text>
          </Form.Group>
        </Col>
        <Col xs={12} md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Offer Price (₹)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="offerPrice"
              value={currentOffer.offerPrice}
              onChange={onOfferChange}
              min="0"
              className="border-success"
            />
            <Form.Text className="text-muted">
              Suggested 10% discount
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-end">
        <Button 
          variant="success" 
          onClick={onAddOffer}
          className="mt-2 px-4"
          disabled={selectedItems.length === 0}
        >
          {editingOfferIndex >= 0 ? 'Update Offer' : 'Add Offer'}
        </Button>
      </div>
      
      {/* Image Crop Modal */}
      <ImageCropModal
        show={showCropModal}
        onHide={() => setShowCropModal(false)}
        onSave={handleCroppedImageSave}
        originalImage={originalImageForCrop}
      />
    </Card>
  );
};

export default React.memo(OfferForm);