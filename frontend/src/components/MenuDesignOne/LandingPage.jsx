import React, { useEffect, useState } from 'react';
import { getImageUrl } from '../../utils/imageUrl';
import { loadBackgroundImage } from '../../utils/backgroundImageLoader';

import { Container, Row, Col, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/LandingPage.css';
import '../../styles/fonts.css';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation
import { getAllCategories, getAllSocials, getAllSubCategories, getCafeSettings, getActiveDailyOffers } from '../../api/customer';
import { getActiveEvents } from '../../api/customer';
import CafeLoader, { LOADER_TYPES } from '../utils/CafeLoader';
import AgeVerificationModal from './AgeVerificationModal';
import EventCard from './EventCard';


// No longer need fixed social media icons

export default function LandingPage({ onCategorySelect, customMessages }) {
  const [mainCategoryItems, setMainCategoryItems] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]); // State for subcategories
  const [eventItems, setEventItems] = useState([]);
  const [eventOffers, setEventOffers] = useState([]);
  const [hasEventOffers, setHasEventOffers] = useState(false);
  const [dailyOffers, setDailyOffers] = useState([]);
  const [hasDailyOffers, setHasDailyOffers] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const [hasEvents, setHasEvents] = useState(false); // State to track if events exist
  const [showEvents, setShowEvents] = useState(false); // State to toggle between events and categories - defaults to Dine-In
  const [showAgeModal, setShowAgeModal] = useState(false); // State for age verification modal
  const [socialMediaLinks, setSocialMediaLinks] = useState([]); // State for social media links
  const [backgroundImage, setBackgroundImage] = useState(''); // State for background image
  const [processedBackgroundImage, setProcessedBackgroundImage] = useState(''); // State for processed background image
  const [logoUrl, setLogoUrl] = useState(null); // Logo URL state
  const [logoBackgroundColor, setLogoBackgroundColor] = useState(null); // Logo background color state
  const [isAdult, setIsAdult] = useState(() => {
    return localStorage.getItem('isAdult') === 'true';
  }); // State to track if user is 21+
  const navigate = useNavigate(); // Initialize navigate
  const location = useLocation(); // Initialize location to get navigation state
  const baseUrl = import.meta.env.VITE_API_URL_BASE || 'https://topchioutpost.snap2eat.in/'; // Base URL for API

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cafe settings for background image
        try {
          const cafeSettingsResponse = await getCafeSettings();
          if (cafeSettingsResponse?.data?.success && cafeSettingsResponse.data.data.menuCustomization) {
            const { backgroundImage } = cafeSettingsResponse.data.data.menuCustomization;
            if (backgroundImage) {
              setBackgroundImage(backgroundImage);
              
              // Process background image for CORS compatibility
              try {
                const imageUrl = getImageUrl(backgroundImage);
                console.log('🎨 Processing background image:', imageUrl);
                
                // Try to load as data URL first (most reliable for CORS)
                const processedUrl = await loadBackgroundImage(imageUrl, { 
                  useDataUrl: true, 
                  preload: true 
                });
                
                if (processedUrl) {
                  setProcessedBackgroundImage(processedUrl);
                  console.log('✅ Background image processed successfully');
                } else {
                  console.log('⚠️ Background image processing failed, falling back to original URL');
                  setProcessedBackgroundImage(imageUrl);
                }
              } catch (processingError) {
                console.error('❌ Background image processing error:', processingError);
                setProcessedBackgroundImage(getImageUrl(backgroundImage));
              }
            }
          }
        } catch (cafeError) {
          console.error("Error fetching cafe settings:", cafeError);
        }
        
        // Fetch categories
        const categoryResponse = await getAllCategories();
        console.log('🔍 Full category response:', categoryResponse);
        console.log('🔍 Response data:', categoryResponse?.data);
        console.log('🔍 Response data type:', typeof categoryResponse?.data);
        
        // Extract data from axios response and get categories array
        const responseData = categoryResponse?.data || {};
        console.log('🔍 Categories from response:', responseData?.categories);
        console.log('🔍 Categories type:', typeof responseData?.categories);
        console.log('🔍 Is categories array?', Array.isArray(responseData?.categories));
        
        // Backend returns {orderAllowed: boolean, categories: array}
        const categoriesArray = responseData?.categories || [];
        console.log('🔍 Final categories array:', categoriesArray);
        console.log('🔍 Categories array length:', categoriesArray?.length);
        
        const mappedCategories = Array.isArray(categoriesArray) ? categoriesArray.map((category) => ({
          id: category.serialId,
          _id: category._id, // Keep the MongoDB ID for reference
          name: category.name,
          image: category.image,
          isAgeRestricted: category.isAgeRestricted || false
        })) : [];
        
        console.log('🔍 Mapped categories:', mappedCategories);
        console.log('🔍 Mapped categories length:', mappedCategories?.length);
        
        // Fetch subcategories
        const subCategoryResponse = await getAllSubCategories();
        const subCategoriesArray = subCategoryResponse?.data || [];
        
        // Map subcategories with their parent category reference
        const mappedSubCategories = subCategoriesArray.map((subCategory) => ({
          id: subCategory.serialId,
          _id: subCategory._id,
          name: subCategory.name,
          categoryId: subCategory.category?._id || null,
          categoryName: subCategory.category?.name || null,
          image: subCategory.image || 'https://via.placeholder.com/300x200?text=Subcategory',
          isVisible: subCategory.isVisible,
          gstRate: subCategory.gstRate
        }));
        
        setSubCategories(mappedSubCategories);
        
        // Set categories first
        setMainCategoryItems(mappedCategories);
        
        // Check if any category has age restriction
        const hasAgeRestricted = mappedCategories.some(cat => cat.isAgeRestricted);
        
        // If there are age-restricted categories and user hasn't confirmed age yet
        if (hasAgeRestricted && !isAdult) {
          setShowAgeModal(true);
        }
        
        // Filter categories based on age verification
        filterCategories(mappedCategories, isAdult);
        
        // Get active events using customer API
        try {
          const eventsResponse = await getActiveEvents();
          const hasEventsData = eventsResponse && eventsResponse.data && eventsResponse.data.length > 0;
          setHasEvents(hasEventsData);
          
          if (hasEventsData) {
            const activeEvents = eventsResponse.data.filter(event => isEventActive(event.startDate, event.endDate));
            setEventItems(activeEvents);
            setHasEvents(activeEvents.length > 0);
            
            // Extract offers only from active events
            const allOffers = [];
            activeEvents.forEach(event => {
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
        } catch (eventError) {
          console.error("Error fetching events:", eventError);
          setHasEvents(false);
        }
        
        // Fetch social media links
        try {
          const socialsResponse = await getAllSocials();
          const socials = Array.isArray(socialsResponse) ? socialsResponse : (socialsResponse?.data || []);
          
          if (Array.isArray(socials)) {
            const mapped = socials.map(social => ({
              name: social.name,
              icon: social.icon,
              link: social.url,
              _id: social._id
            }));
            
            setSocialMediaLinks(mapped);
          } else {
            console.error('Socials data is not an array:', socials);
            setSocialMediaLinks([]);
          }
        } catch (socialError) {
          console.error('Failed to fetch social links:', socialError);
        }
        
        // Fetch daily offers
        try {
          const dailyOffersResponse = await getActiveDailyOffers();
          const dailyOffersData = dailyOffersResponse?.data?.data || [];
          
          // Filter to only show active daily offers by date and time
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
          
          const activeOffers = dailyOffersData.filter(offer => {
            // Check if offer is active
            if (!offer.isActive) return false;
            
            const startDate = new Date(offer.startDate);
            const endDate = new Date(offer.endDate);
            
            // Check if current date is within range
            if (now < startDate || now > endDate) return false;
            
            // Check if current time is within range
            // Only apply time check if date is the same as start or end date
            const isStartDateToday = startDate.toDateString() === now.toDateString();
            const isEndDateToday = endDate.toDateString() === now.toDateString();
            
            if (isStartDateToday && currentTimeString < offer.startTime) return false;
            if (isEndDateToday && currentTimeString > offer.endTime) return false;
            
            return true;
          });
          
          if (activeOffers.length > 0) {
            setDailyOffers(activeOffers);
            setHasDailyOffers(true);
          } else {
            setHasDailyOffers(false);
          }
        } catch (dailyOffersError) {
          console.error('Failed to fetch daily offers:', dailyOffersError);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Set loading to false when data is fetched
      }
    };

    fetchData();
  }, []); // Remove isAdult dependency
  
  // Separate effect to handle age verification changes
  useEffect(() => {
    if (mainCategoryItems.length > 0) {
      filterCategories(mainCategoryItems, isAdult);
    }
  }, [isAdult, mainCategoryItems]);
  
  // Handle navigation state from EventBanner and SearchBar
  useEffect(() => {
    if (location.state?.scrollToSection === 'events' && location.state?.openEventsMenu) {
      // Open events menu if coming from EventBanner
      setShowEvents(true);
      
      // Scroll to events section after a short delay to ensure DOM is ready
      setTimeout(() => {
        const eventsSection = document.querySelector('.TabsContainer');
        if (eventsSection) {
          eventsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (location.state?.showEvents) {
      // Pre-select Events tab if coming from SearchBar Events button
      setShowEvents(true);
    } else {
      // Always default to Dine-In tab
      setShowEvents(false);
    }
  }, [location.state]);
  
  // Function to filter categories based on age verification
  const filterCategories = (categories, isAdult) => {
    console.log('🔍 Filtering categories:', categories);
    console.log('🔍 Is adult:', isAdult);
    
    if (isAdult) {
      // Show all categories if user is 21+
      console.log('🔍 Setting all categories (adult):', categories);
      setFilteredCategories(categories);
    } else {
      // Filter out age-restricted categories if user is not 21+
      const filtered = categories.filter(cat => !cat.isAgeRestricted);
      console.log('🔍 Setting filtered categories (non-adult):', filtered);
      setFilteredCategories(filtered);
    }
  };

  // Handle main category click
  const handleCategoryClick = (category) => {
    // Check if this category has subcategories
    const categorySubcategories = subCategories.filter(sub => sub.categoryId === category._id);
    
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
      // Clear any previously selected subcategory
      localStorage.removeItem('selectedSubCategory');
    }

    // Notify parent
    onCategorySelect(category.id, category.name);
    
    // Navigate to menu page
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
    // Update filtered categories to show all categories
    filterCategories(mainCategoryItems, true);
  };
  
  // Handle age verification denial
  const handleAgeDeny = () => {
    setIsAdult(false);
    localStorage.setItem('isAdult', 'false');
    setShowAgeModal(false);
    // Update filtered categories to hide age-restricted categories
    filterCategories(mainCategoryItems, false);
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

  // Function to check if event is currently active (not future)
  const isEventCurrentlyActive = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
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

  useEffect(() => {
    const fetchLogoSettings = async () => {
      try {
        const response = await getCafeSettings();
        const data = response?.data?.data;
        
        if (data?.menuCustomization?.logoUrl) {
          setLogoUrl(data.menuCustomization.logoUrl);
        }
        if (data?.menuCustomization?.logoBackgroundColor) {
          setLogoBackgroundColor(data.menuCustomization.logoBackgroundColor);
        }
      } catch (error) {
        console.error('Failed to fetch logo settings:', error);
        setLogoUrl(null);
        setLogoBackgroundColor(null);
      }
    };
    
    fetchLogoSettings();
  }, []);

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
          
          {hasEvents && (
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
            {/* Event Offers Card - Show only when events are currently active and have offers */}
            {hasEventOffers && eventItems.some(event => isEventCurrentlyActive(event.startDate, event.endDate) && event.offers && event.offers.length > 0) && (
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
            
            {/* Daily Offers Cards - Show only when offers are currently active */}
            {hasDailyOffers && dailyOffers.length > 0 && dailyOffers.map((dailyOffer) => (
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
            {console.log('🔍 Rendering filtered categories:', filteredCategories)}
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
            href={item.link}
            target={item.link?.startsWith('http') ? '_blank' : undefined}
            rel={item.link?.startsWith('http') ? 'noopener noreferrer' : undefined}
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