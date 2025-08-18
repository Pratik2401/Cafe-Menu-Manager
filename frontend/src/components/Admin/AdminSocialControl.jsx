import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, InputGroup, Form, Button } from "react-bootstrap";
import { FaPencilAlt, FaSave, FaTimes } from 'react-icons/fa';
import { useBreadcrumb } from './AdminBreadcrumbContext';
import '../../styles/AdminSocialControl.css';
import Switch from "react-switch";
import { FaInstagram, FaWhatsapp, FaEnvelope, FaPhone, FaGoogle, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';

import { createSocial, getAllSocials, updateSocial, toggleSocialVisibility } from '../../api/admin';
import ImageCropModal from '../utils/ImageCropModal';
import { getImageUrl } from '../../utils/imageUrl';

const iconMap = {
  Instagram: FaInstagram,
  WhatsApp: FaWhatsapp,
  Email: FaEnvelope,
  'Mobile Number': FaPhone,
  Google: FaGoogle,
  Maps: FaMapMarkerAlt,
  Website: FaGlobe,
};

const iconColors = {
  Instagram: 'var(--bg-secondary)',
  WhatsApp: 'var(--bg-secondary)',
  Email: 'var(--bg-secondary)',
  'Mobile Number': 'var(--bg-secondary)',
  Google: 'var(--bg-secondary)',
  Maps: 'var(--bg-secondary)',
  Website: 'var(--bg-secondary)',
};

const defaultSocials = [
  { platform: 'Mobile Number', url: '', isVisible: false, _id: null },
  { platform: 'Email', url: '', isVisible: false, _id: null },
  { platform: 'Instagram', url: '', isVisible: false, _id: null },
  { platform: 'WhatsApp', url: '', isVisible: false, _id: null },
  { platform: 'Google', url: '', isVisible: false, _id: null },
  { platform: 'Maps', url: '', isVisible: false, _id: null, location: {} },
  { platform: 'Website', url: '', isVisible: false, _id: null, customImage: null },
];

function formatLink(platform, url) {
  switch (platform) {
    case 'Mobile Number': {
      let phoneNumber = url.replace(/[^0-9]/g, '');
      if (phoneNumber.length === 10) {
        phoneNumber = '91' + phoneNumber;
      } else if (phoneNumber.length === 12 && phoneNumber.startsWith('91')) {
        // Already has country code
      } else if (phoneNumber.length > 10 && !phoneNumber.startsWith('91')) {
        phoneNumber = '91' + phoneNumber.slice(-10);
      }
      return `tel:+${phoneNumber}`;
    }
    case 'Email':
      return url.startsWith('mailto:') ? url : `mailto:${url}`;
    case 'WhatsApp': {
      let whatsappNumber = url.replace(/[^0-9]/g, '');
      if (whatsappNumber.length === 10) {
        whatsappNumber = '91' + whatsappNumber;
      } else if (whatsappNumber.length === 12 && whatsappNumber.startsWith('91')) {
        // Already has country code
      } else if (whatsappNumber.length > 10 && !whatsappNumber.startsWith('91')) {
        whatsappNumber = '91' + whatsappNumber.slice(-10);
      }
      return `https://wa.me/${whatsappNumber}`;
    }
    case 'Maps':
      return url.startsWith('http') ? url : `https://maps.google.com/maps?q=${encodeURIComponent(url)}`;
    default:
      return url;
  }
}

export default function AdminSocialControl({ isStandalone = true }) {
  const { updateBreadcrumb } = useBreadcrumb();
  const [socials, setSocials] = useState(defaultSocials);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  // Use platform name or _id as key here to avoid undefined keys
  const [editedUrls, setEditedUrls] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);

  useEffect(() => {
    // Set breadcrumb only if standalone
    if (isStandalone) {
      updateBreadcrumb([
        { label: "Social Management" }
      ]);
    }
    
    fetchSocials();
  }, [updateBreadcrumb, isStandalone]);

  const fetchSocials = async () => {
    try {
      const apiSocials = await getAllSocials();
      const merged = defaultSocials.map(defaultSocial => {
        const found = apiSocials.find(s => s.platform === defaultSocial.platform);
        return found
          ? { ...defaultSocial, ...found }
          : defaultSocial;
      });
      setSocials(merged);
    } catch (err) {
      console.error('Failed to fetch socials', err);
      setSocials(defaultSocials);
    } finally {
      setLoading(false);
    }
  };
const handleToggleVisibility = async (id, platform) => {
  try {
    const currentSocial = socials.find(s => s._id === id || s.platform === platform);
    const newVisibility = !currentSocial?.isVisible;
    
    // Check if trying to show more than 6 icons
    if (newVisibility) {
      const visibleCount = socials.filter(s => s.isVisible).length;
      if (visibleCount >= 6) {
        alert('You can only show up to 6 social icons at a time. Please hide one first.');
        return;
      }
    }
    
    // Update state immediately to prevent refresh
    setSocials(prev => prev.map(social => 
      (social._id === id || social.platform === platform) 
        ? { ...social, isVisible: newVisibility }
        : social
    ));
    
    if (!id) {
      const response = await createSocial({ platform, cafeName: 'My Cafe', url: '', isVisible: true });
      // Update with actual ID from response if needed
      if (response?.data?._id) {
        setSocials(prev => prev.map(social => 
          social.platform === platform && !social._id
            ? { ...social, _id: response.data._id }
            : social
        ));
      }
    } else {
      await toggleSocialVisibility(id, newVisibility);
    }
  } catch (err) {
    console.error('Failed to toggle visibility', err);
    // Revert state on error
    setSocials(prev => prev.map(social => 
      (social._id === id || social.platform === platform) 
        ? { ...social, isVisible: !newVisibility }
        : social
    ));
  }
};  
  const startEditing = (id, platform, currentUrl) => {
    let displayUrl = currentUrl || '';
    if (platform === 'Mobile Number' || platform === 'WhatsApp') {
      const numbers = displayUrl.replace(/[^0-9]/g, '');
      displayUrl = numbers.length > 10 ? numbers.slice(-10) : numbers;
    } else if (displayUrl.startsWith('mailto:')) {
      displayUrl = displayUrl.slice(7);
    }

    setEditingId(id || platform);
    setEditedUrls(prev => ({ ...prev, [id || platform]: displayUrl }));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedUrls({});
    setImageFile(null);
    setImagePreview(null);
    setShowCropModal(false);
    setOriginalImage(null);
  };

  const handleChange = (key, e) => {
    const val = e.target.value;
    setEditedUrls(prev => ({ ...prev, [key]: val }));
  };

  const saveEdit = async (id, platform) => {
    const key = id || platform;
    try {
      const editedUrl = editedUrls[key] || '';
      const formattedUrl = formatLink(platform, editedUrl);

      if (!id) {
        // Creating a new social entry
        if (platform === 'Website' && imageFile) {
          // For Website with custom image, use FormData
          const formData = new FormData();
          formData.append('platform', platform);
          formData.append('cafeName', 'My Cafe');
          formData.append('url', formattedUrl);
          formData.append('isVisible', true);
          formData.append('customImage', imageFile);
          
          try {
            const response = await createSocial(formData);
            
          } catch (error) {
            console.error('Error creating social with image:', error);
            throw new Error('Failed to upload image. Please try again.');
          }
        } else {
          // For regular social media, use JSON
          const response = await createSocial({
            platform,
            cafeName: 'My Cafe',
            url: formattedUrl,
            isVisible: true
          });
         }
      } else {
        // Updating an existing social entry
        if (platform === 'Website' && imageFile) {
          // For Website with updated image, use FormData
          const formData = new FormData();
          formData.append('url', formattedUrl);
          formData.append('customImage', imageFile);
          
          try {
            const response = await updateSocial(id, formData);
            
          } catch (error) {
            console.error('Error updating social with image:', error);
            throw new Error('Failed to upload image. Please try again.');
          }
        } else {
          // For regular update without image change, use JSON
          const response = await updateSocial(id, { url: formattedUrl });
 
        }
      }
      
      // Reset all editing states
      setEditingId(null);
      setEditedUrls({});
      setImageFile(null);
      setImagePreview(null);
      setShowCropModal(false);
      setOriginalImage(null);
      
      // Update state locally instead of refetching
      setSocials(prev => prev.map(social => 
        (social._id === id || social.platform === platform)
          ? { ...social, url: formattedUrl, isVisible: true, _id: id || social._id }
          : social
      ));
      
      // Refresh data from server to ensure we have the latest state
      fetchSocials();
    } catch (err) {
      console.error('Failed to update social', err);
      alert(err.message || 'Failed to save changes. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container className="SocialMediaContainer mt-4 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="SocialMediaContainer mt-4">
      <div className="mb-3 text-center">
        <small className="text-muted">
          Showing {socials.filter(s => s.isVisible).length} of 6 allowed social icons
        </small>
      </div>
      <Row className="g-4">
        {socials.map(({ _id, platform, url, isVisible, customImage }) => {
          const key = _id || platform; // key to use for editedUrls & editingId
          const IconComponent = iconMap[platform] || FaGlobe;
          const iconColor = iconColors[platform] || '#6C757D';
          const useCustomImage = platform === 'Website' && customImage;
          return (
            <Col md={6} key={platform}>
              <Card className="contact-card">
                <div className="icon-wrapper">
                  {useCustomImage ? (
                    <img 
                      src={getImageUrl(customImage)} 
                      alt={platform} 
                    />
                  ) : (
                    <IconComponent 
                      size={40} 
                      color={iconColor} 
                      style={{ width: '40px', height: '40px' }}
                    />
                  )}
                </div>
                <Card.Body>
                  <Card.Title>{platform}</Card.Title>
                 <InputGroup className="mb-3 social-input-group">
  {(platform === 'Mobile Number' || platform === 'WhatsApp') && (
    <InputGroup.Text>+91</InputGroup.Text>
  )}
  <Form.Control
    value={
      editingId === key
        ? editedUrls[key] || ''
        : (() => {
            if (!url) return '';
            if (platform === 'Mobile Number' || platform === 'WhatsApp') {
              const numbers = url.replace(/[^0-9]/g, '');
              return numbers.length > 10 ? numbers.slice(-10) : numbers;
            }
            if (url.startsWith('mailto:')) return url.slice(7);
            if (platform === 'Maps' && url.startsWith('https://maps.google.com/maps?q=')) {
              return decodeURIComponent(url.split('q=')[1]);
            }
            return url;
          })()
    }
    placeholder={
      platform === 'Mobile Number' || platform === 'WhatsApp' 
        ? '9699287188' 
        : platform === 'Maps' 
        ? 'Enter cafe address'
        : platform === 'Website'
        ? 'https://example.com'
        : ''
    }
    onChange={editingId === key ? e => handleChange(key, e) : undefined}
    readOnly={editingId !== key}
    className={editingId === key ? 'editable' : ''}
    autoFocus={editingId === key}
    maxLength={platform === 'Mobile Number' || platform === 'WhatsApp' ? 10 : undefined}
  />
  <InputGroup.Text
    className="edit-icon-btn"
    onClick={
      editingId === key
        ? undefined
        : () => startEditing(_id, platform, url)
    }
    style={{ cursor: editingId === key ? 'default' : 'pointer' }}
  >
    <FaPencilAlt />
  </InputGroup.Text>
  {editingId === key && (
    <>
      <Button variant="outline-success" onClick={() => saveEdit(_id, platform)}>
        <FaSave />
      </Button>
      <Button variant="outline-danger" onClick={cancelEditing}>
        <FaTimes />
      </Button>
    </>
  )}
</InputGroup>
{platform === 'Website' && editingId === key && (
  <div className="mb-3">
    <Form.Label>Custom Icon (Optional)</Form.Label>
    <Form.Control
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('Image size must be less than 5MB');
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            setOriginalImage(e.target.result);
            setShowCropModal(true);
          };
          reader.readAsDataURL(file);
        }
      }}
    />
    {imagePreview && (
      <div className="mt-2">
        <img 
          src={imagePreview} 
          alt="Preview" 
          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
          onError={(e) => {
            console.error('Failed to load image preview');
            e.target.style.display = 'none';
          }}
        />
      </div>
    )}
    {customImage && !imagePreview && (
      <div className="mt-2">
        <p>Current image:</p>
        <img 
          src={getImageUrl(customImage)} 
          alt="Current icon" 
          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
        />
      </div>
    )}
  </div>
)}
<div className="show-switch-row">

   <Switch


onChange={() => handleToggleVisibility(_id, platform)}
    checked={isVisible}
    onColor="#64E239"
    offColor="#545454"
   

           
            checkedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 16, color: 'white'}}>Show</span>}
            uncheckedIcon={<span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 16, color: 'white'}}>Hide</span>}
            width={70}
            height={30}
            handleDiameter={22}
          />
</div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
      
      <ImageCropModal
        show={showCropModal}
        onHide={() => setShowCropModal(false)}
        originalImage={originalImage}
        onSave={(croppedBlob) => {
          setImageFile(croppedBlob);
          const reader = new FileReader();
          reader.onload = (e) => setImagePreview(e.target.result);
          reader.readAsDataURL(croppedBlob);
          setShowCropModal(false);
        }}
      />
    </Container>
  );
}
