import React, { useState, useCallback, useEffect, memo, useMemo } from 'react';
import '../../styles/MenuView.css';
import SearchBar from './SearchBar';
import NavigateBar from './NavigateBar';
import MenuItem from './MenuItem';
import MenuPopup from './MenuPopup';
import { useMenuData } from '../../hooks/useMenuData';
import TopBar from './TopBar';
import EventBanner from './EventBanner';
import Branding from './Branding';
import FeedbackDrawer from './FeedbackDrawer';
import AllergyNote from './AllergyNote';
import CafeLoader, { LOADER_TYPES } from '../utils/CafeLoader';

const MenuView = memo(() => {
  const { data: menuData, loading } = useMenuData();
  const [showMenuPopup, setShowMenuPopup] = useState(false);
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
  const [hasSubCategories, setHasSubCategories] = useState(true);
  // Removed showBranding state

  // Fetch all categories and cafe settings on component mount
  // Removed scroll event listener for branding

  useEffect(() => {
    if (!loading && menuData.categories.length > 0) {
      // Check if there's a selected category from Landing Page in localStorage
      const storedCategory = localStorage.getItem('selectedMainCategory');
      if (storedCategory) {
        try {
          const parsedCategory = JSON.parse(storedCategory);
          setSelectedCategory(parsedCategory.id);
        } catch (error) {
          console.error('Error parsing stored category:', error);
          // Fallback to first category if parsing fails
          setSelectedCategory(menuData.categories[0].serialId);
        }
      } else {
        // Set default category if no stored category and categories are available
        setSelectedCategory(menuData.categories[0].serialId);
      }
    }
  }, [loading, menuData.categories]);

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
              categories={menuData.categories}
              onCategoryChange={handleCategoryChange}
              onSubCategorySelect={handleSubCategorySelect}
              onMenuClick={handleMenuClick}
              menuData={menuData}
            />
           <MenuPopup 
  show={showMenuPopup}
  categories={menuData.categories}
  subCategories={menuData.subCategoriesGrouped}
  onSubCategorySelect={(subCategory, subCategories) => {
    handleSubCategorySelect(subCategory, subCategories);
    setShowMenuPopup(false);
  }}
  selectedSubCategory={selectedSubCategory}
  onClose={() => setShowMenuPopup(false)}
/>
          </div>
          {/* Event Banner with Modal */}
          <EventBanner menuData={menuData} />

          {hasSubCategories ? (
            <NavigateBar 
              onSubCategorySelect={handleSubCategorySelect} 
              categoryId={selectedCategory}
              searchQuery={searchQuery}
              menuData={menuData}
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
            menuData={menuData}
          />
          
          <AllergyNote />
                <div className='Self-Branding'> 
        <p className='text-muted'>Enjoying the Snap2Eat experience?</p>
        <p className='text-muted'>Head over to our <a href='https://snap2eat.in/' className='Brand-Link'>website</a> to see how we’re transforming menus into digital experiences.</p>
      </div>

        </div>
      )}

      <FeedbackDrawer/>
    </div>
  );
});

MenuView.displayName = 'MenuView';

export default MenuView;