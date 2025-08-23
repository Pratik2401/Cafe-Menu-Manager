import { getImageUrl } from '../../utils/imageUrl';
import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Row, Col, Card, Image } from 'react-bootstrap';
import { 
  createDailyOffer, 
  updateDailyOffer 
} from '../../api/admin';
import { fetchAllItems } from '../../api/admin';
import OfferItemForm from './AdminOfferItemForm';
import ImageCropModal from '../utils/ImageCropModal';
import { useBreadcrumb } from './AdminBreadcrumbContext';
import Swal from 'sweetalert2';
import '../../styles/EventForm.css';

const AdminDailyOfferForm = ({ editingOffer, onSuccess, onCancel }) => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [searchTerms, setSearchTerms] = useState({});
  const [showNewItemForm, setShowNewItemForm] = useState({});
  const fileInputRef = useRef(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImageForCrop, setOriginalImageForCrop] = useState(null);
  const [cropTargetType, setCropTargetType] = useState(null); // 'background', 'promotional', or 'offer'
  const [cropTargetIndex, setCropTargetIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    backgroundImage: null,
    backgroundImagePreview: null,
    promotionalImage: null,
    promotionalImagePreview: null,
    isRecurring: false,
    recurringPattern: {
      frequency: 'weekly',
      dayOfWeek: 0,
      dayOfMonth: 1,
      endRecurrence: ''
    },
    offers: []
  });

  useEffect(() => {
    updateBreadcrumb([
      { 
        label: 'Daily Offers Management',
        onClick: onCancel
      },
      { label: editingOffer ? 'Edit Daily Offer' : 'Create Daily Offer' }
    ]);
    
    loadItems();
    if (editingOffer) {
      populateFormData(editingOffer);
    }
  }, [editingOffer]);

  const loadItems = async () => {
    try {
      const response = await fetchAllItems();
      setItems(response || []);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const populateFormData = (offer) => {
    const processedOffers = (offer.offers || []).map(offerItem => ({
      ...offerItem,
      name: offerItem.name || '',
      description: offerItem.description || '',
      actualPrice: offerItem.actualPrice || 0,
      offerPrice: offerItem.offerPrice || 0,
      imageUrl: offerItem.imageUrl || '',
      imagePreview: offerItem.imageUrl || null,
      items: (offerItem.items || []).map(item => ({
        ...item,
        name: item.name || '',
        price: item.price || 0,
        quantity: item.quantity || 1
      }))
    }));
    
    setFormData({
      name: offer.name,
      description: offer.description || '',
      startDate: offer.startDate.split('T')[0],
      endDate: offer.endDate.split('T')[0],
      startTime: offer.startTime || '',
      endTime: offer.endTime || '',
      backgroundImage: null,
      backgroundImagePreview: offer.backgroundImage || null,
      promotionalImage: null,
      promotionalImagePreview: offer.promotionalImage || null,
      isRecurring: offer.isRecurring || false,
      recurringPattern: {
        frequency: offer.recurringPattern?.frequency || 'weekly',
        dayOfWeek: offer.recurringPattern?.dayOfWeek || 0,
        dayOfMonth: offer.recurringPattern?.dayOfMonth || 1,
        endRecurrence: offer.recurringPattern?.endRecurrence ? offer.recurringPattern.endRecurrence.split('T')[0] : ''
      },
      offers: processedOffers
    });
  };

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
        confirmButtonColor: '#c7281c'
      });
      setLoading(false);
      return;
    }
    
    if (start >= end) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date Range',
        text: 'End date must be after start date',
        confirmButtonColor: '#c7281c'
      });
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('endDate', formData.endDate);
      formDataToSend.append('startTime', formData.startTime || '');
      formDataToSend.append('endTime', formData.endTime || '');
      formDataToSend.append('isRecurring', formData.isRecurring);
      
      if (formData.isRecurring) {
        formDataToSend.append('recurringPattern', JSON.stringify({
          frequency: formData.recurringPattern.frequency,
          dayOfWeek: formData.recurringPattern.dayOfWeek,
          dayOfMonth: formData.recurringPattern.dayOfMonth,
          endRecurrence: formData.recurringPattern.endRecurrence || undefined
        }));
      }
      
      const processedOffers = formData.offers.map(offer => {
        const processedOffer = { ...offer };
        delete processedOffer.imagePreview;
        if (!processedOffer.actualPrice) {
          processedOffer.actualPrice = processedOffer.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
          }, 0);
        }
        // Handle temporary items by marking them as new
        processedOffer.items = processedOffer.items.map(item => {
          if (item.isNew || (item.item && item.item.startsWith('temp_'))) {
            const { item: itemId, ...itemWithoutId } = item;
            return { ...itemWithoutId, isNew: true };
          }
          return item;
        });
        return processedOffer;
      });
      
      formDataToSend.append('offers', JSON.stringify(processedOffers));
      
      if (formData.backgroundImage) {
        formDataToSend.append('backgroundImage', formData.backgroundImage);
      }
      
      if (formData.promotionalImage) {
        formDataToSend.append('promotionalImage', formData.promotionalImage);
      }
      
      // Append offer images
      formData.offers.forEach((offer, index) => {
        if (offer.image) {
          formDataToSend.append(`offerImage_${index}`, offer.image);
        }
      });

      if (editingOffer) {
        await updateDailyOffer(editingOffer._id, formDataToSend);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Daily offer updated successfully!',
          confirmButtonColor: '#c7281c',
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        await createDailyOffer(formDataToSend);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Daily offer created successfully!',
          confirmButtonColor: '#c7281c',
          timer: 3000,
          showConfirmButton: false
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving daily offer:', error);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: error.response?.data?.message || 'Failed to save daily offer',
        confirmButtonColor: '#c7281c'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = async (e, imageType = 'background') => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Image size should not exceed 5MB',
        confirmButtonColor: '#c7281c'
      });
      return;
    }
    
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
    setCropTargetType(imageType);
    setShowCropModal(true);
    e.target.value = '';
  };

  const handleOfferImageChange = async (e, offerIndex) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Image size should not exceed 5MB',
        confirmButtonColor: '#c7281c'
      });
      return;
    }
    
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
    setCropTargetType('offer');
    setCropTargetIndex(offerIndex);
    setShowCropModal(true);
    e.target.value = '';
  };

  const handleCroppedImageSave = (croppedBlob) => {
    const croppedFile = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
    
    if (cropTargetType === 'background') {
      setFormData(prev => ({
        ...prev,
        backgroundImage: croppedFile,
        backgroundImagePreview: URL.createObjectURL(croppedBlob)
      }));
    } else if (cropTargetType === 'promotional') {
      setFormData(prev => ({
        ...prev,
        promotionalImage: croppedFile,
        promotionalImagePreview: URL.createObjectURL(croppedBlob)
      }));
    } else if (cropTargetType === 'offer' && cropTargetIndex !== null) {
      setFormData(prev => ({
        ...prev,
        offers: prev.offers.map((offer, i) => {
          if (i === cropTargetIndex) {
            return {
              ...offer,
              image: croppedFile,
              imagePreview: URL.createObjectURL(croppedBlob)
            };
          }
          return offer;
        })
      }));
    }
  };

  const getAspectRatio = () => {
    if (cropTargetType === 'background') return 3/2;
    if (cropTargetType === 'promotional') return 3/1;
    if (cropTargetType === 'offer') return 1;
    return 16/9;
  };

  const addOffer = () => {
    setFormData(prev => ({
      ...prev,
      offers: [...prev.offers, {
        name: '',
        description: '',
        actualPrice: 0,
        offerPrice: 0,
        imageUrl: '',
        imagePreview: null,
        image: null,
        items: []
      }]
    }));
  };

  const updateOffer = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      offers: prev.offers.map((offer, i) => {
        if (i === index) {
          const updatedOffer = { ...offer, [field]: value };
          if (field === 'items') {
            updatedOffer.actualPrice = value.reduce((total, item) => {
              return total + (item.price * item.quantity);
            }, 0);
          }
          return updatedOffer;
        }
        return offer;
      })
    }));
  };

  const removeOffer = (index) => {
    setFormData(prev => ({
      ...prev,
      offers: prev.offers.filter((_, i) => i !== index)
    }));
  };

  const addItemToOffer = (offerIndex, item) => {
    setFormData(prev => ({
      ...prev,
      offers: prev.offers.map((offer, i) => {
        if (i === offerIndex) {
          const isNewItem = item._id.startsWith('temp_');
          const newItems = [...offer.items, { 
            ...(isNewItem ? {} : { item: item._id }),
            quantity: 1, 
            name: item.name, 
            price: item.price,
            isNew: isNewItem
          }];
          const actualPrice = newItems.reduce((total, itm) => {
            return total + (itm.price * itm.quantity);
          }, 0);
          return {
            ...offer,
            items: newItems,
            actualPrice
          };
        }
        return offer;
      })
    }));
  };

  const removeItemFromOffer = (offerIndex, itemIndex) => {
    setFormData(prev => ({
      ...prev,
      offers: prev.offers.map((offer, i) => {
        if (i === offerIndex) {
          const filteredItems = offer.items.filter((_, j) => j !== itemIndex);
          const actualPrice = filteredItems.reduce((total, itm) => {
            return total + (itm.price * itm.quantity);
          }, 0);
          return {
            ...offer,
            items: filteredItems,
            actualPrice
          };
        }
        return offer;
      })
    }));
  };

  const updateItemQuantity = (offerIndex, itemIndex, quantity) => {
    setFormData(prev => ({
      ...prev,
      offers: prev.offers.map((offer, i) => {
        if (i === offerIndex) {
          const updatedItems = offer.items.map((item, j) => {
            if (j === itemIndex) {
              return { ...item, quantity: parseInt(quantity) || 1 };
            }
            return item;
          });
          const actualPrice = updatedItems.reduce((total, itm) => {
            return total + (itm.price * itm.quantity);
          }, 0);
          return {
            ...offer,
            items: updatedItems,
            actualPrice
          };
        }
        return offer;
      })
    }));
  };

  return (
    <Container className="py-4">
      <Form onSubmit={handleSubmit}>
        <Card className="shadow mb-4">
          <Card.Header as="h5" className="text-white py-3 EventFormHeader" style={{backgroundColor: '#c7281c'}}>
            Step 1: Daily Offer Details
          </Card.Header>
          <Card.Body className="px-3 px-md-4 py-3 py-md-4">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Offer Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter offer name"
                    required
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter offer description"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{formData.isRecurring ? 'Recurring Period Start Date' : 'Start Date'}</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{formData.isRecurring ? 'Recurring Period End Date' : 'End Date'}</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Check 
                type="switch"
                id="recurring-switch"
                label="Recurring Daily Offer"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                className="fs-5"
              />
              <Form.Text className="text-muted">
                {formData.isRecurring ? 
                  'Offer will repeat based on the pattern you set below. Start/End dates define the recurring period.' :
                  'Toggle to create a recurring offer that repeats weekly or monthly.'
                }
              </Form.Text>
            </Form.Group>

            {formData.isRecurring && (
              <Card className="mb-4" style={{ border: '2px solid #c7281c' }}>
                <Card.Header style={{ backgroundColor: 'rgba(199, 40, 28, 0.1)' }}>
                  <h6 className="mb-0">Recurring Pattern Settings</h6>
                  <small className="text-muted">Configure when and how often this offer repeats</small>
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
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>End Recurrence (Optional)</Form.Label>
                        <Form.Control
                          type="date"
                          value={formData.recurringPattern.endRecurrence}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            recurringPattern: { ...prev.recurringPattern, endRecurrence: e.target.value }
                          }))}
                        />
                        <Form.Text className="text-muted">
                          Leave empty for indefinite recurrence
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Background Image (Keep it in 3:2 Format)</Form.Label>
                  <div className="d-flex align-items-center mb-3">
                    {formData.backgroundImagePreview && (
                      <div className="me-3">
                        <Image 
                          src={formData.backgroundImagePreview?.startsWith('blob:') ? formData.backgroundImagePreview : getImageUrl(formData.backgroundImagePreview)} 
                          alt="Background preview" 
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                          thumbnail 
                        />
                      </div>
                    )}
                    <div className="flex-grow-1">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'background')}
                        className="mb-2"
                        ref={fileInputRef}
                      />
                      <div className="text-muted small">
                        Upload a background image for your daily offer (max 5MB)
                      </div>
                    </div>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Promotional Image (Optional)  (Keep it in 3:1 Format)</Form.Label>
                  <div className="d-flex align-items-center mb-3">
                    {formData.promotionalImagePreview && (
                      <div className="me-3">
                        <Image 
                          src={formData.promotionalImagePreview?.startsWith('blob:') ? formData.promotionalImagePreview : getImageUrl(formData.promotionalImagePreview)} 
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
                        Upload promotional image for banners (max 5MB)
                      </div>
                    </div>
                  </div>
                </Form.Group>
              </Col>
            </Row>
            {imageLoading && <div className="text-primary mb-3">Uploading image...</div>}
          </Card.Body>
        </Card>

        <Card className="shadow mb-4">
          <Card.Header as="h5" className="text-white py-3" style={{backgroundColor: '#c7281c'}}>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
              <span>Step 2: Deals & Offers</span>
              <Button 
                variant="light" 
                size="sm" 
                onClick={addOffer}
                className="px-3"
              >
                + Add Deal
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="px-3 px-md-4 py-3 py-md-4">
            {formData.offers.length === 0 ? (
              <div className="alert alert-info" style={{backgroundColor: 'transparent', borderColor: '#c7281c', color: '#c7281c'}}>
                No deals added yet. Create your first deal above.
              </div>
            ) : (
              formData.offers.map((offer, offerIndex) => (
                <Card key={offerIndex} className="p-2 p-md-3 border-light shadow-sm mb-4">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-2">
                    <h6 className="mb-0">Deal #{offerIndex + 1}</h6>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => removeOffer(offerIndex)}
                      className="align-self-end align-self-sm-center"
                    >
                      Remove
                    </Button>
                  </div>

                  <Row className="g-2 g-md-3">
                    <Col sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Deal Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={offer.name}
                          onChange={(e) => updateOffer(offerIndex, 'name', e.target.value)}
                          placeholder="Enter deal name"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Deal Description</Form.Label>
                        <Form.Control
                          type="text"
                          value={offer.description}
                          onChange={(e) => updateOffer(offerIndex, 'description', e.target.value)}
                          placeholder="Enter deal description"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="g-2 g-md-3">
                    <Col sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Original Price (₹)</Form.Label>
                        <Form.Control
                          type="number"
                          value={offer.actualPrice}
                          onChange={(e) => updateOffer(offerIndex, 'actualPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          className="bg-light"
                          readOnly
                        />
                        <Form.Text className="text-muted small">
                          Auto-calculated from items
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Offer Price (₹)</Form.Label>
                        <Form.Control
                          type="number"
                          value={offer.offerPrice}
                          onChange={(e) => updateOffer(offerIndex, 'offerPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          required
                          className="border-success"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label>Offer Image keep it in the ratio of 1:1</Form.Label>
                    <div className="d-flex align-items-center mb-3">
                      {offer.imagePreview && (
                        <div className="me-3">
                          <Image 
                            src={offer.imagePreview?.startsWith('blob:') ? offer.imagePreview : getImageUrl(offer.imagePreview)} 
                            alt="Offer preview" 
                            style={{ width: '80px', height: '80px', objectFit: 'cover' }} 
                            thumbnail 
                          />
                        </div>
                      )}
                      <div className="flex-grow-1">
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleOfferImageChange(e, offerIndex)}
                          className="mb-2"
                        />
                        <div className="text-muted small">
                          Upload an image for this offer (max 5MB)
                        </div>
                      </div>
                    </div>
                  </Form.Group>

                  <div className="mb-4">
                    <div className="mb-3">
                      <h6>Items in this Deal</h6>
                      <Form.Control
                        type="text"
                        placeholder="Search items to add..."
                        value={searchTerms[offerIndex] || ''}
                        onChange={(e) => setSearchTerms(prev => ({ ...prev, [offerIndex]: e.target.value }))}
                        className="mb-2"
                      />
                      {searchTerms[offerIndex] && (
                        <div className="border rounded bg-white" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {items
                            .filter(item => item.name.toLowerCase().includes(searchTerms[offerIndex].toLowerCase()))
                            .map(item => (
                              <div 
                                key={item._id} 
                                className="p-2 border-bottom cursor-pointer hover-bg-light"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  addItemToOffer(offerIndex, item);
                                  setSearchTerms(prev => ({ ...prev, [offerIndex]: '' }));
                                }}
                              >
                                <strong>{item.name}</strong> - ₹{item.price}
                              </div>
                            ))
                          }
                          <div className="p-2 border-top">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => {
                                setShowNewItemForm(prev => ({ ...prev, [offerIndex]: true }));
                                setSearchTerms(prev => ({ ...prev, [offerIndex]: '' }));
                              }}
                              className="w-100"
                            >
                              + Create New Item
                            </Button>
                          </div>
                        </div>
                      )}
                      {showNewItemForm[offerIndex] && (
                        <OfferItemForm
                          onSubmit={(newItem) => {
                            addItemToOffer(offerIndex, newItem);
                            setShowNewItemForm(prev => ({ ...prev, [offerIndex]: false }));
                            setSearchTerms(prev => ({ ...prev, [offerIndex]: '' }));
                          }}
                          onCancel={() => {
                            setShowNewItemForm(prev => ({ ...prev, [offerIndex]: false }));
                          }}
                        />
                      )}
                    </div>

                    {offer.items.length === 0 ? (
                      <div className="text-muted text-center py-3">
                        No items selected. Search and add items above.
                      </div>
                    ) : (
                      <div className="mt-3">
                        {offer.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-2 p-2 p-sm-3 bg-light rounded">
                            <div className="mb-2 mb-sm-0 flex-grow-1">
                              <strong>{item.name}</strong>
                              <div className="text-muted small">₹{item.price} each</div>
                            </div>
                            <div className="d-flex align-items-center gap-2 w-100 w-sm-auto">
                              <span className="me-2 d-none d-sm-inline">Qty:</span>
                              <span className="me-2 d-sm-none">Quantity:</span>
                              <Form.Control
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(offerIndex, itemIndex, e.target.value)}
                                min="1"
                                style={{ width: '70px' }}
                                size="sm"
                              />
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeItemFromOffer(offerIndex, itemIndex)}
                                className="ms-auto ms-sm-2"
                              >
                                <span className="d-none d-sm-inline">Remove</span>
                                <span className="d-sm-none">×</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </Card.Body>
        </Card>

        <Card className="shadow">
          <Card.Header as="h5" className="text-white py-3" style={{backgroundColor: '#c7281c'}}>
            Final Step: {editingOffer ? 'Update Daily Offer' : 'Create Daily Offer'}
          </Card.Header>
          <Card.Body className="px-3 px-md-4 py-3 py-md-4 text-center">
            <p className="mb-3 mb-md-4 text-muted">
              Review your daily offer details and deals above, then click the button below to {editingOffer ? 'update' : 'create'} your daily offer.
            </p>
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-2 gap-sm-3">
              <Button 
                variant="secondary" 
                onClick={onCancel}
                size="lg"
                className="px-4 order-2 order-sm-1"
              >
                Cancel
              </Button>
              <Button 
                style={{backgroundColor: '#64E239', borderColor: '#64E239'}}
                type="submit" 
                disabled={loading}
                size="lg"
                className="px-4 px-sm-5 py-3 EventCreateBtn order-1 order-sm-2"
              >
                {loading ? 'Saving...' : (editingOffer ? 'Update Daily Offer' : 'Create Daily Offer')}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Form>
      
      {/* Image Crop Modal */}
      <ImageCropModal
        show={showCropModal}
        onHide={() => setShowCropModal(false)}
        onSave={handleCroppedImageSave}
        originalImage={originalImageForCrop}
        aspectRatio={getAspectRatio()}
      />
    </Container>
  );
};

export default AdminDailyOfferForm;