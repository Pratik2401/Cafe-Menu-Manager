import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import SearchIcon from '../../assets/images/SearchIcon.png';
import Filter from '../../assets/images/Filter.png';
import { useDebounce } from '../../hooks/useDebounce.js';
import { getImageUrl } from '../../utils/imageUrl';

import '../../styles/SearchBar.css';
import { Button, Modal, Dropdown } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { getFoodCategories, getAllEvents, getAllSubCategories, getCafeSettings } from '../../api/customer';


const NavigationBar = memo(({ onFiltersChange, onSearchChange, categories = [], onCategoryChange, onSubCategorySelect, onMenuClick }) => {
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState(''); // Add search query state
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce search input
  const [localCategories, setLocalCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [hasEvents, setHasEvents] = useState(false);
  const [eventsToggle, setEventsToggle] = useState(false);
  const [shouldShowFilters, setShouldShowFilters] = useState(true);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [subCategoriesMap, setSubCategoriesMap] = useState({});
  const [currentSubcategories, setCurrentSubcategories] = useState([]);
  const [currentCategoryName, setCurrentCategoryName] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  
  // Always fetch food categories for filter and check for events
  // Initialize selected category from localStorage on mount
  useEffect(() => {
    const storedCategory = localStorage.getItem('selectedMainCategory');
    if (storedCategory) {
      try {
        const parsedCategory = JSON.parse(storedCategory);
        setSelectedCategory(parsedCategory.id);
        console.log('Setting selected category on mount:', parsedCategory.id);
      } catch (error) {
        console.error('Error parsing stored category:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Fetch subcategories for dropdown menu
    const fetchSubCategories = async () => {
      try {
        const response = await getAllSubCategories();
        const subCategoriesData = response.data || [];
        
        // Group subcategories by category ID
        const grouped = {};
        subCategoriesData.forEach(subCategory => {
          const categoryId = subCategory.category?.serialId || subCategory.categoryId;
          if (!grouped[categoryId]) {
            grouped[categoryId] = [];
          }
          grouped[categoryId].push(subCategory);
        });
        
        setSubCategoriesMap(grouped);
        
        // Set current subcategories based on selected category
        const storedCategory = localStorage.getItem('selectedMainCategory');
        if (storedCategory) {
          try {
            const parsedCategory = JSON.parse(storedCategory);
            const categoryId = parsedCategory.id;
            if (grouped[categoryId]) {
              setCurrentSubcategories(grouped[categoryId]);
              const category = categories.find(cat => cat.serialId === categoryId);
              setCurrentCategoryName(category ? category.name : '');
            }
          } catch (error) {
            console.error('Error parsing stored category:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    };
    
    fetchSubCategories();
    
    const fetchData = async () => {
      try {
        // Fetch food categories
        const response = await getFoodCategories();
        const foodCategories = response.data || [];
        setLocalCategories(foodCategories);
        
        // Initialize filter state based on food categories
        const initialFilters = {};
        foodCategories.forEach(category => {
          initialFilters[category._id] = false;
        });
        setFilters(initialFilters);
        
        // Set default selected category
        if (foodCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(foodCategories[0].serialId);
          if (onCategoryChange) {
            onCategoryChange(foodCategories[0].serialId);
          }
        }
        
        // Check for events and feature toggle
        try {
          const settingsResponse = await getCafeSettings();
          const eventsEnabled = settingsResponse?.data?.data?.features?.eventsToggle || false;
          setEventsToggle(eventsEnabled);
          
          if (eventsEnabled) {
            const eventsResponse = await getAllEvents({ active: true });
            const hasEventsData = eventsResponse && eventsResponse.data && eventsResponse.data.length > 0;
            setHasEvents(hasEventsData);
          } else {
            setHasEvents(false);
          }
        } catch (eventError) {
          console.error('Error fetching events:', eventError);
          setHasEvents(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [onCategoryChange]);

  // Effect to handle debounced search
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, onSearchChange]);

  const toggleFilterPopup = useCallback(() => {
    setShowFilterPopup(!showFilterPopup);
  }, [showFilterPopup]);

  const handleCheckboxChange = useCallback((e) => {
    const { name, checked } = e.target;
    const updatedFilters = { ...filters, [name]: checked };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  }, [filters, onFiltersChange]);

  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);
    // Don't call onSearchChange directly - let the debounced effect handle it
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    if (onSearchChange) {
      onSearchChange('');
    }
  }, [onSearchChange]);

  // Expose clearSearch function globally
  useEffect(() => {
    window.clearSearchBar = clearSearch;
    return () => {
      delete window.clearSearchBar;
    };
  }, [clearSearch]);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    // Check if we're on special offers pages
    const isOnOffersPage = location.pathname === '/daily-offers' || location.pathname === '/event-offers';
    
    if (isOnOffersPage) {
      // Navigate back to Landing Page
      navigate('/');
    } else {
      // Use the onMenuClick prop to open the sidebar in MenuItem
      if (onMenuClick) {
        onMenuClick();
      }
    }
  };
  
  const handleEventClick = useCallback(() => {
    navigate('/', { state: { showEvents: true } });
  }, [navigate]);
  
  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    // Pass the selected category to parent component
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
    // Also update search with the category
    onSearchChange(debouncedSearchQuery, categoryId);
    
    // Update localStorage to match the selected category
    const category = categories.find(cat => cat.serialId === categoryId);
    if (category) {
      localStorage.setItem('selectedMainCategory', JSON.stringify({
        id: category.serialId,
        name: category.name
      }));
    }
  }, [categories, debouncedSearchQuery, onCategoryChange, onSearchChange]);
  
  // Update subcategories whenever selectedCategory or subCategoriesMap changes
  useEffect(() => {
    if (selectedCategory && subCategoriesMap[selectedCategory]) {
      setCurrentSubcategories(subCategoriesMap[selectedCategory]);
      console.log('Updating subcategories for category:', selectedCategory, subCategoriesMap[selectedCategory]);
      const category = categories.find(cat => cat.serialId === selectedCategory);
      if (category) {
        setCurrentCategoryName(category.name);
      }
    }
  }, [selectedCategory, subCategoriesMap, categories]);
  
  // Check if filters should be shown based on current category
  useEffect(() => {
    const storedCategory = localStorage.getItem('selectedMainCategory');
    if (storedCategory) {
      try {
        const parsedCategory = JSON.parse(storedCategory);
        const isSpecialCategory = parsedCategory.id === 'daily-offers' || parsedCategory.id === 'event-offers';
        setShouldShowFilters(!isSpecialCategory);
      } catch (error) {
        setShouldShowFilters(true);
      }
    } else {
      setShouldShowFilters(true);
    }
  }, [selectedCategory]);


  return (
    <div className='SearchBarContainer'>
      <div className={`SearchBody ${!hasEvents ? 'expanded' : ''}`}>
        <div className='SearchIcon-Container'>
          <img src={SearchIcon} alt="Search Icon" className='SearchIcon-Image' />
        </div>
        <div className='SearchField-Container'>
          <input
            type='text'
            placeholder='Search...'
            className='SearchField-TextBox'
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button 
              className='SearchField-ClearButton'
              onClick={() => {
                setSearchQuery('');
                if (onSearchChange) {
                  onSearchChange('');
                }
              }}
              type='button'
            >
              ×
            </button>
          )}
        </div>
      </div>
      
     
      <div className={`ActionContainer ${!hasEvents ? 'reduced' : ''}`}>
        {shouldShowFilters && (
          <div className='Action-Container' onClick={toggleFilterPopup}>
              <img src={Filter} alt="Filter" style={{ width: '25px', height: '25px' }} onClick={toggleFilterPopup}/>
          </div>
        )}



        {eventsToggle && hasEvents && (
          <div className='Action-Container'>
            <Button className='Event-DropDown' onClick={handleEventClick}>Events</Button>
          </div>
        )}
        
        <div className='Action-Container'>
          <Button className='Menu-DropDown' onClick={handleMenuClick}>
            Menu
          </Button>
        </div>
        


        
        
      </div>

      {/* Filter Modal */}
      <Modal show={showFilterPopup} onHide={toggleFilterPopup} className="filter-modal">
        <Modal.Header closeButton>
          <Modal.Title>Filter By Food Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {localCategories.map(category => (
            <div key={category._id} className="filter-category-item">
              <input 
                type="checkbox" 
                name={category._id} 
                id={`filter-${category._id}`}
                checked={filters[category._id] || false} 
                onChange={handleCheckboxChange}
                className="filter-category-checkbox"
              />
              {category.icon && (
                <img 
                  src={getImageUrl(category.icon)} 
                  alt={category.name} 
                  className="filter-category-icon" 
                />
              )}
              <label htmlFor={`filter-${category._id}`} className="filter-category-name">
                {category.name}
              </label>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={toggleFilterPopup}>
            Cancel
          </Button>
          <Button onClick={() => {
            toggleFilterPopup();
            onFiltersChange(filters);
          }}>
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>
      

    </div>
  );
});

NavigationBar.displayName = 'NavigationBar';

export default NavigationBar;