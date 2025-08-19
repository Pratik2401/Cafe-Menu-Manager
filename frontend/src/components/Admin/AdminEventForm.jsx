import { getImageUrl } from '../../utils/imageUrl';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Container, Form, Button, Row, Col, Card, ListGroup, Image } from 'react-bootstrap';
import { createEvent, updateEvent, fetchAllItems, uploadEventImage, uploadOfferImage } from '../../api/admin';
import '../../styles/EventForm.css';
import OfferItem from './AdminOfferItem';
import OfferForm from './AdminOfferForm';
import { useBreadcrumb } from './AdminBreadcrumbContext';
import ImageCropModal from '../utils/ImageCropModal';
import Swal from 'sweetalert2';

const EventForm = ({ eventData = null, onSuccess }) => {
  const { updateBreadcrumb } = useBreadcrumb();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    maxAttendees: '',
    tags: '',
    eventImageUrl: '',
    promotionalImageUrl: '',
    entryType: 'free',
    price: '0',
    isAgeRestricted: false,
    registrationFormUrl: '',
    isRecurring: false,
    recurringPattern: {
      frequency: 'weekly',
      dayOfWeek: 0,
      dayOfMonth: 1,
      endRecurrence: ''
    }
  });

  const [offers, setOffers] = useState([]);
  const [currentOffer, setCurrentOffer] = useState({
    name: '',
    description: '',
    imageUrl: '',
    items: [],
    regularPrice: 0,
    offerPrice: 0
  });

  const [allItems, setAllItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [editingOfferIndex, setEditingOfferIndex] = useState(-1);
  const fileInputRef = useRef(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImageForCrop, setOriginalImageForCrop] = useState(null);

  const [currentImageType, setCurrentImageType] = useState('event');

  const handleImageChange = async (e, imageType = 'event') => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Image size should not exceed 5MB',
        confirmButtonColor: '#A47248'
      });
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please upload a valid image file',
        confirmButtonColor: '#A47248'
      });
      return;
    }
    
    setCurrentImageType(imageType);
    const imageUrl = URL.createObjectURL(file);
    setOriginalImageForCrop(imageUrl);
    setShowCropModal(true);
    e.target.value = '';
  };

  const handleCroppedImageSave = async (croppedBlob) => {
    const croppedFile = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
    
    setImageLoading(true);
    
    try {
      if (eventData?.eventId) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', croppedFile);
        uploadFormData.append('imageType', currentImageType);
        
        const response = await uploadEventImage(eventData.eventId, uploadFormData);
        
        if (response.success) {
          const imageField = currentImageType === 'event' ? 'eventImageUrl' : 'promotionalImageUrl';
          setFormData(prev => ({
            ...prev,
            [imageField]: response.data.imageUrl
          }));
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `${currentImageType === 'event' ? 'Event' : 'Promotional'} image uploaded successfully`,
            confirmButtonColor: '#A47248',
            timer: 2000,
            showConfirmButton: false
          });
        }
      } else {
        const imageField = currentImageType === 'event' ? 'eventImageUrl' : 'promotionalImageUrl';
        const fileField = currentImageType === 'event' ? 'eventImageFile' : 'promotionalImageFile';
        setFormData(prev => ({
          ...prev,
          [fileField]: croppedFile,
          [imageField]: URL.createObjectURL(croppedBlob)
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Failed to upload image. Please try again.',
        confirmButtonColor: '#A47248'
      });
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    updateBreadcrumb([
      { label: 'Event Management' },
      { label: eventData ? 'Edit Event' : 'Create Event' }
    ]);
    
    fetchItems();
    
    if (eventData) {
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        title: eventData.title || '',
        description: eventData.description || '',
        startDate: formatDate(eventData.startDate) || '',
        endDate: formatDate(eventData.endDate) || '',
        location: eventData.location || '',
        maxAttendees: eventData.maxAttendees || '',
        tags: eventData.tags ? eventData.tags.join(', ') : '',
        eventImageUrl: eventData.eventImageUrl || eventData.imageUrl || '',
        promotionalImageUrl: eventData.promotionalImageUrl || '',
        entryType: eventData.entryType || 'free',
        price: eventData.price ? eventData.price.toString() : '0',
        isAgeRestricted: eventData.isAgeRestricted || false,
        registrationFormUrl: eventData.registrationFormUrl || '',
        isRecurring: eventData.isRecurring || false,
        recurringPattern: {
          frequency: eventData.recurringPattern?.frequency || 'weekly',
          dayOfWeek: eventData.recurringPattern?.dayOfWeek || 0,
          dayOfMonth: eventData.recurringPattern?.dayOfMonth || 1,
          endRecurrence: eventData.recurringPattern?.endRecurrence ? formatDate(eventData.recurringPattern.endRecurrence) : ''
        }
      });

      if (eventData.offers && eventData.offers.length > 0) {
        setOffers(eventData.offers);
      }
    }
  }, [eventData, updateBreadcrumb]);

  const fetchItems = async () => {
    try {
      const response = await fetchAllItems();
      setAllItems(response);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      if (name === 'startDate' || name === 'endDate') {
        const start = new Date(name === 'startDate' ? value : prev.startDate);
        const end = new Date(name === 'endDate' ? value : prev.endDate);
        
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
          Swal.fire({
            icon: 'warning',
            title: 'Invalid Date Range',
            text: 'End date must be after start date',
            confirmButtonColor: '#A47248'
          });
        }
      }
      
      return updated;
    });
  }, []);

  const handleOfferChange = useCallback((e) => {
    const { name, value } = e.target;
    setCurrentOffer(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const calculatePrices = useCallback((items) => {
    const totalRegularPrice = items.reduce((sum, item) => {
      const price = typeof item.price === 'number' ? item.price : 
                   typeof item.itemPrice === 'number' ? item.itemPrice : 
                   parseFloat(item.price || item.itemPrice || 0);
      
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
    
    const suggestedOfferPrice = Math.round(totalRegularPrice * 0.9 * 100) / 100;
    
    return { totalRegularPrice, suggestedOfferPrice };
  }, []);

  const handleSelectItem = useCallback((item) => {
    setSelectedItems(prev => {
      if (prev.some(selected => selected._id === item._id)) return prev;
      
      const itemWithQuantity = { 
        ...item, 
        quantity: 1,
        price: typeof item.price === 'number' ? item.price : 
               typeof item.itemPrice === 'number' ? item.itemPrice : 
               parseFloat(item.price || item.itemPrice || 0)
      };
      
      const updatedItems = [...prev, itemWithQuantity];
      
      const { totalRegularPrice, suggestedOfferPrice } = calculatePrices(updatedItems);
      
      setCurrentOffer(current => ({
        ...current,
        regularPrice: totalRegularPrice,
        offerPrice: suggestedOfferPrice
      }));
      
      return updatedItems;
    });
  }, [calculatePrices]);

  const removeSelectedItem = useCallback((itemId, forceUpdate = false) => {
    setSelectedItems(prev => {
      if (forceUpdate) {
        const { totalRegularPrice, suggestedOfferPrice } = calculatePrices(prev);
        
        setCurrentOffer(current => ({
          ...current,
          regularPrice: totalRegularPrice,
          offerPrice: suggestedOfferPrice
        }));
        
        return [...prev];
      }
      
      const updatedItems = prev.filter(item => item._id !== itemId);
      
      if (updatedItems.length > 0) {
        const { totalRegularPrice, suggestedOfferPrice } = calculatePrices(updatedItems);
        
        setCurrentOffer(current => ({
          ...current,
          regularPrice: totalRegularPrice,
          offerPrice: suggestedOfferPrice
        }));
      } else {
        setCurrentOffer(current => ({
          ...current,
          regularPrice: 0,
          offerPrice: 0
        }));
      }
      
      return updatedItems;
    });
  }, [calculatePrices]);

  const addOffer = useCallback(() => {
    if (selectedItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Items Selected',
        text: 'Please select at least one item for the offer',
        confirmButtonColor: '#A47248'
      });
      return;
    }

    const newOffer = {
      ...currentOffer,
      items: selectedItems.map(item => ({
        itemId: item._id,
        name: item.name || `Item ${item._id.substring(0, 5)}`,
        quantity: item.quantity || 1
      })),
      itemDetails: selectedItems
    };

    if (editingOfferIndex >= 0) {
      setOffers(prev => {
        const updated = [...prev];
        updated[editingOfferIndex] = newOffer;
        return updated;
      });
      setEditingOfferIndex(-1);
    } else {
      setOffers(prev => [...prev, newOffer]);
    }

    setCurrentOffer({
      name: '',
      description: '',
      imageUrl: '',
      imageFile: null,
      items: [],
      regularPrice: 0,
      offerPrice: 0
    });
    setSelectedItems([]);
  }, [currentOffer, selectedItems, editingOfferIndex]);

  const editOffer = useCallback(async (index, eventId) => {
    const offer = offers[index];
    
    let itemObjects = [];
    
    if (offer.items && offer.items.length > 0) {
      // Create promises to fetch item details for each item
      const itemPromises = offer.items.map(async (item) => {
        const itemId = typeof item === 'object' ? item.itemId : item;
        
        // First check allItems (regular menu items)
        let fullItem = allItems.find(i => i._id === itemId);
        
        if (fullItem) {
          const price = fullItem.price || fullItem.itemPrice || 0;
          return {
            ...fullItem,
            _id: itemId,
            name: item.name || fullItem.name,
            price: parseFloat(price) || 0,
            itemPrice: parseFloat(price) || 0,
            quantity: item.quantity || 1
          };
        }
        
        // If not found in allItems, try to fetch from API (for event-specific items)
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL_ADMIN}/event-items/${itemId}`);
          if (response.ok) {
            const result = await response.json();
            const eventItem = result.data;
            const price = eventItem.itemPrice || eventItem.price || 0;
            return {
              _id: itemId,
              name: item.name || eventItem.itemName || eventItem.name,
              price: parseFloat(price) || 0,
              itemPrice: parseFloat(price) || 0,
              quantity: item.quantity || 1,
              eventSpecific: true
            };
          }
        } catch (error) {
          console.error('Error fetching event item:', error);
        }
        
        // Fallback to item data from offer
        return {
          _id: itemId,
          name: item.name || 'Unknown Item',
          price: 0,
          itemPrice: 0,
          quantity: item.quantity || 1
        };
      });
      
      // Wait for all item details to be fetched
      itemObjects = await Promise.all(itemPromises);
    }
    
    const { totalRegularPrice, suggestedOfferPrice } = calculatePrices(itemObjects);
    
    setCurrentOffer({
      name: offer.name,
      description: offer.description,
      imageUrl: offer.imageUrl || '',
      imageFile: null,
      items: offer.items,
      regularPrice: totalRegularPrice,
      offerPrice: offer.offerPrice || suggestedOfferPrice,
      _id: offer._id
    });
    
    setSelectedItems(itemObjects);
    setEditingOfferIndex(index);
  }, [offers, allItems, calculatePrices]);
  
  // Wrap editOffer to handle async nature
  const handleEditOffer = useCallback(async (index, eventId) => {
    await editOffer(index, eventId);
  }, [editOffer]);

  const removeOffer = useCallback((index, eventId) => {
    setOffers(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date',
        text: 'Invalid date format',
        confirmButtonColor: '#A47248'
      });
      setLoading(false);
      return;
    }
    
    if (start >= end) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date Range',
        text: 'End date must be after start date',
        confirmButtonColor: '#A47248'
      });
      setLoading(false);
      return;
    }

    try {
      const eventPayload = {
        ...formData,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        price: formData.entryType !== 'free' ? parseFloat(formData.price) : 0,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
        recurringPattern: formData.isRecurring ? {
          ...formData.recurringPattern,
          endRecurrence: formData.recurringPattern.endRecurrence ? new Date(formData.recurringPattern.endRecurrence) : undefined
        } : undefined,
        offers: offers.map(offer => {
          const processedItems = offer.items.map(item => {
            if (typeof item === 'string') {
              const itemId = item;
              const itemDetail = offer.itemDetails?.find(detail => detail._id === itemId);
              return {
                itemId: itemId,
                name: itemDetail?.name || `Item ${itemId.substring(0, 5)}`,
                quantity: 1
              };
            }
            
            if (!item.name) {
              const itemDetail = offer.itemDetails?.find(detail => detail._id === item.itemId);
              return {
                ...item,
                name: itemDetail?.name || `Item ${item.itemId.substring(0, 5)}`
              };
            }
            
            return {
              itemId: item.itemId,
              name: item.name,
              quantity: item.quantity || 1
            };
          });
          
          const { imageFile, ...offerWithoutImageFile } = offer;
          
          return {
            ...offerWithoutImageFile,
            name: offer.name,
            description: offer.description,
            imageUrl: offer.imageUrl || '',
            items: processedItems,
            itemDetails: offer.itemDetails,
            regularPrice: offer.regularPrice,
            offerPrice: offer.offerPrice
          };
        })
      };

      const { eventImageFile, promotionalImageFile, ...payloadWithoutImageFile } = eventPayload;
      
      let result;
      
      if (eventData) {
        result = await updateEvent(eventData.eventId, payloadWithoutImageFile);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Event updated successfully!',
          confirmButtonColor: '#A47248',
          timer: 3000,
          showConfirmButton: false
        });
        
        if (result.data && result.data.eventId) {
          const eventId = result.data.eventId;
          
          if (formData.eventImageFile) {
            try {
              setImageLoading(true);
              const imageFormData = new FormData();
              imageFormData.append('image', formData.eventImageFile);
              imageFormData.append('imageType', 'event');
              
              const imageResponse = await uploadEventImage(eventId, imageFormData);
              // console.log('Event image updated successfully:', imageResponse);
            } catch (imageError) {
              console.error('Error uploading event image during update:', imageError);
            } finally {
              setImageLoading(false);
            }
          }
          
          if (formData.promotionalImageFile) {
            try {
              setImageLoading(true);
              const imageFormData = new FormData();
              imageFormData.append('image', formData.promotionalImageFile);
              imageFormData.append('imageType', 'promotional');
              
              const imageResponse = await uploadEventImage(eventId, imageFormData);
              // console.log('Promotional image updated successfully:', imageResponse);
            } catch (imageError) {
              console.error('Error uploading promotional image during update:', imageError);
            } finally {
              setImageLoading(false);
            }
          }
          
          for (let i = 0; i < offers.length; i++) {
            const offer = offers[i];
            if (offer.imageFile && offer._id) {
              try {
                const imageFormData = new FormData();
                imageFormData.append('image', offer.imageFile);
                
                const offerImageResponse = await uploadOfferImage(eventId, offer._id, imageFormData);
                // console.log(`Image for offer ${i} uploaded successfully:`, offerImageResponse);
              } catch (imageError) {
                console.error(`Error uploading image for offer ${i}:`, imageError);
              }
            }
          }
        }
      } else {
        result = await createEvent(payloadWithoutImageFile);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Event created successfully!',
          confirmButtonColor: '#A47248',
          timer: 3000,
          showConfirmButton: false
        });
        
        if (result.data && result.data.eventId) {
          const eventId = result.data.eventId;
          
          if (formData.eventImageFile) {
            try {
              setImageLoading(true);
              const imageFormData = new FormData();
              imageFormData.append('image', formData.eventImageFile);
              imageFormData.append('imageType', 'event');
              
              const imageResponse = await uploadEventImage(eventId, imageFormData);
              // console.log('Event image uploaded successfully:', imageResponse);
            } catch (imageError) {
              console.error('Error uploading event image after creation:', imageError);
            } finally {
              setImageLoading(false);
            }
          }
          
          if (formData.promotionalImageFile) {
            try {
              setImageLoading(true);
              const imageFormData = new FormData();
              imageFormData.append('image', formData.promotionalImageFile);
              imageFormData.append('imageType', 'promotional');
              
              const imageResponse = await uploadEventImage(eventId, imageFormData);
              // console.log('Promotional image uploaded successfully:', imageResponse);
            } catch (imageError) {
              console.error('Error uploading promotional image after creation:', imageError);
            } finally {
              setImageLoading(false);
            }
          }
          
          if (result.data.offers && result.data.offers.length > 0) {
            for (let i = 0; i < result.data.offers.length; i++) {
              const serverOffer = result.data.offers[i];
              const clientOffer = offers[i];
              
              if (clientOffer.imageFile && serverOffer._id) {
                try {
                  const imageFormData = new FormData();
                  imageFormData.append('image', clientOffer.imageFile);
                  
                  const offerImageResponse = await uploadOfferImage(eventId, serverOffer._id, imageFormData);
                  // console.log(`Image for new offer ${i} uploaded successfully:`, offerImageResponse);
                } catch (imageError) {
                  console.error(`Error uploading image for offer ${i}:`, imageError);
                }
              }
            }
          }
        }
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: error.response?.data?.message || 'Failed to save event',
        confirmButtonColor: '#A47248'
      });
    } finally {
      setLoading(false);
    }
  };

  const offersList = useMemo(() => (
    offers.length === 0 ? (
      <div className="alert alert-info" style={{backgroundColor: 'transparent', borderColor: '#c7281c', color: '#c7281c'}}>
        No offers added yet. Create your first offer below.
      </div>
    ) : (
      <ListGroup className="mb-3 shadow-sm">
        {offers.map((offer, index) => (
          <OfferItem 
            key={index}
            offer={offer}
            index={index}
            onEdit={handleEditOffer}
            onRemove={removeOffer}
            eventId={eventData?.eventId}
          />
        ))}
      </ListGroup>
    )
  ), [offers, handleEditOffer, removeOffer]);

  return (
    <Container className="py-4">
      <Form onSubmit={handleSubmit}>
        <Card className="shadow mb-4">
          <Card.Header as="h5" className="text-white py-3 EventFormHeader" style={{backgroundColor: '#c7281c'}}>
            Step 1: Event Details
          </Card.Header>
          <Card.Body className="px-4 py-4">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Event Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Check 
                type="switch"
                id="recurring-switch"
                label="Recurring Event"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                className="fs-5"
              />
              <Form.Text className="text-muted">
                {formData.isRecurring ? 
                  'Event will repeat based on the pattern you set below. Start/End dates define the recurring period.' :
                  'Toggle to create a recurring event that repeats weekly or monthly.'
                }
              </Form.Text>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{formData.isRecurring ? 'Recurring Period Start Date & Event Start Time' : 'Start Date & Time'}</Form.Label>
                  <Row>
                    <Col xs={7}>
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                        onChange={(e) => {
                          const time = formData.startDate ? formData.startDate.split('T')[1] : '09:00';
                          handleChange({target: {name: 'startDate', value: `${e.target.value}T${time}`}});
                        }}
                        required
                      />
                    </Col>
                    <Col xs={5}>
                      <Form.Select
                        name="startTime"
                        value={formData.startDate ? formData.startDate.split('T')[1] : '09:00'}
                        onChange={(e) => {
                          const date = formData.startDate ? formData.startDate.split('T')[0] : new Date().toISOString().split('T')[0];
                          handleChange({target: {name: 'startDate', value: `${date}T${e.target.value}`}});
                        }}
                        required
                      >
                        {Array.from({length: 48}, (_, i) => {
                          const hour = Math.floor(i / 2);
                          const minute = (i % 2) * 30;
                          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                          return <option key={time} value={time}>{time}</option>;
                        })}
                      </Form.Select>
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{formData.isRecurring ? 'Recurring Period End Date & Event End Time' : 'End Date & Time'}</Form.Label>
                  <Row>
                    <Col xs={7}>
                      <Form.Control
                        type="date"
                        name="endDate"
                        value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                        onChange={(e) => {
                          const time = formData.endDate ? formData.endDate.split('T')[1] : '18:00';
                          handleChange({target: {name: 'endDate', value: `${e.target.value}T${time}`}});
                        }}
                        required
                      />
                    </Col>
                    <Col xs={5}>
                      <Form.Select
                        name="endTime"
                        value={formData.endDate ? formData.endDate.split('T')[1] : '18:00'}
                        onChange={(e) => {
                          const date = formData.endDate ? formData.endDate.split('T')[0] : new Date().toISOString().split('T')[0];
                          handleChange({target: {name: 'endDate', value: `${date}T${e.target.value}`}});
                        }}
                        required
                      >
                        {Array.from({length: 48}, (_, i) => {
                          const hour = Math.floor(i / 2);
                          const minute = (i % 2) * 30;
                          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                          return <option key={time} value={time}>{time}</option>;
                        })}
                      </Form.Select>
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Event Image </Form.Label>
                  <div className="d-flex align-items-center mb-3">
                    {formData.eventImageUrl && (
                      <div className="me-3">
                        <Image 
                          src={formData.eventImageUrl?.startsWith('blob:') ? formData.eventImageUrl : getImageUrl(formData.eventImageUrl)} 
                          alt="Event preview" 
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                          thumbnail 
                        />
                      </div>
                    )}
                    <div className="flex-grow-1">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'event')}
                        className="mb-2"
                      />
                      <div className="text-muted small">
                        Upload main event image (max 5MB)
                      </div>
                    </div>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Promotional Image (Optional Keep it in 3:1 ratio)</Form.Label>
                  <div className="d-flex align-items-center mb-3">
                    {formData.promotionalImageUrl && (
                      <div className="me-3">
                        <Image 
                          src={formData.promotionalImageUrl?.startsWith('blob:') ? formData.promotionalImageUrl : getImageUrl(formData.promotionalImageUrl)} 
                          alt="Promotional preview" 
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                          thumbnail 
                        />
                      </div>
                    )}
                    <div className="flex-grow-1">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'promotional')}
                        className="mb-2"
                      />
                      <div className="text-muted small">
                        Upload promotional image (max 5MB)
                      </div>
                    </div>
                  </div>
                </Form.Group>
              </Col>
            </Row>
            {imageLoading && <div className="text-primary mb-3">Uploading image...</div>}
            
            {formData.isRecurring && (
              <Card className="mb-4" style={{ border: '2px solid #c7281c' }}>
                <Card.Header style={{ backgroundColor: 'rgba(199, 40, 28, 0.1)' }}>
                  <h6 className="mb-0">Recurring Pattern Settings</h6>
                  <small className="text-muted">Configure when and how often this event repeats</small>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Frequency</Form.Label>
                        <Form.Select
                          value={formData.recurringPattern.frequency}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            recurringPattern: { ...prev.recurringPattern, frequency: e.target.value }
                          }))}
                        >
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    {formData.recurringPattern.frequency === 'weekly' && (
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Day of Week</Form.Label>
                          <Form.Select
                            value={formData.recurringPattern.dayOfWeek}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              recurringPattern: { ...prev.recurringPattern, dayOfWeek: parseInt(e.target.value) }
                            }))}
                          >
                            <option value={0}>Sunday</option>
                            <option value={1}>Monday</option>
                            <option value={2}>Tuesday</option>
                            <option value={3}>Wednesday</option>
                            <option value={4}>Thursday</option>
                            <option value={5}>Friday</option>
                            <option value={6}>Saturday</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    )}
                    {formData.recurringPattern.frequency === 'monthly' && (
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Day of Month</Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            max="31"
                            value={formData.recurringPattern.dayOfMonth}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              recurringPattern: { ...prev.recurringPattern, dayOfMonth: parseInt(e.target.value) }
                            }))}
                          />
                        </Form.Group>
                      </Col>
                    )}

                  </Row>
                </Card.Body>
              </Card>
            )}
          </Card.Body>
        </Card>

        <Card className="shadow mb-4">
          <Card.Header as="h5" className="text-white py-3 EventFormHeader" style={{backgroundColor: '#c7281c'}}>
            Step 2: Event Settings
          </Card.Header>
          <Card.Body className="px-4 py-4">
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Maximum Attendees (Optional)</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxAttendees"
                    value={formData.maxAttendees}
                    onChange={handleChange}
                    min="1"
                    placeholder="Leave empty for unlimited"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Entry Type</Form.Label>
                  <Form.Select
                    name="entryType"
                    value={formData.entryType}
                    onChange={handleChange}
                    required
                  >
                    <option value="free">Free Entry</option>
                    <option value="cover">Cover Charge</option>
                    <option value="ticket">Entry Fee</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    disabled={formData.entryType === 'free'}
                    required={formData.entryType !== 'free'}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Tags (Optional, comma separated)</Form.Label>
                  <Form.Control
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g. workshop, networking, promotion"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Age Restriction</Form.Label>
                  <Form.Check 
                    type="switch"
                    id="age-restriction-switch"
                    label="18+ Event"
                    name="isAgeRestricted"
                    checked={formData.isAgeRestricted}
                    onChange={(e) => handleChange({
                      target: {
                        name: 'isAgeRestricted',
                        value: e.target.checked
                      }
                    })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Registration Form URL (Google Forms)</Form.Label>
              <Form.Control
                type="url"
                name="registrationFormUrl"
                value={formData.registrationFormUrl}
                onChange={handleChange}
                placeholder="https://forms.google.com/..."
              />
              <Form.Text className="text-muted">
                Optional: Add a Google Forms link for event registration
              </Form.Text>
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="shadow mb-4">
          <Card.Header as="h5" className="text-white py-3" style={{backgroundColor: '#c7281c'}}>
            Step 3: Event Offers (Optional)
          </Card.Header>
          <Card.Body className="px-4 py-4">
            <div className="mb-4">
              <h6 className="mb-3">Current Offers</h6>
              {offersList}
            </div>

            <OfferForm
              currentOffer={currentOffer}
              editingOfferIndex={editingOfferIndex}
              selectedItems={selectedItems}
              allItems={allItems}
              onOfferChange={handleOfferChange}
              onSelectItem={handleSelectItem}
              onRemoveSelectedItem={removeSelectedItem}
              onAddOffer={addOffer}
              eventId={eventData?.eventId}
            />
          </Card.Body>
        </Card>

        <Card className="shadow">
          <Card.Header as="h5" className="text-white py-3" style={{backgroundColor: '#c7281c'}}>
            Final Step: {eventData ? 'Update Event' : 'Create Event'}
          </Card.Header>
          <Card.Body className="px-4 py-4 text-center">
            <p className="mb-4 text-muted">
              Review your event details and offers above, then click the button below to {eventData ? 'update' : 'create'} your event.
            </p>
            <Button 
              style={{backgroundColor: '#64E239', borderColor: '#64E239'}}
              type="submit" 
              disabled={loading}
              size="lg"
              className="px-5 py-3 EventCreateBtn"
            >
              {loading ? 'Saving...' : (eventData ? 'Update Event' : 'Create Event')}
            </Button>
          </Card.Body>
        </Card>
      </Form>
      
      {/* Image Crop Modal */}
      <ImageCropModal
        show={showCropModal}
        onHide={() => setShowCropModal(false)}
        onSave={handleCroppedImageSave}
        originalImage={originalImageForCrop}
      />
    </Container>
  );
};

export default EventForm;