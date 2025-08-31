import React, { useState, useEffect } from 'react';
import { Carousel, Card, Modal } from 'react-bootstrap';
import { getImageUrl } from '../../utils/imageUrl';
import { useNavigate } from 'react-router-dom';

import '../../styles/EventBanner.css';

const EventBanner = ({ menuData }) => {
  const [events, setEvents] = useState([]);
  const [imageUploads, setImageUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsToggle, setEventsToggle] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!menuData) {
      setLoading(false);
      return;
    }

    try {
      // Use data from menuData prop
      const eventsEnabled = menuData.cafeSettings?.data?.features?.eventsToggle || false;
      setEventsToggle(eventsEnabled);
      
      // Use events from menuData (already filtered)
      const activeEvents = eventsEnabled ? (menuData.events || []) : [];
      
      // Use image uploads from menuData
      const uploadsData = menuData.cafeSettings?.data?.features?.imageUploadsToggle 
        ? (menuData.imageUploads || []) 
        : [];
      
      setEvents(activeEvents);
      setImageUploads(uploadsData);
    } catch (error) {
      console.error('Error processing event data:', error);
    } finally {
      setLoading(false);
    }
  }, [menuData]);

  const handleEventClick = (event) => {
    navigate('/', { state: { defaultTab: 'events' } });
  };

  const handleImageClick = (upload) => {
    if (upload.message && upload.message.trim()) {
      setSelectedUpload(upload);
      setShowModal(true);
    }
  };

  if (loading || (events.length === 0 && imageUploads.length === 0)) {
    return null; // Don't show anything while loading or if no content
  }

  const allItems = [...(eventsToggle ? events : []), ...imageUploads];

  return (
    <div className="event-banner-container">
      <Carousel 
        indicators={allItems.length > 1}
        controls={allItems.length > 1}
        interval={2000}
        className="event-banner"
      >
        {allItems.map((item) => (
          <Carousel.Item key={item._id || item.eventId}>
            <Card 
              className="event-card"
              onClick={() => item.title ? handleEventClick(item) : handleImageClick(item)}
              style={{ cursor: (item.title || (item.message && item.message.trim())) ? 'pointer' : 'default' }}
            >
              <div className="event-image-container">
                <img 
                  src={item.promotionalImageUrl ? getImageUrl(item.promotionalImageUrl) : getImageUrl(item.imageUrl)} 
                  alt={item.title || item.message} 
                  className="event-image"
                />
              </div>
            </Card>
          </Carousel.Item>
        ))}
      </Carousel>
      
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{selectedUpload?.message}</p>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EventBanner;