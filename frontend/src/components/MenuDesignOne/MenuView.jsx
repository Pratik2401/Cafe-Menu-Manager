import React, { useState, useCallback, useEffect, memo, useMemo } from 'react';
import '../../styles/MenuView.css';
import SearchBar from './SearchBar';
import NavigateBar from './NavigateBar';
import MenuItem from './MenuItem';
import MenuPopup from './MenuPopup';
import { getAllCategories, getCafeSettings, getAllSubCategories } from '../../api/customer';
import TopBar from './TopBar';
import EventBanner from './EventBanner';
import Branding from './Branding';
import FeedbackDrawer from './FeedbackDrawer';
import AllergyNote from './AllergyNote';
import CafeLoader, { LOADER_TYPES } from '../utils/CafeLoader';

const MenuView = memo(() => {
  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const [allSubCategories, setAllSubCategories] = useState({});
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filters, setFilters] = useState({
    veg: false,
    nonveg: false,
    jain: false,
    vegan: false,
    cafeSpeciality: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hasSubCategories, setHasSubCategories] = useState(true);
  const [loading, setLoading] = useState(true);
  const [cafeSettings, setCafeSettings] = useState(null);
  // Removed showBranding state

  // Fetch all categories and cafe settings on component mount
  // Removed scroll event listener for branding

  useEffect(() => {
    // Fetch subcategories for popup
    const fetchSubCategories = async () => {
      try {
        const response = await getAllSubCategories();
        const subCategoriesData = response.data || [];
        
        const grouped = {};
        subCategoriesData.forEach(subCategory => {
          const categoryId = subCategory.category?.serialId;
          if (categoryId !== undefined && !grouped[categoryId]) {
            grouped[categoryId] = [];
          }
          if (categoryId !== undefined) {
            grouped[categoryId].push(subCategory);
          }
        });
        
        setAllSubCategories(grouped);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    };
    
    fetchSubCategories();
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const response = await getAllCategories();
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.categories || []);
        
        setCategories(categoriesData);
        
        // Fetch cafe settings
        const settingsResponse = await getCafeSettings();
        setCafeSettings(settingsResponse.data);
        
        // Check if there's a selected category from Landing Page in localStorage
        const storedCategory = localStorage.getItem('selectedMainCategory');
        if (storedCategory) {
          try {
            const parsedCategory = JSON.parse(storedCategory);
            setSelectedCategory(parsedCategory.id);
          } catch (error) {
            console.error('Error parsing stored category:', error);
            // Fallback to first category if parsing fails
            if (categoriesData.length > 0) {
              setSelectedCategory(categoriesData[0].serialId);
            }
          }
        } else if (categoriesData.length > 0) {
          // Set default category if no stored category and categories are available
          setSelectedCategory(categoriesData[0].serialId);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSubCategorySelect = useCallback((item, subCategories) => {
    setSelectedSubCategory(item);
    setSubCategories(subCategories);
    setHasSubCategories(subCategories && subCategories.length > 0);
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleSubCategoryMatch = useCallback((matchedSubCategory) => {
    setSelectedSubCategory(matchedSubCategory);
  }, []);

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleMenuClick = useCallback(() => {
    setShowMenuPopup(prev => !prev);
  }, []);
  // Set up global function for category updates
  useEffect(() => {
    window.updateCategory = (categoryId) => {
      handleCategoryChange(categoryId);
    };
    
    return () => {
      delete window.updateCategory;
    };
  }, [handleCategoryChange]);

  return (
    <div className="menu-view-container" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {loading ? (
        <CafeLoader 
          type={LOADER_TYPES.COFFEE_POUR} 
          text="Loading menu items..." 
          size={50}
        />
      ) : (
        <div className='menu-view-body'> 
          <TopBar/>
          <Branding/>
          <div className="sticky-search" style={{ position: 'relative' }}>
            <SearchBar
              filters={filters}
              onFiltersChange={updateFilters}
              onSearchChange={handleSearchChange}
              categories={categories}
              onCategoryChange={handleCategoryChange}
              onSubCategorySelect={handleSubCategorySelect}
              onMenuClick={handleMenuClick}
            />
           <MenuPopup 
  show={showMenuPopup}
  categories={categories}
  subCategories={allSubCategories}
  onSubCategorySelect={(subCategory, subCategories) => {
    handleSubCategorySelect(subCategory, subCategories);
    setShowMenuPopup(false);
  }}
  selectedSubCategory={selectedSubCategory}
  onClose={() => setShowMenuPopup(false)}
/>
          </div>
          {/* Event Banner with Modal */}
          <EventBanner />

          {hasSubCategories ? (
            <NavigateBar 
              onSubCategorySelect={handleSubCategorySelect} 
              categoryId={selectedCategory}
              searchQuery={searchQuery}
            />
          ) : null
          }

          <MenuItem
            selectedSubCategory={selectedSubCategory}
            filters={filters}
            searchQuery={searchQuery}
            onSubCategoryMatch={handleSubCategoryMatch}
            hasSubCategories={hasSubCategories}
            onSubCategorySelect={handleSubCategorySelect}
            categoryId={selectedCategory}
            key={selectedSubCategory ? selectedSubCategory._id : 'default'}
            onMenuClick={handleMenuClick}
          />
          
          <AllergyNote />
        </div>
      )}

      <FeedbackDrawer/>
    </div>
  );
});

MenuView.displayName = 'MenuView';

export default MenuView;