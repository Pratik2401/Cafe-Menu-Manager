import { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUrl';
import { Badge } from 'react-bootstrap';
import '../../styles/MenuItem.css';
import '../../styles/animations.css';
import CafeLoader, { LOADER_TYPES } from '../utils/CafeLoader';

export default function EventOffersItem({ filters, searchQuery }) {
  const [eventOffers, setEventOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEventOffers = () => {
      setLoading(true);
      try {
        // Get offers from localStorage (set from landing page)
        const storedOffers = localStorage.getItem('eventOffers');
        if (storedOffers) {
          const offers = JSON.parse(storedOffers);
          setEventOffers(Array.isArray(offers) ? offers : []);
        } else {
          setEventOffers([]);
        }
      } catch (error) {
        console.error('Error loading event offers from localStorage:', error);
        setEventOffers([]);
      } finally {
        setLoading(false);
      }
    };

    loadEventOffers();
  }, []);

  const formatPrice = (price) => {
    return price ? `Rs. ${price}` : '';
  };

  // Filter offers based on search query
  const filteredOffers = eventOffers.filter(offer => {
    if (!searchQuery) return true;
    
    // Search in offer name, description, and event title
    const searchLower = searchQuery.toLowerCase();
    return offer.name.toLowerCase().includes(searchLower) ||
           offer.description.toLowerCase().includes(searchLower) ||
           offer.eventTitle.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="MenuItemBody">
        <CafeLoader 
          type={LOADER_TYPES.COFFEE_POUR} 
          text="Loading event offers..." 
          size={35}
        />
      </div>
    );
  }

  if (filteredOffers.length === 0) {
    return (
      <div className="MenuItemBody">
        <div className="no-items-message">
          <h3>No Event Offers Available</h3>
          <p>Check back later for amazing event deals!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="MenuItemBody">
      <div className="menu-items-grid">
        {filteredOffers.map((offer, index) => (
          <div className="modern-menu-card" key={`${offer.eventId}-${index}`}>
            <div className="menu-card-content">
              {/* Left Column - Text Content (70% width) */}
              <div className="menu-card-text">
                <div className='Dish-Container'>
                  <h2 className="dish-name">{offer.name.toUpperCase()}</h2>
                  
                </div>
                
                {offer.description && (
                  <p className="dish-description">{offer.description}</p>
                )}
                
                <div className="price-section">
                  <div className="offer-pricing">
                    <span className="original-price">{formatPrice(offer.actualPrice)}</span>
                    <span className="offer-price">{formatPrice(offer.offerPrice)}</span>
                  </div>
                </div>
                
                {offer.items && offer.items.length > 0 && (
                  <div className="addons-section">
                    <p className="addons-heading">Includes:</p>
                    <ul className="addons-list">
                      {offer.items.map((item, itemIndex) => (
                        <p key={itemIndex}>
                          {item.quantity}x {item.name} 
                        </p>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Right Column - Image (30% width) */}
              <div className="menu-card-image-container">
                {/* Offer Image */}
                {offer.imageUrl && (
                  <div className="menu-card-image">
                    <img src={getImageUrl(offer.imageUrl)} alt={offer.name} className='menu-card-image-css'/>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}