import React, { useState, useEffect } from 'react';
import { Carousel, Card, Modal } from 'react-bootstrap';
import { getImageUrl } from '../../utils/imageUrl';
import { useNavigate } from 'react-router-dom';
import { getAllEvents, getAllImageUploads } from '../../api/customer';
import '../../styles/EventBanner.css';

const EventBanner = () => {
  const [events, setEvents] = useState([]);
  const [imageUploads, setImageUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch events
        const eventsResponse = await getAllEvents({ active: true });
        const eventsData = eventsResponse?.data || [];
        const activeEvents = (Array.isArray(eventsData) ? eventsData : []).filter(event => {
          const now = new Date();
          const startDate = new Date(event.startDate);
          const endDate = new Date(event.endDate);
          const hasValidImage = event.promotionalImageUrl && event.promotionalImageUrl.trim() !== '';
          
          if (!event.isActive) return false;
          if (now > endDate) return false; // Event has ended
          if (!hasValidImage) return false;
          
          return true;
        });
        
        // Fetch image uploads
        const uploadsResponse = await getAllImageUploads();
        const uploadsData = uploadsResponse?.data || [];
        
        setEvents(activeEvents);
        setImageUploads(uploadsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEventClick = (event) => {
    navigate('/', { state: { scrollToSection: 'events', openEventsMenu: true } });
  };

  const handleImageClick = (upload) => {
    setSelectedUpload(upload);
    setShowModal(true);
  };

  if (loading || (events.length === 0 && imageUploads.length === 0)) {
    return null; // Don't show anything while loading or if no content
  }

  const allItems = [...events, ...imageUploads];

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