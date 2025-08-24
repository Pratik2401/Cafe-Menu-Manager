import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getImageUrl } from '../../utils/imageUrl';
import { Modal, Button } from 'react-bootstrap';
import { FiCrop, FiCheck, FiX } from 'react-icons/fi';

const brand = {
  primary: '#c7281c',
  secondary: '#ede1d5',
  light: '#ede1d5'
};

const ImageCropModal = ({ show, onHide, originalImage, onSave, aspectRatio = undefined }) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const imgRef = useRef(null);

  useEffect(() => {
    if (show && originalImage) {
      // Reset crop states when modal opens
      setCrop(undefined);
      setCompletedCrop(undefined);
    }
  }, [show, originalImage]);

  const onImageLoad = useCallback((e) => {
    const image = e.currentTarget;
    let initialCrop;
    
    if (aspectRatio) {
      // Calculate initial crop dimensions based on aspect ratio
      const imageAspect = image.width / image.height;
      
      if (imageAspect > aspectRatio) {
        // Image is wider than desired aspect ratio
        const cropHeight = 90;
        const cropWidth = cropHeight * aspectRatio * (image.height / image.width);
        initialCrop = {
          unit: '%',
          width: cropWidth,
          height: cropHeight,
          x: (100 - cropWidth) / 2,
          y: 5
        };
      } else {
        // Image is taller than desired aspect ratio
        const cropWidth = 90;
        const cropHeight = cropWidth / aspectRatio * (image.width / image.height);
        initialCrop = {
          unit: '%',
          width: cropWidth,
          height: cropHeight,
          x: 5,
          y: (100 - cropHeight) / 2
        };
      }
    } else {
      // Default free crop
      initialCrop = {
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5
      };
    }
    
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  }, [aspectRatio]);

  const getCroppedImg = useCallback(async () => {
    if (!imgRef.current) return null;
    
    // Use completedCrop if available, otherwise use current crop, otherwise use full image
    const cropToUse = completedCrop || crop || {
      unit: '%',
      width: 100,
      height: 100,
      x: 0,
      y: 0
    };
    
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    
    // Convert percentage to pixels
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    let cropX, cropY, cropWidth, cropHeight;
    
    if (cropToUse.unit === '%') {
      cropX = (cropToUse.x / 100) * image.naturalWidth;
      cropY = (cropToUse.y / 100) * image.naturalHeight;
      cropWidth = (cropToUse.width / 100) * image.naturalWidth;
      cropHeight = (cropToUse.height / 100) * image.naturalHeight;
    } else {
      cropX = cropToUse.x * scaleX;
      cropY = cropToUse.y * scaleY;
      cropWidth = cropToUse.width * scaleX;
      cropHeight = cropToUse.height * scaleY;
    }
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );
    
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
  }, [completedCrop, crop]);

  const handleSave = async () => {
    try {
      const blob = await getCroppedImg();
      if (blob) {
        // console.log('ImageCropModal: Generated blob:', blob);
        onSave(blob);
        onHide();
      } else {
        console.error('Failed to generate cropped image');
        alert('Failed to crop image. Please try again.');
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Error processing image. Please try again.');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header style={{ background: brand.primary, color: '#fff' }} closeButton>
        <Modal.Title><FiCrop /> Crop Image</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: brand.light }}>
        {originalImage && (
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            ruleOfThirds
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={originalImage}
              style={{ maxHeight: '70vh', maxWidth: '100%' }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-danger" onClick={onHide}>
          <FiX /> Cancel
        </Button>
        <Button 
          style={{ background: "#1a7432", borderColor: "#1a7432" }} 
          onClick={handleSave}
          disabled={!originalImage}
        >
          <FiCheck /> Apply
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageCropModal;      