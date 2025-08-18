import { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import { getActiveDailyOffers } from '../../api/customer';
import '../../styles/MenuItem.css';
import '../../styles/animations.css';
import CafeLoader, { LOADER_TYPES } from '../utils/CafeLoader';

export default function DailyOffersItem({ filters, searchQuery }) {
  const [dailyOffers, setDailyOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDailyOffers = () => {
      setLoading(true);
      try {
        // Get offers from localStorage (set from landing page)
        const storedOffers = localStorage.getItem('dailyOffers');
        if (storedOffers) {
          const offers = JSON.parse(storedOffers);
          setDailyOffers(Array.isArray(offers) ? offers : []);
        } else {
          // Fallback: fetch from API if no stored offers
          fetchDailyOffersFromAPI();
          return;
        }
      } catch (error) {
        console.error('Error loading daily offers from localStorage:', error);
        setDailyOffers([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchDailyOffersFromAPI = async () => {
      try {
        const response = await getActiveDailyOffers();
        const offersData = response?.data?.data || response?.data || [];
        const offers = Array.isArray(offersData) ? offersData : [];
        setDailyOffers(offers);
      } catch (error) {
        console.error('Error fetching daily offers:', error);
        setDailyOffers([]);
      } finally {
        setLoading(false);
      }
    };

    loadDailyOffers();
  }, []);

  const formatPrice = (price) => {
    return price ? `Rs. ${price}` : '';
  };

  // Filter offers based on search query
  const filteredOffers = dailyOffers.filter(dailyOffer => {
    if (!searchQuery) return true;
    
    // Search in daily offer name, description, and individual offer names/descriptions
    const searchLower = searchQuery.toLowerCase();
    return dailyOffer.name.toLowerCase().includes(searchLower) ||
           dailyOffer.description.toLowerCase().includes(searchLower) ||
           dailyOffer.offers.some(offer => 
             offer.name.toLowerCase().includes(searchLower) ||
             offer.description.toLowerCase().includes(searchLower)
           );
  });

  if (loading) {
    return (
      <div className="MenuItemBody">
        <CafeLoader 
          type={LOADER_TYPES.COFFEE_POUR} 
          text="Loading daily offers..." 
          size={35}
        />
      </div>
    );
  }

  if (filteredOffers.length === 0) {
    return (
      <div className="MenuItemBody">
        <div className="no-items-message">
          <h3>No Daily Offers Available</h3>
          <p>Check back later for amazing daily deals!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="MenuItemBody">
      <div className="menu-items-grid">
        {filteredOffers.map((dailyOffer) => 
          dailyOffer.offers.map((offer, index) => (
            <div className="modern-menu-card" key={`${dailyOffer._id}-${index}`}>
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
                            {item.quantity}x {item.name} (Rs. {item.price})
                          </p>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Right Column - Image (30% width) */}
                <div className="menu-card-image-container">
                  {/* Offer Badge */}
              
                  
                  {/* Offer Image */}
                  {offer.imageUrl && (
                    <div className="menu-card-image">
                      <img src={offer.imageUrl} alt={offer.name} className='menu-card-image-css'/>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}