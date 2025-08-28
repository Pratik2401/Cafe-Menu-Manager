import React, { useState, useEffect } from 'react';
import { Carousel, Card, Modal } from 'react-bootstrap';
import { getImageUrl } from '../../utils/imageUrl';
import { useNavigate } from 'react-router-dom';
import { getAllEvents, getAllImageUploads, getCafeSettings } from '../../api/customer';
import '../../styles/EventBanner.css';

const EventBanner = () => {
  const [events, setEvents] = useState([]);
  const [imageUploads, setImageUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsToggle, setEventsToggle] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cafe settings to check eventsToggle
        const settingsResponse = await getCafeSettings();
        console.log('EventBanner - full settings response:', settingsResponse);
        console.log('EventBanner - features object:', settingsResponse?.data?.features);
        const eventsEnabled = settingsResponse?.data?.data?.features?.eventsToggle || false;
        setEventsToggle(eventsEnabled);
        
        console.log('EventBanner - eventsToggle:', eventsEnabled);
        
        // Fetch events only if eventsToggle is enabled
        let activeEvents = [];
        if (eventsEnabled) {
          const eventsResponse = await getAllEvents({ active: true });
          const eventsData = eventsResponse?.data || [];
          console.log('EventBanner - raw events:', eventsData);
          
          activeEvents = (Array.isArray(eventsData) ? eventsData : []).filter(event => {
            const now = new Date();
            const endDate = new Date(event.endDate);
            const hasValidImage = event.promotionalImageUrl && event.promotionalImageUrl.trim() !== '';
            
            console.log('Event check:', {
              title: event.title,
              isActive: event.isActive,
              hasValidImage,
              endDate: event.endDate,
              endDateParsed: endDate,
              now,
              endDatePassed: now > endDate,
              promotionalImageUrl: event.promotionalImageUrl
            });
            
            if (!event.isActive) {
              console.log('Event filtered out: not active');
              return false;
            }
            if (now > endDate) {
              console.log('Event filtered out: expired');
              return false;
            }
            if (!hasValidImage) {
              console.log('Event filtered out: no valid image');
              return false;
            }
            
            console.log('Event passed all filters');
            return true;
          });
          
          console.log('EventBanner - filtered events:', activeEvents);
        }
        
        // Fetch image uploads only if imageUploadsToggle is enabled
        let uploadsData = [];
        if (settingsResponse?.data?.data?.features?.imageUploadsToggle) {
          const uploadsResponse = await getAllImageUploads();
          uploadsData = uploadsResponse?.data || [];
        }
        
        setEvents(activeEvents);
        setImageUploads(uploadsData);
        
        console.log('EventBanner - final state:', { activeEvents, uploadsData });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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