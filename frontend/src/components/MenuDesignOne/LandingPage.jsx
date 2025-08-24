import React, { useEffect, useState } from 'react';
import { getImageUrl } from '../../utils/imageUrl';
import { loadBackgroundImage } from '../../utils/backgroundImageLoader';

import { Container, Row, Col, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/LandingPage.css';
import '../../styles/fonts.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCategories, useSubCategories, useEvents, useSocials, useDailyOffers, useCafeSettings } from '../../hooks/useOptimizedApi';
import CafeLoader, { LOADER_TYPES } from '../utils/CafeLoader';
import AgeVerificationModal from './AgeVerificationModal';
import EventCard from './EventCard';


// No longer need fixed social media icons

export default function LandingPage({ onCategorySelect, customMessages, defaultTab = 'dine-in' }) {
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [eventOffers, setEventOffers] = useState([]);
  const [hasEventOffers, setHasEventOffers] = useState(false);
  const [hasDailyOffers, setHasDailyOffers] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  
  // Use optimized API hooks with caching
  const { data: categoriesData, loading: categoriesLoading } = useCategories();
  const { data: subCategoriesData } = useSubCategories();
  const { data: eventsData, loading: eventsLoading } = useEvents();
  const { data: socialsData } = useSocials();
  const { data: dailyOffersData } = useDailyOffers();
  const { data: cafeSettingsData, loading: settingsLoading } = useCafeSettings();
  
  // Derived state from API data
  const mainCategoryItems = categoriesData?.categories || [];
  const subCategories = subCategoriesData || [];
  const eventItems = eventsData?.data || [];
  const hasEvents = eventItems.length > 0;
  const socialMediaLinks = Array.isArray(socialsData) ? socialsData : (socialsData?.data || []);
  const dailyOffers = dailyOffersData?.data || [];
  const featuresEnabled = cafeSettingsData?.data?.features || { eventsToggle: true, dailyOfferToggle: true };
  const backgroundImage = cafeSettingsData?.data?.menuCustomization?.backgroundImage || '';
  const logoUrl = cafeSettingsData?.data?.menuCustomization?.logoUrl || null;
  const logoBackgroundColor = cafeSettingsData?.data?.menuCustomization?.logoBackgroundColor || null;
  
  // Combined loading state
  const loading = categoriesLoading || eventsLoading || settingsLoading;
  
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [processedBackgroundImage, setProcessedBackgroundImage] = useState('');
  const [isAdult, setIsAdult] = useState(() => {
    return localStorage.getItem('isAdult') === 'true';
  });
  const navigate = useNavigate();
  const location = useLocation();
  
  // Set initial tab based on prop
  useEffect(() => {
    setShowEvents(defaultTab === 'events');
  }, [defaultTab]);

  // Process background image when data is available
  useEffect(() => {
    if (backgroundImage) {
      try {
        const imageUrl = getImageUrl(backgroundImage);
        setProcessedBackgroundImage(imageUrl);
      } catch (processingError) {
        console.error('❌ Background image error:', processingError);
        setProcessedBackgroundImage(getImageUrl(backgroundImage));
      }
    }
  }, [backgroundImage]);
  
  // Process categories and check age restrictions
  useEffect(() => {
    if (mainCategoryItems.length > 0) {
      const mappedCategories = mainCategoryItems.map((category) => ({
        id: category.serialId,
        _id: category._id,
        name: category.name,
        image: category.image,
        isAgeRestricted: category.isAgeRestricted || false
      }));
      
      // Check if any category has age restriction
      const hasAgeRestricted = mappedCategories.some(cat => cat.isAgeRestricted);
      
      // If there are age-restricted categories and user hasn't confirmed age yet
      if (hasAgeRestricted && !isAdult) {
        setShowAgeModal(true);
      }
      
      // Filter categories based on age verification
      filterCategories(mappedCategories, isAdult);
    }
  }, [mainCategoryItems, isAdult]);
  
  // Process events and offers
  useEffect(() => {
    if (eventItems.length > 0) {
      const allOffers = [];
      eventItems.forEach(event => {
        if (event.offers && event.offers.length > 0) {
          event.offers.forEach(offer => {
            allOffers.push({
              ...offer,
              eventTitle: event.title,
              eventImage: event.eventImageUrl,
              eventId: event._id
            });
          });
        }
      });
      
      setEventOffers(allOffers);
      setHasEventOffers(allOffers.length > 0);
    }
  }, [eventItems]);
  
  // Process daily offers
  useEffect(() => {
    if (dailyOffers.length > 0) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      const activeOffers = dailyOffers.filter(offer => {
        if (!offer.isActive) return false;
        
        const startDate = new Date(offer.startDate);
        const endDate = new Date(offer.endDate);
        
        if (now < startDate || now > endDate) return false;
        
        const isStartDateToday = startDate.toDateString() === now.toDateString();
        const isEndDateToday = endDate.toDateString() === now.toDateString();
        
        if (isStartDateToday && currentTimeString < offer.startTime) return false;
        if (isEndDateToday && currentTimeString > offer.endTime) return false;
        
        return true;
      });
      
      setHasDailyOffers(activeOffers.length > 0);
    }
  }, [dailyOffers]);
  

  

  
  // Function to filter categories based on age verification
  const filterCategories = (categories, isAdult) => {
    if (isAdult) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(cat => !cat.isAgeRestricted);
      setFilteredCategories(filtered);
    }
  };

  // Handle main category click
  const handleCategoryClick = (category) => {
    // Map subcategories with proper structure
    const mappedSubCategories = subCategories.map((subCategory) => ({
      id: subCategory.serialId,
      _id: subCategory._id,
      name: subCategory.name,
      categoryId: subCategory.category?._id || null,
      categoryName: subCategory.category?.name || null,
      image: subCategory.image || 'https://via.placeholder.com/300x200?text=Subcategory',
      isVisible: subCategory.isVisible,
      gstRate: subCategory.gstRate
    }));
    
    // Check if this category has subcategories
    const categorySubcategories = mappedSubCategories.filter(sub => sub.categoryId === category._id);
    
    // Save complete category info to localStorage including _id
    localStorage.setItem('selectedMainCategory', JSON.stringify({ 
      id: category.id,
      _id: category._id,
      name: category.name 
    }));
    
    // Store all subcategories for this category
    localStorage.setItem('categorySubcategories', JSON.stringify(categorySubcategories));
    
    // If it has subcategories, save the first one to localStorage
    if (categorySubcategories.length > 0) {
      const firstSubcategory = categorySubcategories[0];
      localStorage.setItem('selectedSubCategory', JSON.stringify({ 
        id: firstSubcategory.id, 
        _id: firstSubcategory._id,
        name: firstSubcategory.name,
        categoryId: firstSubcategory.categoryId,
        categoryName: firstSubcategory.categoryName
      }));
    } else {
      localStorage.removeItem('selectedSubCategory');
    }

    onCategorySelect(category.id, category.name);
    navigate('/menupage');
  };
  
  // Final selection handler for navigation
  const handleFinalSelection = (id, name) => {
    // Save to localStorage
    localStorage.setItem('selectedMainCategory', JSON.stringify({ id, name }));

    // Notify parent
    onCategorySelect(id, name);

    // Navigate to menu page
    navigate('/menupage');
  };
  
  // Handle age verification confirmation
  const handleAgeConfirm = () => {
    setIsAdult(true);
    localStorage.setItem('isAdult', 'true');
    setShowAgeModal(false);
  };
  
  // Handle age verification denial
  const handleAgeDeny = () => {
    setIsAdult(false);
    localStorage.setItem('isAdult', 'false');
    setShowAgeModal(false);
  };

  // Function to show events
  const handleEventsClick = () => {
    setShowEvents(true);
  };

  // Function to show categories (dine-in)
  const handleDineInClick = () => {
    setShowEvents(false);
  };
  
  // Handle event click - navigate to event details page
  const handleEventClick = (event) => {
    navigate(`/events/${event.id}`, { state: { event } });
  };

  // Function to check if event is active or future
  const isEventActive = (startDate, endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    return now <= end; // Show events that haven't ended yet (future + active)
  };

  // Function to check if event is currently active (not future) - using IST
  const isEventCurrentlyActive = (startDate, endDate) => {
    const now = new Date();
    const currentIST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    // Parse start and end dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if current date is within the event date range
    const currentDate = currentIST.toDateString();
    const startDateStr = start.toDateString();
    const endDateStr = end.toDateString();
    
    if (currentDate < startDateStr || currentDate > endDateStr) {
      return false;
    }
    
    // Extract time from start and end
    const startTime = start.getHours() * 60 + start.getMinutes();
    const endTime = end.getHours() * 60 + end.getMinutes();
    const currentTime = currentIST.getHours() * 60 + currentIST.getMinutes();
    
    // Check if current time is within the daily time range
    return currentTime >= startTime && currentTime <= endTime;
  };
  
  // Function to check if there are any currently active event offers
  const hasActiveEventOffers = () => {
    return eventOffers.length > 0 && eventItems.some(event => isEventCurrentlyActive(event.startDate, event.endDate));
  };

  // Handle event offers click - navigate to event offers page
  const handleEventOffersClick = () => {
    localStorage.setItem('selectedMainCategory', JSON.stringify({ 
      id: 'event-offers',
      name: 'Event Offers'
    }));
    localStorage.setItem('eventOffers', JSON.stringify(eventOffers));
    navigate('/event-offers');
  };

  // Handle daily offers click - navigate to daily offers page
  const handleDailyOffersClick = () => {
    localStorage.setItem('selectedMainCategory', JSON.stringify({ 
      id: 'daily-offers',
      name: 'Daily Offers'
    }));
    localStorage.setItem('dailyOffers', JSON.stringify(dailyOffers));
    navigate('/daily-offers');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <CafeLoader 
          type={LOADER_TYPES.COFFEE_CUP} 
          text={customMessages?.loadingText || "Brewing your cafe experience..."} 
          size={50}
        />
      </div>
    );
  }
  return (
  <div className='LandingPageContainer cafe-background' style={processedBackgroundImage ? { backgroundImage: `url(${processedBackgroundImage})` } : {}}>
      
    <Container fluid className="LandingPageBody ">

         <div className="Landing-logo-container" style={logoBackgroundColor ? { backgroundColor: logoBackgroundColor } : {}}>
  {logoUrl && <img src={getImageUrl(logoUrl)} className='LogoHeader' alt="Logo" />}
    </div>
          
      {/* Social Media Links */}
    
          
      {/* Top Bar with Options */}
      <div className="TabsContainer">
        <div className="TabsWrapper">
          <div 
            className={`Tab ${!showEvents ? 'TabActive' : ''}`}
            onClick={handleDineInClick}
          >
            Dine-In
          </div>
          
          {featuresEnabled.eventsToggle && hasEvents && (
            <div 
              className={`Tab ${showEvents ? 'TabActive' : ''}`}
              onClick={handleEventsClick}
            >
              Events
            </div>
          )}
        </div>
      </div>

      {/* Items List - Either Categories or Events */}
      <div className="CategoryItemList">
        {!showEvents ? (
          <>
            {/* Event Offers Card - Show only when events feature is enabled and events are currently active and have offers */}
            {featuresEnabled.eventsToggle && hasEventOffers && eventItems.some(event => isEventCurrentlyActive(event.startDate, event.endDate) && event.offers && event.offers.length > 0) && (
              <div
                className="CategoryItem"
                onClick={handleEventOffersClick}
              >
                <div className="CategoryItem-ImageContainer position-relative overflow-hidden">
                  <img
                    src={getImageUrl(eventItems.find(event => isEventCurrentlyActive(event.startDate, event.endDate) && event.offers && event.offers.length > 0)?.eventImageUrl) || 'https://via.placeholder.com/300x200?text=Event+Offers'}
                    alt="Event Offers"
                    className="CategoryItem-Image object-fit-cover"
                  />
                  <div className="position-absolute top-0 start-0 w-100 h-100 CategoryItem-ImageCover"></div>
                  <div className="CategoryItem-TitleContainer position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-1">
                    <h2 className="CategoryItem-Title text-white text-center m-0">
                      Event Offers
                    </h2>
                  </div>
                </div>
              </div>
            )}
            
            {/* Daily Offers Cards - Show only when daily offers feature is enabled and offers are currently active */}
            {featuresEnabled.dailyOfferToggle && hasDailyOffers && dailyOffers.length > 0 && dailyOffers.map((dailyOffer) => (
              <div
                key={dailyOffer._id}
                className="CategoryItem"
                onClick={handleDailyOffersClick}
              >
                <div className="CategoryItem-ImageContainer position-relative overflow-hidden">
                  <img
                    src={getImageUrl(dailyOffer.backgroundImage) || 'https://via.placeholder.com/300x200?text=Daily+Offer'}
                    alt={dailyOffer.title}
                    className="CategoryItem-Image object-fit-cover"
                  />
                  <div className="position-absolute top-0 start-0 w-100 h-100 CategoryItem-ImageCover"></div>
                  <div className="CategoryItem-TitleContainer position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-1">
                    <h2 className="CategoryItem-Title text-white text-center m-0">
                      {dailyOffer.name}
                    </h2>
                  </div>
                </div>
              </div>
            ))}

            
            
            {/* Show Main Categories */}
            {filteredCategories.map((item) => (
              <div
                key={item.id}
                className="CategoryItem"
                onClick={() => handleCategoryClick(item)}
              >
                <div className="CategoryItem-ImageContainer position-relative overflow-hidden">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="CategoryItem-Image object-fit-cover"
                  />
                  <div className="position-absolute top-0 start-0 w-100 h-100 CategoryItem-ImageCover"></div>
                  <div className="CategoryItem-TitleContainer position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-1">
                    <h2 className="CategoryItem-Title text-white text-center m-0">
                      {item.name}
                    </h2>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          // Show Events - eventItems are already filtered for active events
          eventItems.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        )}
         
      </div>
      {/* Age Verification Modal */}
      <AgeVerificationModal 
        show={showAgeModal} 
        onConfirm={handleAgeConfirm} 
        onDeny={handleAgeDeny} 
      />
       <div className="LandingSocialContainer">
        {socialMediaLinks.map((item) => (
          <a
            key={item._id}
            className="LandingSocial-Icon"
            href={item.url || item.link}
            target={(item.url || item.link)?.startsWith('http') ? '_blank' : undefined}
            rel={(item.url || item.link)?.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            <img
              src={getImageUrl(item.icon)}
              alt={item.name}
              className="LandingSocial-IconImage"
              title={item.name}
              style={{
                width: '30px',
                height: '30px',
                objectFit: 'cover',
                borderRadius: '6px'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </a>
        ))}
      </div>
      <div className='BrandTagging'>
        <p className='BrandTagging-text'>Menu By Snap2Eat</p>
        <a className='BrandTagging-link' href="https://snap2eat.in/" target="_blank" rel="noopener noreferrer">www.snap2eat.in</a>
      </div>
    </Container>
    
    </div>
  );
}