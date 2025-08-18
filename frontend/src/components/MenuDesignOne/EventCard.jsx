import React, { useState } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import { FaLocationDot } from "react-icons/fa6";
import { BsCalendar2DateFill } from "react-icons/bs";
import { FaMoneyBill } from "react-icons/fa";
import { BiSolidNoEntry } from "react-icons/bi";
import '../../styles/EventCard.css';

const EventCard = ({ event }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  // console.log('Event data:', event);

  const baseUrl = import.meta.env.VITE_API_URL_BASE || 'https://topchioutpost.snap2eat.in/';
  const imageUrl = event.eventImageUrl || event.promotionalImageUrl;
  const fullImageUrl = imageUrl?.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;

  return (
    <div>
      <div className="EventCard">
        <div className="EventCard-Banner">
          {!imageLoaded && !imageError && (
            <div className="EventCard-ImageLoader">
              <Spinner animation="border" variant="primary" />
              <p>Loading event image...</p>
            </div>
          )}
          {imageError && (
            <div className="EventCard-ImageError">
              <p>Failed to load image</p>
            </div>
          )}
          <img 
            className={`EventCard-Image ${imageLoaded ? 'loaded' : 'loading'}`}
            src={fullImageUrl} 
            alt={event.title}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{ display: imageLoaded ? 'block' : 'none' }}
          />
        </div>
        
        
        
        <div className={`EventCard-DetailsContainer ${showDetails ? 'show' : ''}`}>
          <div className="EventCard-Description">
            {event.description}
          </div>
          
          <div className="EventCard-Details">
            <div className="EventCard-Detail">
              <FaLocationDot className="EventCard-Icon" />
              <span className="EventCard-DetailText">{event.location}</span>
            </div>
            
            <div className="EventCard-Detail">
              <BsCalendar2DateFill className="EventCard-Icon" />
              <span className="EventCard-DetailText">
                {new Date(event.startDate).toDateString() === new Date(event.endDate).toDateString() 
                  ? `${new Date(event.startDate).toLocaleDateString()}, ${new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : `${new Date(event.startDate).toLocaleDateString()} ${new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.endDate).toLocaleDateString()} ${new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                }
              </span>
            </div>
            
            <div className="EventCard-Detail">
              <FaMoneyBill className="EventCard-Icon" />
              <span className="EventCard-DetailText">
                Entry: {event.entryType === 'free' ? 'Free' : 
                       event.entryType === 'cover' ? `Cover ₹${event.price}` : 
                       `Ticket ₹${event.price}`}
              </span>
            </div>
            
            {event.isAgeRestricted && (
              <div className="EventCard-Detail EventCard-18plus">
                <BiSolidNoEntry className="EventCard-Icon" />
                <span className="EventCard-DetailText">18+ Event Only</span>
              </div>
            )}
            
            {event.tags && event.tags.length > 0 && (
              <div className="EventCard-Tags">
                {event.tags.map((tag, index) => (
                  <span key={index} className="EventCard-Tag">{tag}</span>
                ))}
              </div>
            )}
            
            {event.offers && event.offers.length > 0 && (
              <div className="EventCard-Detail">
                <span className="EventCard-DetailText EventCard-SpecialOffer">
                  Special Offers Available During Event!
                </span>
              </div>
            )}
          </div>
          

        </div>
      </div>
      
      <div className='EventCard-KnowMoreContainer'>
        <button className="EventCard-KnowMore" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'Know Less' : 'Know More'}
        </button>
        {event.registrationFormUrl && event.registrationFormUrl.trim() !== '' && (
          <a 
            href={event.registrationFormUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="EventCard-RegisterBtn"
            onClick={(e) => e.stopPropagation()}
          >
            Register
          </a>
        )}
      </div>
    </div>
  );
};

export default EventCard;