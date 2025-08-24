import React, { useState, useEffect, useRef } from 'react';
import { getImageUrl } from '../../utils/imageUrl';
import { Button, Form, Card, Row, Col, Spinner, Image } from 'react-bootstrap';
import { FaSave, FaPalette, FaFont, FaImage, FaInfoCircle, FaUndo } from 'react-icons/fa';
import { fetchCafeSettings, updateMenuCustomization, uploadMenuLogo, uploadMenuBackgroundImage } from '../../api/admin';
import { refreshThemeCSS } from '../../utils/themeUtils';
import { useBreadcrumb } from './AdminBreadcrumbContext';
import { clearCache } from '../../hooks/useApiCache';
import ImageCropModal from '../utils/ImageCropModal';
import Swal from 'sweetalert2';
import '../../styles/MenuCustomization.css';

const MenuCustomization = ({ isStandalone = true }) => {
  const { updateBreadcrumb } = useBreadcrumb();
  
  // State for CSS variable values
  const [cssValues, setCssValues] = useState({
    '--bg-primary': '#FEF8F3',
    
    '--bg-tertiary': '#383838',
    '--bg-secondary': '#FEAD2E',
    '--color-dark': '#383838',
    '--color-accent': '#FEAD2E',
    '--color-secondary': '#666666',
    '--card-bg': '#FFFFFF',
    '--card-text': '#000000'
  });
  
  // State for logo
  const [logoUrl, setLogoUrl] = useState('');
  const [logoBackgroundColor, setLogoBackgroundColor] = useState('#FFFFFF');
  
  // State for background image
  const [backgroundImage, setBackgroundImage] = useState('');

  // UI states
  const [loading, setLoading] = useState(true);
  const [logoLoading, setLogoLoading] = useState(false);
  const [bgImageLoading, setBgImageLoading] = useState(false);
  
  // Refs
  const logoInputRef = useRef(null);
  const bgImageInputRef = useRef(null);
  
  // Image crop states
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImageForCrop, setOriginalImageForCrop] = useState(null);
  const [cropTargetType, setCropTargetType] = useState(null); // 'logo' or 'background'

  // CSS variables to customize
  const cssVariables = {
    backgrounds: [
      { name: '--bg-primary', description: 'Main background' },
      { name: '--bg-secondary', description: 'Headers, active elements' },
      { name: '--bg-tertiary', description: 'Accents, hover states' }
    ],
    fonts: [
      { name: '--color-dark', description: 'Primary text' },
      { name: '--color-accent', description: 'Highlights, active elements' },
      { name: '--color-secondary', description: 'Secondary text' }
    ],
    cards: [
      { name: '--card-bg', description: 'Card background' },
      { name: '--card-text', description: 'Card text' }
    ]
  };

  // Load data on component mount and get current CSS variable values
  useEffect(() => {
    // Set breadcrumb only if standalone
    if (isStandalone) {
      updateBreadcrumb([
        { label: 'Admin Controls' },
        { label: 'Menu Customization' }
      ]);
    }
    
    const loadData = async () => {
      setLoading(true);
      try {
        // Clear cache to ensure fresh data for admin
        clearCache('cafe-settings');
        // Load settings from API
        const response = await fetchCafeSettings();
        
        if (response.data && response.data.menuCustomization) {
          // If we have CSS variables in the database, use those
          if (response.data.menuCustomization.cssVariables) {
            // Merge with default values to ensure all CSS variables are present
            const mergedCssValues = {
              '--bg-primary': '#FEF8F3',
              '--bg-secondary': '#FEAD2E',
              '--bg-tertiary': '#383838',
              '--color-dark': '#383838',
              '--color-accent': '#FEAD2E',
              '--color-secondary': '#666666',
              '--card-bg': '#FFFFFF',
              '--card-text': '#000000',
              ...response.data.menuCustomization.cssVariables
            };
            
            setCssValues(mergedCssValues);
            
            // Also update the CSS variables in :root for preview
            Object.entries(mergedCssValues).forEach(([varName, value]) => {
              document.documentElement.style.setProperty(varName, value);
            });
          } else {
            // Fallback to getting values from current CSS if not in database
            const rootStyles = getComputedStyle(document.documentElement);
            const currentValues = {};
            
            // Get background colors
            cssVariables.backgrounds.forEach(bg => {
              const varName = bg.name;
              const value = rootStyles.getPropertyValue(varName.substring(2)).trim();
              currentValues[varName] = value ? `#${value}` : '';
            });
            
            // Get font colors
            cssVariables.fonts.forEach(font => {
              const varName = font.name;
              const value = rootStyles.getPropertyValue(varName.substring(2)).trim();
              currentValues[varName] = value ? `#${value}` : '';
            });
            
            // Get card colors
            cssVariables.cards.forEach(card => {
              const varName = card.name;
              const value = rootStyles.getPropertyValue(varName.substring(2)).trim();
              currentValues[varName] = value ? `#${value}` : '';
            });
            
            setCssValues(currentValues);
          }
          
          // Set logo URL if available
          if (response.data.menuCustomization.logoUrl) {
            setLogoUrl(response.data.menuCustomization.logoUrl);
          }
          
          // Set logo background color if available
          if (response.data.menuCustomization.logoBackgroundColor) {
            setLogoBackgroundColor(response.data.menuCustomization.logoBackgroundColor);
          }
          
          // Set background image if available
          if (response.data.menuCustomization.backgroundImage) {
            setBackgroundImage(response.data.menuCustomization.backgroundImage);
          }
        }
      } catch (err) {
        Swal.fire('Error', 'Failed to load menu customization settings. Please try again.', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [updateBreadcrumb, isStandalone]);

  // Update DOM when cssValues change (for preview)
  useEffect(() => {
    Object.entries(cssValues).forEach(([varName, value]) => {
      document.documentElement.style.setProperty(varName, value);
    });
  }, [cssValues]);

  // Update logo background color in DOM when it changes
  useEffect(() => {
    document.documentElement.style.setProperty('--logo-bg-color', logoBackgroundColor);
  }, [logoBackgroundColor]);

  // Handle CSS variable value change
  const handleCssValueChange = (varName, value) => {
    setCssValues(prev => ({ ...prev, [varName]: value }));
  };
  
  // Reset to default values
  const handleReset = () => {
    const defaultValues = {
      '--bg-primary': '#FEF8F3',
      '--bg-secondary': '#FEAD2E',
      '--bg-tertiary': '#383838',
      '--color-dark': '#383838',
      '--color-accent': '#FEAD2E',
      '--color-secondary': '#666666',
      '--card-bg': '#FFFFFF',
      '--card-text': '#000000'
    };
    setCssValues(defaultValues);
  };
  
  // Handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Error', 'Logo size should not exceed 5MB', 'error');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire('Error', 'Please upload a valid image file', 'error');
      return;
    }
    
    const imageUrl = URL.createObjectURL(file);
    setOriginalImageForCrop(imageUrl);
    setCropTargetType('logo');
    setShowCropModal(true);
    e.target.value = '';
  };
  
  // Handle background image upload
  const handleBackgroundImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Error', 'Background image size should not exceed 5MB', 'error');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire('Error', 'Please upload a valid image file', 'error');
      return;
    }
    
    // Only use blob URL for cropping modal, never for display or backend
    if (originalImageForCrop && originalImageForCrop.startsWith('blob:')) {
      URL.revokeObjectURL(originalImageForCrop);
    }
    const imageUrl = URL.createObjectURL(file);
    setOriginalImageForCrop(imageUrl);
    setCropTargetType('background');
    setShowCropModal(true);
    e.target.value = '';
  };

  const handleCroppedImageSave = async (croppedBlob) => {
    const croppedFile = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
    
    if (cropTargetType === 'logo') {
      setLogoLoading(true);
      try {
        const formData = new FormData();
        formData.append('logo', croppedFile);
        
        const response = await uploadMenuLogo(formData);
        
        if (response.success) {
          setLogoUrl(response.data.logoUrl);
          Swal.fire('Success', 'Logo uploaded successfully', 'success');
        }
      } catch (err) {
        Swal.fire('Error', 'Failed to upload logo. Please try again.', 'error');
        console.error(err);
      } finally {
        setLogoLoading(false);
      }
    } else if (cropTargetType === 'background') {
      setBgImageLoading(true);
      try {
        const formData = new FormData();
        formData.append('backgroundImage', croppedFile);
        
        const response = await uploadMenuBackgroundImage(formData);
        
        if (response.success) {
          console.log('Background image URL from backend:', response.data.backgroundImage);
          // Only set if not a blob URL
          if (response.data.backgroundImage && !response.data.backgroundImage.startsWith('blob:')) {
            setBackgroundImage(response.data.backgroundImage);
            Swal.fire('Success', 'Background image uploaded successfully', 'success');
          } else {
            Swal.fire('Error', 'Backend returned an invalid image URL. Please check your backend.', 'error');
          }
        }
      } catch (err) {
        Swal.fire('Error', 'Failed to upload background image. Please try again.', 'error');
        console.error(err);
      } finally {
        setBgImageLoading(false);
      }
    }
  };

  // Save menu customization settings
  const handleSaveCustomization = async () => {
    setLoading(true);
    try {
      // Create CSS content with updated variables
      const cssContent = generateUpdatedCssContent(cssValues);
      
      // Save to API
      await updateMenuCustomization({
        cssVariables: {
          ...cssValues,
          '--logo-bg-color': logoBackgroundColor
        },
        logoUrl,
        logoBackgroundColor,
        backgroundImage
      });
      
      // Clear cache to ensure fresh data is fetched
      clearCache('cafe-settings');
      
      // Refresh the theme CSS to apply changes immediately
      refreshThemeCSS();
      
      Swal.fire('Success', 'Menu customization settings updated successfully!', 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to update menu customization settings. Please try again.', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate updated CSS content
  const generateUpdatedCssContent = (values) => {
    // This function would generate the CSS content for colors.css
    return `
:root {
  /* Primary background colors */
  --bg-primary: ${values['--bg-primary']};    /* Main background */
  --bg-secondary: ${values['--bg-secondary']};  /* Headers, active elements */
  --bg-tertiary: ${values['--bg-tertiary']};   /* Accents, hover states */
  
  /* Font colors */
  --color-dark: ${values['--color-dark']};    /* Primary text */
  --color-accent: ${values['--color-accent']};  /* Highlights, active elements */
  
  /* Logo settings */
  --logo-bg-color: ${logoBackgroundColor};  /* Logo background color */
  
  /* Card colors */
  --card-bg: ${values['--card-bg']};    /* Card background */
  --card-text: ${values['--card-text']};  /* Card text */
}

/* 
  Usage:
  
  Background Colors:
  - Use --bg-primary for main background areas
  - Use --bg-secondary for headers and active elements
  - Use --bg-tertiary for accents and hover states
  
  Font Colors:
  - Use --color-dark for primary text
  - Use --color-accent for highlights and active elements
  
  Card Colors:
  - Use --card-bg for card backgrounds
  - Use --card-text for card text
  
  Logo Settings:
  - Use --logo-bg-color for logo background
*/`;
  };


  


  if (loading) {
    return (
      <div className="menu-customization d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" size="lg" />
      </div>
    );
  }

  return (
    <div className="menu-customization">
      <Card>
        <Card.Header>
            <h3 className="section-title">Menu Customization</h3>
          
        </Card.Header>
        <Card.Body>

          <Form>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0"><FaPalette className="me-2" /> Background Colors</h5>
              </Card.Header>
              <Card.Body>
                {cssVariables.backgrounds.map((bg, index) => (
                  <Form.Group key={index} className="mb-3">
                    <Form.Label>{bg.description}</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="color"
                        value={cssValues[bg.name]}
                        onChange={(e) => handleCssValueChange(bg.name, e.target.value)}
                        style={{ marginRight: '8px' }}
                      />
                      <Form.Control
                        type="text"
                        value={cssValues[bg.name]}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (/^#([0-9A-Fa-f]{0,6})$/.test(inputValue) || inputValue === '') {
                            handleCssValueChange(bg.name, inputValue);
                          }
                        }}
                        onBlur={(e) => {
                          const hex = e.target.value.trim();
                          if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
                            handleCssValueChange(bg.name, '#000000');
                          }
                        }}
                        placeholder="#RRGGBB"
                        style={{ width: '100px' }}
                      />
                    </div>
                  </Form.Group>
                ))}
              </Card.Body>
            </Card>
            
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0"><FaFont className="me-2" /> Font Colors</h5>
              </Card.Header>
              <Card.Body>
                {cssVariables.fonts.map((font, index) => (
                  <Form.Group key={index} className="mb-3">
                    <Form.Label>{font.description}</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="color"
                        value={cssValues[font.name]}
                        onChange={(e) => handleCssValueChange(font.name, e.target.value)}
                        style={{ marginRight: '8px' }}
                      />
                      <Form.Control
                        type="text"
                        value={cssValues[font.name]}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (/^#([0-9A-Fa-f]{0,6})$/.test(inputValue) || inputValue === '') {
                            handleCssValueChange(font.name, inputValue);
                          }
                        }}
                        onBlur={(e) => {
                          const hex = e.target.value.trim();
                          if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
                            handleCssValueChange(font.name, '#000000');
                          }
                        }}
                        placeholder="#RRGGBB"
                        style={{ width: '100px' }}
                      />
                    </div>
                  </Form.Group>
                ))}
              </Card.Body>
            </Card>
            
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0"><FaPalette className="me-2" /> Card Colors</h5>
              </Card.Header>
              <Card.Body>
                {cssVariables.cards.map((card, index) => (
                  <Form.Group key={index} className="mb-3">
                    <Form.Label>{card.description}</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="color"
                        value={cssValues[card.name]}
                        onChange={(e) => handleCssValueChange(card.name, e.target.value)}
                        style={{ marginRight: '8px' }}
                      />
                      <Form.Control
                        type="text"
                        value={cssValues[card.name]}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (/^#([0-9A-Fa-f]{0,6})$/.test(inputValue) || inputValue === '') {
                            handleCssValueChange(card.name, inputValue);
                          }
                        }}
                        onBlur={(e) => {
                          const hex = e.target.value.trim();
                          if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
                            handleCssValueChange(card.name, card.name === '--card-bg' ? '#FFFFFF' : '#000000');
                          }
                        }}
                        placeholder="#RRGGBB"
                        style={{ width: '100px' }}
                      />
                    </div>
                  </Form.Group>
                ))}
                
                {/* Card Preview */}
                <div className="mt-4">
                  <Form.Label>Preview</Form.Label>
                  <div 
                    style={{
                      backgroundColor: cssValues['--card-bg'],
                      color: cssValues['--card-text'],
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6',
                      maxWidth: '300px'
                    }}
                  >
                    <h6 style={{ color: cssValues['--card-text'], marginBottom: '8px' }}>Sample Menu Item</h6>
                    <p style={{ color: cssValues['--card-text'], marginBottom: '4px', fontSize: '14px' }}>This is how your menu cards will look with the selected colors.</p>
                    <small style={{ color: cssValues['--card-text'], opacity: 0.8 }}>Price: $12.99</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
            
            {/* Logo Upload */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0"><FaImage className="me-2" /> Menu Logo</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  {logoUrl && (
                    <div className="me-3">
                      <div 
                        className="logo-container" 
                        style={{ 
                          backgroundColor: logoBackgroundColor,
                          width: '100px',
                          height: '100px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          border: '1px solid #dee2e6',
                          borderRadius: '0.375rem'
                        }}
                      >
                        <img 
                          src={logoUrl?.startsWith('blob:') ? logoUrl : getImageUrl(logoUrl)} 
                          alt="Menu Logo" 
                          style={{ 
                            maxWidth: '90px',
                            maxHeight: '90px',
                            objectFit: 'contain'
                          }} 
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex-grow-1">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      ref={logoInputRef}
                    />
                    <div className="text-muted small mt-1">
                      Upload a logo for your menu (max 5MB)
                    </div>
                    {logoLoading && <div className="text-primary mt-2">Uploading logo...</div>}
                  </div>
                </div>
                
                {/* Logo Background Color */}
                <div className="mt-3">
                  <Form.Label>Logo Background Color</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="color"
                      value={logoBackgroundColor}
                      onChange={(e) => setLogoBackgroundColor(e.target.value)}
                      style={{ marginRight: '8px' }}
                    />
                    <Form.Control
                      type="text"
                      value={logoBackgroundColor}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (/^#([0-9A-Fa-f]{0,6})$/.test(inputValue) || inputValue === '') {
                          setLogoBackgroundColor(inputValue);
                        }
                      }}
                      onBlur={(e) => {
                        const hex = e.target.value.trim();
                        if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
                          setLogoBackgroundColor('#FFFFFF');
                        }
                      }}
                      placeholder="#RRGGBB"
                      style={{ width: '100px' }}
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
            
            {/* Background Image Upload */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0"><FaImage className="me-2" /> Menu Background Image</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  {backgroundImage && !backgroundImage.startsWith('blob:') && (
                    <div className="me-3">
                      <Image 
                        src={getImageUrl(backgroundImage)} 
                        alt="Menu Background" 
                        style={{ 
                          width: '150px', 
                          height: '100px', 
                          objectFit: 'cover'
                        }} 
                        thumbnail 
                      />
                    </div>
                  )}
                  <div className="flex-grow-1">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundImageUpload}
                      ref={bgImageInputRef}
                    />
                    <div className="text-muted small mt-1">
                      Upload a background image for your menu (max 5MB)
                    </div>
                    {bgImageLoading && <div className="text-primary mt-2">Uploading background image...</div>}
                  </div>
                </div>
                <div className="text-muted small mt-3">
                  <FaInfoCircle className="me-1" /> 
                  The background image will be displayed on your menu page. For best results, use a high-resolution image with a 9:16 aspect ratio.
                </div>
              </Card.Body>
            </Card>
            
           <div className="d-flex gap-2">
  <Button 
    variant="secondary" 
    onClick={handleReset}
    disabled={loading}
    className='ResetButton flex-grow-1'
  >
  Reset to Default
  </Button>
  <Button 
    variant="primary" 
    onClick={handleSaveCustomization}
    disabled={loading}
    className="flex-grow-1"
  >
    <FaSave className="me-1" /> Update Changes
  </Button>
</div>
          </Form>
        </Card.Body>
      </Card>
      
      {/* Image Crop Modal */}
      <ImageCropModal
        show={showCropModal}
        onHide={() => setShowCropModal(false)}
        onSave={handleCroppedImageSave}
        originalImage={originalImageForCrop}
      />
    </div>
  );
};

export default MenuCustomization;